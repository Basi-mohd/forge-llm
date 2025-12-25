from fastapi import APIRouter, UploadFile, File, HTTPException
from docling.document_converter import DocumentConverter
from pathlib import Path
import os
import json

router = APIRouter()


def extract_text_only(doc_json):
    texts = []

    def walk(node):
        if isinstance(node, dict):
            if "text" in node and isinstance(node["text"], str):
                t = node["text"].strip()
                if t:
                    texts.append({"text": t})

            for v in node.values():
                walk(v)

        elif isinstance(node, list):
            for item in node:
                walk(item)

        # ignore strings, numbers, None

    walk(doc_json)
    return {"texts": texts}


@router.post("/upload-large")
async def upload_large_file(file: UploadFile = File(...)):
    uploaded_filename = f"uploaded_{file.filename}"

    try:
        # 1. Save uploaded file in chunks
        with open(uploaded_filename, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                f.write(chunk)

        # 2. Convert document using Docling
        converter = DocumentConverter()
        result = converter.convert(uploaded_filename)

        # 3. Export Docling document to dict
        raw_doc = result.document.export_to_markdown()

        # 4. Extract only text
        output_path = Path("output.md")
        output_path.write_text(raw_doc)
        clean_doc = extract_text_only(result.document.export_to_dict())

        return {
            "filename": file.filename,
            "status": "converted",
            "output_file": str(output_path),
            "text_blocks": len(clean_doc["texts"]),
            "size": output_path.stat().st_size
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
