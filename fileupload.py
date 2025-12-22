from fastapi import FastAPI, UploadFile, File, HTTPException
from docling.document_converter import DocumentConverter
from pathlib import Path
import os

app = FastAPI()

@app.post("/upload-large")
async def upload_large_file(file: UploadFile = File(...)):
    # Save in chunks to avoid loading entire file in memory
      with open(f"uploaded_{file.filename}", "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            f.write(chunk)
      
      converter = DocumentConverter()


      result = converter.convert(f"uploaded_{file.filename}")
      markdown_text = result.document.export_to_markdown()

      with open("output.md", "w", encoding="utf-8") as f:   
            f.write(markdown_text)
      os.remove(f"uploaded_{file.filename}")
      return {"filename": file.filename, "status": "saved"}



