import axios from 'axios';
import { FineTuneParams } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  chat: async (model: string, prompt: string) => {
    const response = await api.post('/prompting', { model_name: model, message: prompt });
    return { response: response.data };
  },

  fineTune: async (modelName: string, params: FineTuneParams) => {
    const response = await api.post(`/finetune?model_name=${encodeURIComponent(modelName)}`, params);
    return response.data;
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload-large', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  processDocument: async (
    file: File,
    onProgress?: (progress: number) => void,
    onPageProgress?: (currentPage: number, totalPages: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise(async (resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const percentCompleted = Math.round((e.loaded * 100) / e.total);
            onProgress(percentCompleted);
          }
        });

        let buffer = '';

        xhr.addEventListener('readystatechange', () => {
          if (xhr.readyState === XMLHttpRequest.LOADING || xhr.readyState === XMLHttpRequest.DONE) {
            const newData = xhr.responseText.substring(buffer.length);
            buffer = xhr.responseText;

            const lines = newData.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.substring(6));
                  
                  if (data.type === 'total_pages' && onPageProgress) {
                    onPageProgress(0, data.total);
                  } else if (data.type === 'page_start' && onPageProgress) {
                    onPageProgress(data.page, data.total);
                  } else if (data.type === 'page_complete' && onPageProgress) {
                    onPageProgress(data.page, data.total);
                  } else if (data.type === 'complete') {
                    resolve({ success: true });
                    return;
                  }
                } catch (e) {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            if (buffer && !buffer.includes('"type":"complete"')) {
              resolve({ success: true });
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${API_BASE_URL}/process_doc`);
        xhr.send(formData);
      } catch (error) {
        reject(error);
      }
    });
  },
};

