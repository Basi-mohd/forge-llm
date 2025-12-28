from fastapi import APIRouter
from pathlib import Path

router = APIRouter()


@router.get("/list-merged-models")
async def list_merged_models():
    try:
        merged_models_dir = Path("../../models/merged")
        
        if not merged_models_dir.exists():
            return {"models": []}
        
        models = []
        for org_dir in merged_models_dir.iterdir():
            if org_dir.is_dir():
                for model_dir in org_dir.iterdir():
                    if model_dir.is_dir():
                        model_path = f"{org_dir.name}/{model_dir.name}"
                        models.append(model_path)
        
        return {"models": sorted(models)}
    except Exception as e:
        return {"models": [], "error": str(e)}

