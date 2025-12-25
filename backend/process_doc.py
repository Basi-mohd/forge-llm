from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
from pathlib import Path
import os
import json
from nltk.tokenize import sent_tokenize
import nltk
from load_model import make_json
router = APIRouter()



@router.post("/process_doc")
async def upload_large_file(file: UploadFile = File(...)):
    uploaded_filename = f"uploaded_{file.filename}"
    with open(uploaded_filename, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                f.write(chunk)
            



    reader = PdfReader(uploaded_filename)


    output = ""

    for i, page in enumerate(reader.pages):

        text = page.extract_text()
        print(f"Page {i}: {len(text)} characters")
        sentences = sent_tokenize(text)
        result =  make_json(sentences,'../models/Qwen/Qwen2-0.5B')

        
        pattern = re.compile(
            r'["\']question["\']\s*:\s*["\'](.*?)["\']\s*,\s*["\']answer["\']\s*:\s*["\'](.*?)["\']',
            re.DOTALL
        )
        with open(f"training_data.jsonl", "w") as json_file:
            for q, a in pattern.findall(result):
            record = {
                "instruction": q.strip(),
                "output": a.strip()
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


# Convert to LoRA format and save as JSONL

        
        

        


    