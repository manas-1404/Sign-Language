"""Modal production deployment for the sign language analysis backend.

Deploys the FastAPI app as a permanent Modal endpoint backed by an A10G GPU.
Gemma 4 weights load from the Modal Volume at cold start — subsequent requests
in the same warm container hit the model directly in GPU RAM.

Deploy:
    python backend/modal_app.py

Environment — Modal Secret named 'sign-language-secrets' must contain:
    INFERENCE_MODE=local
    MODAL_PROXY_API_SECRET=<shared secret matching frontend MODAL_PROXY_API_SECRET>
"""

import sys
from pathlib import Path

import modal

MODEL_ID: str = "google/gemma-4-e4b-it"
VOLUME_NAME: str = "gemma4-weights"
WEIGHTS_PATH: str = "/weights"

# Absolute path to the backend/ directory — works regardless of CWD.
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
    # Copy the entire backend/ package into /root/backend/ inside the container.
    # sys.path gets /root added at startup so `import backend` resolves correctly.
    .add_local_dir(str(_BACKEND_DIR), remote_path="/root/backend")
)


@app.cls(
    gpu="L4",
    image=_backend_image,
    volumes={WEIGHTS_PATH: model_volume},
    secrets=[modal.Secret.from_name("sign-language-secrets")],
    timeout=150,
    scaledown_window=240,
)
class SignLanguageService:
    """Modal deployment class serving the FastAPI backend with Gemma 4 on GPU.

    load_model() runs once per cold start and registers the loaded model on
    the inference module's singletons. All requests in the same warm container
    call the model directly from GPU RAM — no reload, no re-download.
    """

    @modal.enter()
    def load_model(self) -> None:
        """Load Gemma 4 weights from the Modal Volume into GPU RAM.

        Runs exactly once per cold start. Sets INFERENCE_MODE and WEIGHTS_PATH
        env vars so InferenceClientFactory picks up the correct mode, then
        registers the loaded model and processor as module-level singletons
        on the inference module so every subsequent request reuses them.
        """
        import os
        import torch
        from transformers import AutoModelForImageTextToText, AutoProcessor

        sys.path.insert(0, "/root")
        os.environ["INFERENCE_MODE"] = "local"
        os.environ["WEIGHTS_PATH"] = WEIGHTS_PATH

        print(f"Loading {MODEL_ID} from {WEIGHTS_PATH!r}...")
        processor = AutoProcessor.from_pretrained(WEIGHTS_PATH, padding_side="left")
        model = AutoModelForImageTextToText.from_pretrained(
            WEIGHTS_PATH,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            attn_implementation="sdpa",
        )
        print("Model loaded and ready.")

        from backend.utils import inference as _inference_module
        _inference_module._local_model = model
        _inference_module._local_processor = processor

    @modal.asgi_app()
    def serve(self) -> "FastAPI":
        """Return the FastAPI app as the permanent Modal ASGI endpoint.

        load_model() is guaranteed to have completed before this is called,
        so the model singletons and sys.path are already set.
        """
        from backend.app import app as fastapi_app
        return fastapi_app


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    from modal.runner import deploy_app
    deploy_app(app)
