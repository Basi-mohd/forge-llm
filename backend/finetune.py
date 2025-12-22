from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from fastapi import APIRouter, HTTPException
from pathlib import Path

router = APIRouter()


@router.post("/load-model")
async def load_model(model_name: str):
    try:
        model_path = Path(f"../models/{model_name}")
        
        if not model_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Model {model_name} not found. Download it first using /download-model"
            )
        
        tokenizer = AutoTokenizer.from_pretrained(str(model_path))
        tokenizer.pad_token = tokenizer.eos_token

        model = AutoModelForCausalLM.from_pretrained(
            str(model_path),
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        return {
            "status": "model_loaded",
            "model_name": model_name,
            "model_path": str(model_path),
            "device": str(model.device) if hasattr(model, 'device') else "auto"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))