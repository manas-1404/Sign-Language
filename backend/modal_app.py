"""Modal production deployment for the sign language analysis backend.

Deploys a direct web endpoint backed by an L4 GPU. FastAPI is NOT used here —
Modal handles CORS at the infrastructure level, which means OPTIONS preflight
requests are absorbed at the edge and never reach the container.

For local development, run the FastAPI app in backend/app.py instead:
    uvicorn backend.app:app --reload --port 8000

Two-phase startup with memory snapshotting:
  1. load_model_to_cpu (snap=True): loads Gemma 4 weights from the Volume into
     CPU RAM and pre-builds the orchestrator singleton. Modal snapshots the
     full process state here — subsequent cold starts restore in ~2s instead
     of re-reading weights from scratch.
  2. move_model_to_gpu (snap=False): runs after snapshot restore and moves the
     model tensor from CPU to GPU. GPU memory cannot be CRIU-snapshotted, so
     this step always executes, but it is a tensor copy (~5s) not a full reload.

First cold start ever:  weights read from Volume + GPU copy ≈ 30-40s
Snapshot restore (all subsequent cold starts): restore + GPU copy ≈ 5-8s

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

MODEL_ID: str = "google/gemma-4-e4b-it"
VOLUME_NAME: str = "gemma4-weights"
WEIGHTS_PATH: str = "/weights"

_BACKEND_DIR: Path = Path(__file__).parent

app = modal.App("sign-language-backend")
model_volume = modal.Volume.from_name(VOLUME_NAME)

_backend_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi==0.115.12",
        "uvicorn[standard]==0.34.2",
        "python-dotenv==1.1.0",
        "pydantic==2.11.3",
        "langchain-core==0.3.55",
        "python-multipart==0.0.20",
        "torch==2.4.0",
        "torchvision==0.19.0",
        "transformers>=5.5.0",
        "accelerate>=0.34.0",
        "huggingface_hub>=0.25.0",
        "Pillow>=10.0.0",
    )
    .add_local_dir(str(_BACKEND_DIR), remote_path="/root/backend")
)


@app.cls(
    gpu="L4",
    image=_backend_image,
    volumes={WEIGHTS_PATH: model_volume},
    secrets=[modal.Secret.from_name("sign-language-secrets")],
    timeout=60,
    scaledown_window=30,
    enable_memory_snapshot=True,
)
class SignLanguageService:
    """Modal deployment class serving Gemma 4 on GPU via a direct web endpoint.

    Uses two-phase @modal.enter() with memory snapshotting to drastically
    reduce cold start latency. The orchestrator is pre-built at startup and
    reused across all requests — zero per-request setup cost.
    """

    @modal.enter(snap=True)
    def load_model_to_cpu(self) -> None:
        """Load Gemma 4 weights from the Volume into CPU RAM and snapshot.

        snap=True tells Modal to take a CRIU memory snapshot after this method
        completes. The snapshot captures the full Python process state including
        all loaded weights in CPU RAM. Subsequent cold starts restore from the
        snapshot (~2s) instead of re-reading weights from the Volume (~30s).

        The orchestrator singleton is also built here so it is baked into the
        snapshot and requires zero construction on subsequent restores.
        """
        import os
        import torch
        from transformers import AutoModelForImageTextToText, AutoProcessor

        sys.path.insert(0, "/root")
        os.environ["INFERENCE_MODE"] = "local"
        os.environ["WEIGHTS_PATH"] = WEIGHTS_PATH

        print(f"[snap=True] Loading {MODEL_ID} from {WEIGHTS_PATH!r} to CPU...")
        self._processor = AutoProcessor.from_pretrained(WEIGHTS_PATH, padding_side="left")
        self._model = AutoModelForImageTextToText.from_pretrained(
            WEIGHTS_PATH,
            torch_dtype=torch.bfloat16,
            device_map="cpu",  # CPU only so CRIU can snapshot the full tensor state
            attn_implementation="sdpa",
        )
        print("[snap=True] Weights in CPU RAM. Pre-building orchestrator singleton...")

        # Wire up the inference module globals so InferenceClientFactory works.
        # The model is on CPU here; move_model_to_gpu will update _local_model
        # to the GPU copy. _ainvoke_raw reads the global at call time so it
        # automatically picks up the updated GPU reference.
        from backend.utils import inference as _inference_module
        _inference_module._local_processor = self._processor
        _inference_module._local_model = self._model

        # Pre-build the orchestrator and store it on self so the web endpoint
        # method can reuse it across requests with zero construction overhead.
        # No inference runs during __init__ so this is safe on CPU.
        from backend.agents.orchestrator import SignAnalysisOrchestrator
        self._orchestrator = SignAnalysisOrchestrator()
        print("[snap=True] Orchestrator ready. Snapshot will be taken now.")

    @modal.enter(snap=False)
    def move_model_to_gpu(self) -> None:
        """Move model weights from CPU RAM to GPU after snapshot restore.

        snap=False runs after every container start (both first boot and snapshot
        restores). GPU memory cannot be included in a CRIU snapshot, so this
        step always runs. A tensor copy from pinned CPU RAM to L4 VRAM takes
        ~5s — far cheaper than re-reading weights from the Volume.
        """
        from backend.utils import inference as _inference_module

        print("[snap=False] Moving model from CPU RAM to GPU...")
        self._model = self._model.to("cuda")
        # Update the module global so all subsequent _ainvoke_raw calls use
        # the GPU tensor. The orchestrator singleton holds no direct model
        # reference — it always reads through the module global.
        _inference_module._local_model = self._model
        print("[snap=False] Model on GPU. Ready to serve.")

    @modal.fastapi_endpoint(method="POST")
    async def analyze(
        self,
        tier: int = Query(..., ge=ApiConfig.MIN_TIER, le=ApiConfig.MAX_TIER, description="Learning tier (1 or 2)"),
        content_id: int = Query(..., ge=ApiConfig.MIN_CONTENT_ID, description="Sign or phrase ID within the tier"),
        request_body: SignRequest = Body(...),
    ) -> FeedbackResponse:
        """Analyze a video frame sequence for the specified tier and content item.

        Modal handles CORS and OPTIONS preflight at the infrastructure layer —
        no CORS middleware is needed here and OPTIONS never reaches this handler.

        Args:
            tier: Learning tier (1 = individual signs, 2 = short phrases).
            content_id: Numeric ID of the sign or phrase within the tier config.
            request_body: Ordered list of base64-encoded JPEG frames.

        Returns:
            FeedbackResponse with correct/feedback for hand, face, and body.
        """
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
