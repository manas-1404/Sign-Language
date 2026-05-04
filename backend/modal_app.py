"""Modal production deployment for the sign language analysis backend.

Deploys a web endpoint backed by an A100-80GB GPU running a SGLang model server.

Architecture:
    @modal.enter() launches SGLang as a background HTTP server (subprocess),
    polls /health until the model is loaded, then initialises the Python
    orchestrator pointed at http://localhost:30000.  The orchestrator sends
    requests to the server via the OpenAI-compatible /v1/chat/completions API.

Deploy:
    python backend/modal_app.py

Environment — Modal Secret named 'sign-language-secrets' must contain:
    INFERENCE_MODE=local
"""

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

app = modal.App("sign-language-backend")
model_volume = modal.Volume.from_name(VOLUME_NAME)

_backend_image = (
    modal.Image.from_registry("lmsysorg/sglang:gemma4")
    .pip_install(
        "fastapi>=0.115.12",
        "uvicorn[standard]>=0.34.2",
        "python-dotenv>=1.1.0",
        "pydantic>=2.11.7",
        "langchain-core>=0.3.55",
        "langchain-google-genai",
        "openai>=1.0.0",
        "requests>=2.32.0",
        "python-multipart>=0.0.20",
        "Pillow>=10.0.0",
    )
    .add_local_dir(str(_BACKEND_DIR), remote_path="/root/backend")
)


@app.cls(
    gpu="A100-80GB",
    image=_backend_image,
    volumes={WEIGHTS_PATH: model_volume},
    secrets=[modal.Secret.from_name("sign-language-secrets")],
    timeout=600,
    startup_timeout=600,
    scaledown_window=60,
)
class SignLanguageService:
    """Modal service that fronts a SGLang model server with a FastAPI endpoint.

    On startup, SGLang is launched as a subprocess server and the Python
    orchestrator connects to it over localhost.  The server process is
    terminated cleanly on container shutdown.
    """

    @modal.enter()
    def startup(self) -> None:
        """Launch the SGLang server subprocess and wait until it is healthy."""
        import os
        import subprocess
        import time
        import requests as http

        sys.path.insert(0, "/root")
        os.environ["INFERENCE_MODE"] = "local"

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
                    f"SGLang server process died unexpectedly (exit code {exit_code}) "
                    f"after {attempt}s. Check logs above for the crash reason."
                )
            try:
                if http.get(health_url, timeout=2).status_code == 200:
                    print(f"[startup] SGLang server healthy after {attempt}s. Initializing orchestrator...")
                    break
            except Exception:
                pass
            if attempt % 30 == 0 and attempt > 0:
                print(f"[startup] Still waiting for SGLang to become healthy... ({attempt}s elapsed)")
            time.sleep(1)
        else:
            raise RuntimeError("SGLang server did not become healthy within 540s")

        from backend.agents.orchestrator import SignAnalysisOrchestrator
        self._orchestrator = SignAnalysisOrchestrator(server_url=server_url)
        print("[startup] Orchestrator ready. Serving requests.")

    @modal.exit()
    def shutdown(self) -> None:
        """Terminate the SGLang server subprocess on container exit."""
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
