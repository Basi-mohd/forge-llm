from fastapi import FastAPI, UploadFile, File, HTTPException
from huggingface_hub import snapshot_download


app = FastAPI()

@app.post("/")
async def download_model(model_name:str):
    try:
        model_path = snapshot_download(repo_id=model_name,local_dir=f"../models/{model_name}",)
        return {"model_name": model_name, "model_path": model_path}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    






