# LLM Finetuner

A full-stack application for fine-tuning Large Language Models with document processing capabilities.

## Project Structure

```
llm_finetuner/
├── backend/
│   ├── src/                    # Python source code
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── fileupload.py      # Document upload and conversion (Docling)
│   │   ├── process_doc.py     # PDF processing and dataset creation
│   │   ├── modeldownload.py   # Hugging Face model downloader
│   │   ├── finetune.py        # LoRA fine-tuning logic
│   │   ├── model.py           # Model inference endpoint
│   │   ├── usingthemodel.py   # Model merging utilities
│   │   └── load_model.py      # Model loading and JSON generation
│   ├── uploads/               # Uploaded files (PDFs, documents)
│   └── data/                  # Training data and outputs
│       ├── training_data.json
│       ├── training_data.jsonl
│       ├── output.json
│       └── output.md
│
├── frontend/                  # React/TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── types/
│   └── ...
│
├── models/                    # Model storage (gitignored)
│   ├── base/                  # Base models from Hugging Face
│   ├── adapters/              # LoRA adapters
│   ├── merged/                # Merged models
│   └── offload/               # Model offloading directory
│
└── .gitignore

```

## Features

- **Document Upload**: Upload PDFs and convert them using Docling
- **Dataset Creation**: Automatically generate question-answer pairs from documents
- **Model Management**: Download models from Hugging Face
- **Fine-tuning**: Train models using LoRA (Low-Rank Adaptation)
- **Model Inference**: Test your fine-tuned models

## Backend API Endpoints

- `POST /download-model` - Download a model from Hugging Face
- `POST /upload-large` - Upload and convert documents
- `POST /process_doc` - Process PDFs into training data
- `POST /finetune` - Fine-tune a model with LoRA
- `POST /prompting` - Run inference on a model

## Getting Started

### Backend Setup

```bash
cd backend/src
pip install -r requirements.txt
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Technologies Used

### Backend
- FastAPI
- Transformers (Hugging Face)
- PEFT (Parameter-Efficient Fine-Tuning)
- Docling (Document conversion)
- PyPDF (PDF processing)

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

## Notes

- All uploaded files are stored in `backend/uploads/`
- Training data is generated in `backend/data/`
- Models are stored in the root `models/` directory
- The `models/` directory is gitignored to avoid committing large files
