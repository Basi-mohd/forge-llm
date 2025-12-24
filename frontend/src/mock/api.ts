import { InferenceRequest, InferenceResponse, FineTuneRequest, FineTuningJob } from '../types';
import { uploadLargeFile, finetuneModel, FinetuneParams } from '../api/client';

export const runInference = async (request: InferenceRequest): Promise<InferenceResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    response: `This is a mock response from ${request.modelId}.\n\nInput: "${request.prompt}"\n\nThe model processed your request and generated this response. In a real system, this would be the actual model output.`
  };
};

export const startFineTuning = async (request: FineTuneRequest): Promise<FineTuningJob> => {
  await uploadLargeFile(request.trainingFile);

  const params: FinetuneParams = {
    epochs: request.epochs,
    learning_rate: request.learningRate,
    batch_size: request.batchSize,
    gradient_accumulation: 8,
    max_length: 1024,
    lora_r: 8,
    lora_alpha: 16,
    lora_dropout: 0.05,
  };

  const result = await finetuneModel(request.baseModelId, params);

  const job: FineTuningJob = {
    id: Date.now().toString(),
    name: `Fine-tune ${request.baseModelId}`,
    status: 'completed',
    createdAt: new Date(),
    modelName: result.adapter_path
  };
  
  return job;
};
