from fastapi import APIRouter, HTTPException, Query
from pathlib import Path

router = APIRouter()


@router.post("/download-model")
async def download_model(model_name: str = Query(...)):
    try:
        models_dir = Path("../models")
        models_dir.mkdir(parents=True, exist_ok=True)
        
        model_path = models_dir / model_name
        model_path.mkdir(parents=True, exist_ok=True)
        
        info_file = model_path / "model_info.txt"
        with open(info_file, "w") as f:
            f.write(f"Model: {model_name}\nStatus: Mock download (no actual download performed)\n")
        
        return {
            "model_name": model_name,
            "model_path": str(model_path),
            "status": "downloaded"
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    






