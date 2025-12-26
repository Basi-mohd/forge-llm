from pathlib import Path
import json


def load_and_merge_model(base_model_path: str, lora_path: str):
    base_path = Path(base_model_path)
    lora_path_obj = Path(lora_path)
    merged_path = Path(f"../merged_model/{base_path.name}")
    
    merged_path.mkdir(parents=True, exist_ok=True)
    
    info_file = merged_path / "merge_info.txt"
    with open(info_file, "w") as f:
        f.write(f"Base Model: {base_model_path}\n")
        f.write(f"LoRA Adapter: {lora_path}\n")
        f.write(f"Status: Mock merge completed\n")
    
    return str(merged_path)


def merge_model(model_name):
    model_path = f'../models/{model_name}'
    adapter_path = f'../models/adapters/{model_name}'
    return load_and_merge_model(model_path, adapter_path)

