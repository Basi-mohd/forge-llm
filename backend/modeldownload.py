import os
import json
import shutil
from pathlib import Path
from huggingface_hub import snapshot_download

MODEL_STORE = Path("model_store/models")


def sanitize_model_name(repo_id: str) -> str:
    # meta-llama/Llama-3.1-8B-Instruct → meta-llama_llama-3.1-8b-instruct
    return repo_id.replace("/", "_").lower()


def pull_model(repo_id: str) -> dict:
    """
    Download a model from Hugging Face and register it locally.
    """
    model_id = sanitize_model_name(repo_id)
    model_dir = MODEL_STORE / model_id
    blobs_dir = model_dir / "blobs"

    if model_dir.exists():
        return {
            "status": "already_exists",
            "model_id": model_id
        }

    blobs_dir.mkdir(parents=True, exist_ok=True)

    # 1. Download snapshot from Hugging Face
    snapshot_path = snapshot_download(
        repo_id=repo_id,
        revision="main",
        token=os.getenv("HF_TOKEN"),
        resume_download=True
    )

    # 2. Copy only relevant files
    allowed_suffixes = {".json", ".safetensors", ".model"}

    for file in Path(snapshot_path).iterdir():
        if file.suffix in allowed_suffixes:
            shutil.copy(file, blobs_dir / file.name)

    # 3. Write manifest (this is CRITICAL)
    manifest = {
        "repo_id": repo_id,
        "model_id": model_id,
        "local_path": str(model_dir.resolve()),
        "status": "READY"
    }

    with open(model_dir / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)

    return {
        "status": "downloaded",
        "model_id": model_id
    }
result = pull_model("mistralai/Mistral-7B-Instruct-v0.3")
print(result)