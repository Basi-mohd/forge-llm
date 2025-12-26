from transformers import AutoModelForCausalLM, AutoTokenizer


def make_json(text, model_path):
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        device_map="auto"
    )
    test_prompt = f"""Text: {text}

Generate 5 question-answer pairs in JSON format.

Output ONLY valid JSON array. Do not include any text before or after the JSON.

Format:
[
  {{"question": "...", "answer": "..."}},
  {{"question": "...", "answer": "..."}}
]

JSON output:
["""

    input = tokenizer(test_prompt, return_tensors='pt').to('cuda')
    input_length = input['input_ids'].shape[1]
    output = model.generate(
        **input,
        max_new_tokens=512,
        temperature=0.8,
        do_sample=True
    )
    generated_ids = output[0][input_length:]
    response = tokenizer.decode(generated_ids, skip_special_tokens=True)
    return response
