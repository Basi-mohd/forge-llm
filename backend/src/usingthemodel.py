import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import os


def merge_model(model_name):
    model_path = f'../../models/{model_name}'
    adapter_path = f'../../models/adapters/{model_name}'
    output_path = f'../../models/merged/{model_name}'
    offload_path = '../../models/offload'

    os.makedirs(offload_path, exist_ok=True)
    os.makedirs(output_path, exist_ok=True)

    print(f"Loading base model from: {model_path}")
    base_model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float16,
        device_map='auto',
        offload_folder=offload_path,
        offload_state_dict=True
    )

    print(f"Loading LoRA adapter from: {adapter_path}")
    model = PeftModel.from_pretrained(
        base_model,
        adapter_path,
        is_trainable=False
    )

    print("Merging adapter with base model...")
    merged_model = model.merge_and_unload()

    print(f"Saving merged model to: {output_path}")
    merged_model.save_pretrained(output_path)

    print("Saving tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    tokenizer.save_pretrained(output_path)

    print("Merge complete!")
