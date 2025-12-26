from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import os
import json
import re

router = APIRouter()


@router.post("/process_doc")
async def process_document(file: UploadFile = File(...)):
    try:
        uploaded_filename = f"uploaded_{file.filename}"
        with open(uploaded_filename, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                f.write(chunk)

        with open(uploaded_filename, "rb") as f:
            content = f.read()
            text_content = content[:1000].decode('utf-8', errors='ignore')

        sentences = [s.strip() for s in text_content.split('.') if s.strip()][:10]
        
        output = ""
        for sentence in sentences:
            if len(sentence) > 20:
                qa_pair = f'{{"question": "What does this text say about: {sentence[:30]}...?", "answer": "{sentence}"}},\n'
                output += qa_pair

        pattern = re.compile(
            r'["\']question["\']\s*:\s*["\'](.*?)["\']\s*,\s*["\']answer["\']\s*:\s*["\'](.*?)["\']',
            re.DOTALL
        )
        
        with open("training_data.jsonl", "w", encoding="utf-8") as f:
            for q, a in pattern.findall(output):
                record = {
                    "instruction": q.strip(),
                    "output": a.strip()
                }
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

        return {
            "status": "processed",
            "filename": file.filename,
            "training_data_file": "training_data.jsonl"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
