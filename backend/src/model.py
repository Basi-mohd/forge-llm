import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/prompting")
def prompting(model_name, message):
    base_model = f'../../models/{model_name}'
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    model_path = f'../../models/merged/{model_name}'
    
    # Important for models without pad token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float16,
        device_map="auto",
    )

    model.eval()

    prompt = message

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=200,
            temperature=0.8,
            top_p=0.9,
            do_sample=True,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id,
        )

    input_length = inputs['input_ids'].shape[1]
    generated_ids = output[0]
    answer = tokenizer.decode(generated_ids, skip_special_tokens=True)

    return answer
