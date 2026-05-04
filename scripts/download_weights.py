"""Download Gemma 4 model weights into a Modal Volume.

Run once before deploying the backend:
    python scripts/download_weights.py

Prerequisites:
    pip install modal huggingface_hub python-dotenv

    Add to your .env file:
        MODAL_TOKEN_ID=ak-...
        MODAL_TOKEN_SECRET=as-...
        HF_TOKEN=hf_...

    Accept the Gemma 4 license at:
        https://huggingface.co/google/gemma-4-e4b-it
"""

import modal

MODEL_ID: str = "google/gemma-4-26b-a4b-it"
VOLUME_NAME: str = "gemma4-26b-a4b-weights"
WEIGHTS_PATH: str = "/weights"

app = modal.App("gemma4-weight-downloader")
model_volume = modal.Volume.from_name(VOLUME_NAME, create_if_missing=True)

_download_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("huggingface_hub[hf_transfer]==0.25.2")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
)


@app.function(
    image=_download_image,
    volumes={WEIGHTS_PATH: model_volume},
    timeout=7200,
)
def download_gemma4_weights(hf_token: str) -> None:
    """Download Gemma 4 weights from HuggingFace Hub into the Modal Volume.

    Uses hf_transfer for maximum download speed. Skips GGUF/GGML quantized
    variants since we load through transformers, not llama.cpp.

    Args:
        hf_token: HuggingFace access token with Gemma 4 permission.
    """
    from huggingface_hub import snapshot_download

    print(f"Downloading {MODEL_ID} into Modal Volume '{VOLUME_NAME}'...")
    snapshot_download(
        repo_id=MODEL_ID,
        local_dir=WEIGHTS_PATH,
        token=hf_token,
        ignore_patterns=["*.gguf", "*.ggml"],
    )
    model_volume.commit()
    print(f"Download complete. Weights stored at '{WEIGHTS_PATH}' in Volume '{VOLUME_NAME}'.")


if __name__ == "__main__":
    import os
    from dotenv import load_dotenv

    load_dotenv()

    hf_token = os.environ.get("HF_TOKEN")
    if not hf_token:
        raise EnvironmentError("HF_TOKEN is not set in your .env file or environment.")

    with modal.enable_output():
        with app.run():
            download_gemma4_weights.remote(hf_token)
