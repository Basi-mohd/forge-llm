from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer
)
import torch
from fastapi import APIRouter, HTTPException
from pathlib import Path
from pydantic import BaseModel, Field
from peft import LoraConfig, get_peft_model
from datasets import load_dataset

router = APIRouter()

# ---------------- SCHEMA ----------------
class FinetuneParams(BaseModel):
    epochs: int = Field(2, ge=1, le=10)
    learning_rate: float = Field(2e-4, ge=1e-5, le=5e-4)
    batch_size: int = Field(1, ge=1, le=8)
    gradient_accumulation: int = Field(8, ge=1, le=32)
    max_length: int = Field(1024, ge=256, le=4096)

    lora_r: int = Field(8, ge=4, le=64)
    lora_alpha: int = Field(16, ge=8, le=128)
    lora_dropout: float = Field(0.05, ge=0.0, le=0.3)


# ---------------- HELPERS ----------------
def attach_lora(model, params: FinetuneParams):
    config = LoraConfig(
        r=params.lora_r,
        lora_alpha=params.lora_alpha,
        lora_dropout=params.lora_dropout,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        bias="none",
        task_type="CAUSAL_LM"
    )
    return get_peft_model(model, config)


def tokenize_dataset(tokenizer, dataset_path, max_length):
    dataset = load_dataset("json", data_files=dataset_path)

    def tokenize(example):
        tokens = tokenizer(
            example["texts"],
            truncation=True,
            max_length=max_length,
            padding="max_length"
        )
        tokens["labels"] = tokens["input_ids"].copy()
        return tokens

    return dataset.map(tokenize, remove_columns=["texts"])


# ---------------- API ----------------
@router.post("/finetune")
async def finetune_model(model_name: str, params: FinetuneParams):
    try:
        model_path = Path(f"../models/{model_name}")
        dataset_path = Path("./output.json")  # produced by Docling

        if not model_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Model {model_name} not found"
            )

        if not dataset_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Dataset not found. Upload document first."
            )

        # ---- Load tokenizer & model ----
        tokenizer = AutoTokenizer.from_pretrained(str(model_path))
        tokenizer.pad_token = tokenizer.eos_token

        model = AutoModelForCausalLM.from_pretrained(
            str(model_path),
            torch_dtype=torch.float16,
            device_map="auto"
        )

        # ---- Attach LoRA ----
        model = attach_lora(model, params)
        model.print_trainable_parameters()

        # ---- Dataset ----
        dataset = tokenize_dataset(
            tokenizer,
            str(dataset_path),
            params.max_length
        )

        # ---- Training args ----
        output_dir = f"../models/adapters/{model_name}-docling"

        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=params.epochs,
            learning_rate=params.learning_rate,
            per_device_train_batch_size=params.batch_size,
            gradient_accumulation_steps=params.gradient_accumulation,
            fp16=True,
            logging_steps=10,
            save_steps=200,
            save_total_limit=2,
            report_to="none"
        )

        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=dataset["train"]
        )

        # ---- Train ----
        trainer.train()

        # ---- Save adapter ----
        model.save_pretrained(output_dir)
        tokenizer.save_pretrained(output_dir)

        return {
            "status": "finetuning_completed",
            "adapter_path": output_dir
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
