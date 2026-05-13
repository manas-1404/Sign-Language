"""Modal production deployment for the sign language analysis backend.

Supports two inference modes, selected by setting INFERENCE_MODE in your local
shell BEFORE running the deploy command.  The value must also be present in the
'sign-language-secrets' Modal Secret so containers pick it up at runtime.

Modes
-----
INFERENCE_MODE=local  (default for GPU production)
    Allocates an A100-80GB GPU.  Launches a SGLang HTTP server as a subprocess,
    waits for it to become healthy, then routes all requests through it.
    Requires: weights pre-downloaded into the Modal Volume named VOLUME_NAME.

INFERENCE_MODE=api    (cheaper, no GPU)
    No GPU allocated, no volume mounted.  The orchestrator calls the Google AI
    API directly using GOOGLE_API_KEY from the Modal Secret.

Deploy commands
---------------
# GPU / SGLang mode:
    INFERENCE_MODE=local python backend/modal_app.py

# API mode (no GPU):
    INFERENCE_MODE=api python backend/modal_app.py

IMPORTANT: the value you set locally when running the deploy command controls
which GPU/volume configuration Modal bakes into the deployment.  Make sure the
same value is in your 'sign-language-secrets' Modal Secret so the container
runtime behaviour matches the resource allocation.
"""

import os
import sys
from pathlib import Path

import modal
from fastapi import Body, HTTPException, Query

from backend.config.settings import ApiConfig
from backend.models.schemas import FeedbackResponse, SignRequest

MODEL_ID: str = "google/gemma-4-26b-a4b-it"
VOLUME_NAME: str = "gemma4-26b-a4b-weights"
WEIGHTS_PATH: str = "/weights"
SERVER_PORT: int = 30000

_BACKEND_DIR: Path = Path(__file__).parent

# Read mode at module load time so the @app.cls decorator can conditionally
# request GPU and volume.  This must match the INFERENCE_MODE in the Modal
# Secret — see module docstring for deploy instructions.
_INFERENCE_MODE: str = os.environ.get("INFERENCE_MODE", "api").lower()

app = modal.App("sign-language-backend")

# Volume is only needed when weights are served locally via SGLang.
_model_volume: modal.Volume | None = (
    modal.Volume.from_name(VOLUME_NAME) if _INFERENCE_MODE == "local" else None
)

# Shared pip packages required by both modes.
_COMMON_PACKAGES: list[str] = [
    "fastapi>=0.115.12",
    "uvicorn[standard]>=0.34.2",
    "python-dotenv>=1.1.0",
    "pydantic>=2.11.7",
    "langchain-core>=0.3.55",
    "langchain-google-genai",
    "python-multipart>=0.0.20",
    "Pillow>=10.0.0",
    "requests>=2.32.0",
]

# Local mode: GPU-optimised SGLang base image with the OpenAI client for the
# /v1/chat/completions call to the SGLang server.
_sglang_image = (
    modal.Image.from_registry("lmsysorg/sglang:gemma4")
    .pip_install(*_COMMON_PACKAGES, "openai>=1.0.0")
    .add_local_dir(str(_BACKEND_DIR), remote_path="/root/backend")
)

# API mode: lightweight CPU image — no CUDA, no SGLang, no openai client needed.
_api_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(*_COMMON_PACKAGES)
    .add_local_dir(str(_BACKEND_DIR), remote_path="/root/backend")
)

_backend_image = _sglang_image if _INFERENCE_MODE == "local" else _api_image

# Build @app.cls kwargs conditionally — API mode gets no GPU and no volume.
_cls_kwargs: dict = {
    "image": _backend_image,
    "secrets": [modal.Secret.from_name("sign-language-secrets")],
    "timeout": 600,
    "startup_timeout": 600,
    "scaledown_window": 30,
}
if _INFERENCE_MODE == "local":
    _cls_kwargs["gpu"] = "A100-80GB"
    _cls_kwargs["volumes"] = {WEIGHTS_PATH: _model_volume}
else:
    # Snapshot the container after API-mode initialization so cold starts skip
    # import resolution and orchestrator construction on subsequent boots.
    _cls_kwargs["enable_memory_snapshot"] = True


@app.cls(**_cls_kwargs)
class SignLanguageService:
    """Modal service exposing a FastAPI endpoint for ASL sign analysis.

    Routes to SGLang (local mode) or the Google AI API (api mode) based on
    INFERENCE_MODE.  The mode is fixed at deploy time via the class decorator
    kwargs and confirmed at container startup via the Modal Secret.
    """

    @modal.enter(snap=True)
    def snapshot_init(self) -> None:
        """Run before snapshot: import heavy deps and build the orchestrator.

        Only meaningful in API mode — this state is captured once and restored
        on every subsequent cold start, skipping re-initialization entirely.
        In local (GPU/SGLang) mode this method still runs but snapshotting is
        disabled so it behaves identically to the old single-enter path.
        """
        sys.path.insert(0, "/root")
        self._mode: str = os.environ.get("INFERENCE_MODE", "api").lower()

        if self._mode != "local":
            self._start_api_mode()

    @modal.enter()
    def post_restore_init(self) -> None:
        """Run after snapshot restore (or on first boot in local mode)."""
        if self._mode == "local":
            self._start_sglang_mode()

    def _start_sglang_mode(self) -> None:
        """Launch the SGLang subprocess server and wait until healthy."""
        import subprocess
        import time
        import requests as http

        server_url = f"http://localhost:{SERVER_PORT}"
        print(f"[startup] Launching SGLang server for {MODEL_ID} from {WEIGHTS_PATH!r}...")

        self._server_process = subprocess.Popen([
            "python", "-m", "sglang.launch_server",
            "--model-path", WEIGHTS_PATH,
            "--host", "0.0.0.0",
            "--port", str(SERVER_PORT),
            "--dtype", "bfloat16",
            "--mem-fraction-static", "0.80",
            "--disable-cuda-graph",
        ])

        health_url = f"{server_url}/health"
        for attempt in range(540):
            exit_code = self._server_process.poll()
            if exit_code is not None:
                raise RuntimeError(
                    f"SGLang server process died (exit code {exit_code}) after {attempt}s. "
                    "Check logs above for the crash reason."
                )
            try:
                if http.get(health_url, timeout=2).status_code == 200:
                    print(f"[startup] SGLang server healthy after {attempt}s. Initializing orchestrator...")
                    break
            except Exception:
                pass
            if attempt % 30 == 0 and attempt > 0:
                print(f"[startup] Still waiting for SGLang... ({attempt}s elapsed)")
            time.sleep(1)
        else:
            raise RuntimeError("SGLang server did not become healthy within 540s")

        from backend.agents.orchestrator import SignAnalysisOrchestrator
        self._orchestrator = SignAnalysisOrchestrator(server_url=server_url)
        print("[startup] SGLang orchestrator ready.")

    def _start_api_mode(self) -> None:
        """Initialize the orchestrator for Google AI API inference (no GPU)."""
        from backend.agents.orchestrator import SignAnalysisOrchestrator
        self._orchestrator = SignAnalysisOrchestrator()
        print("[startup] API-mode orchestrator ready.")

    @modal.exit()
    def shutdown(self) -> None:
        """Terminate the SGLang subprocess on container exit (local mode only)."""
        if hasattr(self, "_server_process"):
            self._server_process.terminate()
            try:
                self._server_process.wait(timeout=15)
            except Exception:
                self._server_process.kill()

    @modal.fastapi_endpoint(method="POST")
    async def analyze(
        self,
        tier: int = Query(..., ge=ApiConfig.MIN_TIER, le=ApiConfig.MAX_TIER, description="Learning tier (1 or 2)"),
        content_id: int = Query(..., ge=ApiConfig.MIN_CONTENT_ID, description="Sign or phrase ID within the tier"),
        request_body: SignRequest = Body(...),
    ) -> FeedbackResponse:
        """Analyze a video frame sequence for the specified tier and content item."""
        from backend.utils.debug_image_writer import DebugImageWriter

        DebugImageWriter.save_frames(content_id, request_body.frames)
        try:
            return await self._orchestrator.analyze(tier, content_id, request_body.frames)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    from modal.runner import deploy_app
    deploy_app(app)
