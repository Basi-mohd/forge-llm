export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface FineTuningJob {
  id: string;
  name: string;
  status: JobStatus;
  createdAt: Date;
  modelName?: string;
}

export interface Model {
  id: string;
  name: string;
}

export interface InferenceRequest {
  modelId: string;
  prompt: string;
}

export interface InferenceResponse {
  response: string;
}

export interface FineTuneRequest {
  trainingFile: File;
  baseModelId: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
}
