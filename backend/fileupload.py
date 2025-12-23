from fastapi import APIRouter, UploadFile, File, HTTPException
from docling.document_converter import DocumentConverter
from pathlib import Path
import os
import json

router = APIRouter()


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

        # 3. Export Docling document to JSON-compatible dict
        doc_json = result.document.export_to_dict()

        # 4. Save JSON
        output_path = Path("output.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(doc_json, f, indent=2, ensure_ascii=False)
        os.remove(uploaded_filename)

        return {
            "filename": file.filename,
            "status": "converted",
            "output_file": str(output_path),
            "size": output_path.stat().st_size
        }

    except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))
