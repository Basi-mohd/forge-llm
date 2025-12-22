from fastapi import APIRouter, HTTPException
from huggingface_hub import snapshot_download
from pathlib import Path

router = APIRouter()


@router.post("/download-model")
async def download_model(model_name: str):
    try:
        models_dir = Path("../models")
        models_dir.mkdir(parents=True, exist_ok=True)
        
        model_path = snapshot_download(
            repo_id=model_name,
            local_dir=str(models_dir / model_name)
        )
        return {
            "model_name": model_name,
            "model_path": str(model_path),
            "status": "downloaded"
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    






