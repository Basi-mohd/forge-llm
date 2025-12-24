const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export interface DownloadModelResponse {
  model_name: string;
  model_path: string;
  status: string;
}

export interface UploadFileResponse {
  filename: string;
  status: string;
  output_file: string;
  size: number;
}

export interface FinetuneParams {
  epochs: number;
  learning_rate: number;
  batch_size: number;
  gradient_accumulation?: number;
  max_length?: number;
  lora_r?: number;
  lora_alpha?: number;
  lora_dropout?: number;
}

export interface FinetuneResponse {
  status: string;
  adapter_path: string;
}

export async function downloadModel(modelName: string): Promise<DownloadModelResponse> {
  const response = await fetch(`${API_BASE_URL}/download-model?model_name=${encodeURIComponent(modelName)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse<DownloadModelResponse>(response);
}

export async function uploadLargeFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload-large`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<UploadFileResponse>(response);
}

export async function finetuneModel(modelName: string, params: FinetuneParams): Promise<FinetuneResponse> {
  const response = await fetch(`${API_BASE_URL}/finetune?model_name=${encodeURIComponent(modelName)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return handleResponse<FinetuneResponse>(response);
}