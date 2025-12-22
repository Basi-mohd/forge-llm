from fastapi import APIRouter, UploadFile, File, HTTPException
from docling.document_converter import DocumentConverter
from pathlib import Path
import os

router = APIRouter()


@router.post("/upload-large")
async def upload_large_file(file: UploadFile = File(...)):
    try:
        uploaded_filename = f"uploaded_{file.filename}"
        
        with open(uploaded_filename, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                f.write(chunk)
        
        converter = DocumentConverter()
        result = converter.convert(uploaded_filename)
        markdown_text = result.document.export_to_markdown()
        
        output_path = Path("output.md")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(markdown_text)
        
        os.remove(uploaded_filename)
        
        return {
            "filename": file.filename,
            "status": "saved",
            "output_file": str(output_path),
            "size": len(markdown_text)
        }
    except Exception as e:
        if os.path.exists(uploaded_filename):
            os.remove(uploaded_filename)
        raise HTTPException(status_code=500, detail=str(e))



