from fastapi import APIRouter, HTTPException, Query, Body
from pathlib import Path
from pydantic import BaseModel, Field
import json
import time

router = APIRouter()


class FinetuneParams(BaseModel):
    epochs: int = Field(2, ge=1, le=10)
    learning_rate: float = Field(2e-4, ge=1e-5, le=5e-4)
    batch_size: int = Field(1, ge=1, le=8)
    gradient_accumulation: int = Field(8, ge=1, le=32)
    max_length: int = Field(1024, ge=256, le=4096)

    lora_r: int = Field(8, ge=4, le=64)
    lora_alpha: int = Field(16, ge=8, le=128)
    lora_dropout: float = Field(0.05, ge=0.0, le=0.3)


@router.post("/finetune")
async def finetune_model(
    model_name: str = Query(...),
    params: FinetuneParams = Body(...)
):
    try:
        model_path = Path(f"../models/{model_name}")
        dataset_path = Path("./training_data.jsonl")

        model_path.mkdir(parents=True, exist_ok=True)

        if not dataset_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Dataset not found. Upload document first."
            )

        time.sleep(2)

        output_dir = Path(f"../models/adapters/{model_name}-docling")
        output_dir.mkdir(parents=True, exist_ok=True)

        info_file = output_dir / "training_info.txt"
        with open(info_file, "w") as f:
            f.write(f"Model: {model_name}\n")
            f.write(f"Epochs: {params.epochs}\n")
            f.write(f"Learning Rate: {params.learning_rate}\n")
            f.write(f"Batch Size: {params.batch_size}\n")
            f.write(f"Status: Mock fine-tuning completed\n")

        return {
            "status": "finetuning_completed",
            "adapter_path": str(output_dir),
            "model_name": model_name
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
