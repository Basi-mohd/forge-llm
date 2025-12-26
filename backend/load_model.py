import json
import re

def make_json(text, model_path):
    sentences = text if isinstance(text, list) else [text]
    
    mock_qa_pairs = []
    for i, sentence in enumerate(sentences[:5]):
        if sentence.strip():
            mock_qa_pairs.append({
                "question": f"What is mentioned about: {sentence[:50]}...?",
                "answer": sentence.strip()
            })
    
    result = ""
    for qa in mock_qa_pairs:
        result += f'{{"question": "{qa["question"]}", "answer": "{qa["answer"]}"}},\n'
    
    return result.rstrip(",\n") + "\n" 



