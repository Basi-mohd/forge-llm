from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pypdf import PdfReader
import json
from nltk.tokenize import sent_tokenize
from load_model import make_json
import re

router = APIRouter()


async def process_document_stream(file: UploadFile,model_name: str):
    uploaded_filename = f"../uploads/uploaded_{file.filename}"
    with open(uploaded_filename, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            f.write(chunk)

    reader = PdfReader(uploaded_filename)
    total_pages = len(reader.pages)
    output = ""

    yield f"data: {json.dumps({'type': 'total_pages', 'total': total_pages})}\n\n"

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        print(f"Page {i}: {len(text)} characters")
        
        yield f"data: {json.dumps({'type': 'page_start', 'page': i + 1, 'total': total_pages})}\n\n"
        
        sentences = sent_tokenize(text)
        result = make_json(sentences, f'../../models/{model_name}')
        output += result
        
        yield f"data: {json.dumps({'type': 'page_complete', 'page': i + 1, 'total': total_pages})}\n\n"

    pattern = re.compile(
        r'["\']question["\']\s*:\s*["\'](.*?)["\']\s*,\s*["\']answer["\']\s*:\s*["\'](.*?)["\']',
        re.DOTALL
    )
    
    yield f"data: {json.dumps({'type': 'saving', 'message': 'Saving training data...'})}\n\n"
    
    with open("../data/training_data.jsonl", "w", encoding="utf-8") as f:
        for q, a in pattern.findall(output):
            record = {
                "instruction": q.strip(),
                "output": a.strip()
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    
    yield f"data: {json.dumps({'type': 'complete', 'message': 'Processing complete'})}\n\n"


@router.post("/process_doc")
async def upload_large_file(file: UploadFile = File(...)):
    return StreamingResponse(
        process_document_stream(file),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
