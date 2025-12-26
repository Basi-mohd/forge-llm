from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
import json
from nltk.tokenize import sent_tokenize
from load_model import make_json
import re

router = APIRouter()


@router.post("/process_doc")
async def upload_large_file(file: UploadFile = File(...)):
    uploaded_filename = f"../uploads/uploaded_{file.filename}"
    with open(uploaded_filename, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            f.write(chunk)

    reader = PdfReader(uploaded_filename)
    output = ""

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        print(f"Page {i}: {len(text)} characters")
        sentences = sent_tokenize(text)
        result = make_json(sentences, '../../models/Qwen/Qwen2-0.5B')
        output += result

    pattern = re.compile(
        r'["\']question["\']\s*:\s*["\'](.*?)["\']\s*,\s*["\']answer["\']\s*:\s*["\'](.*?)["\']',
        re.DOTALL
    )
    with open("../data/training_data.jsonl", "w", encoding="utf-8") as f:
        for q, a in pattern.findall(output):
            record = {
                "instruction": q.strip(),
                "output": a.strip()
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
