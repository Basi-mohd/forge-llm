import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
from pathlib import Path
import traceback
import sys
import json

def merge_model(model_name):
    model_path = f'../models/{model_name}'
    base_model = AutoModelForCausalLM.from_pretrained (
        model_path,
        device_map = 'auto',
        offload_dir = '../offload'

    )
    model = PeftModel.from_pretrained(base_model,f'../models/adapters/{model_name}')
    merged_model = model.merge_and_unload()
    merged_model.save_pretrained(f'../merged_model/{model_name}')
    tokenizer = AutoTokenizer.from_pretrained(f'../models/{model_name}')
    tokenizer.save_pretrained(f"../merged_model/{model_name}")

merge_model('stabilityai/stablelm-2-zephyr-1_6b')

