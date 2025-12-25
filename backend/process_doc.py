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
        output+=result
        print(output)
    with open(f"training_data.json", "w") as json_file:
        json.dump(output, json_file, indent=2)


# Convert to LoRA format and save as JSONL

        
        

        


    