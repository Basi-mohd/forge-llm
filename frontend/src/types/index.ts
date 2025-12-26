export interface FineTuneJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  modelName: string;
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: ChatMessage[];
  model: string;
  createdAt: string;
}

export interface FineTuneParams {
  epochs: number;
  learning_rate: number;
  batch_size: number;
  gradient_accumulation: number;
  max_length: number;
  lora_r: number;
  lora_alpha: number;
  lora_dropout: number;
}

export interface Model {
  name: string;
  path: string;
}

