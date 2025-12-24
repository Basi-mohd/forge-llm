import { FineTuningJob, Model } from '../types';

export const mockJobs: FineTuningJob[] = [
  {
    id: '1',
    name: 'GPT-3.5 Customer Support',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    modelName: 'gpt-3.5-turbo-finetuned-v1'
  },
  {
    id: '2',
    name: 'Code Assistant Model',
    status: 'running',
    createdAt: new Date('2024-01-20'),
    modelName: 'code-assistant-v2'
  },
  {
    id: '3',
    name: 'Legal Document Analyzer',
    status: 'queued',
    createdAt: new Date('2024-01-22')
  },
  {
    id: '4',
    name: 'Medical Q&A Bot',
    status: 'failed',
    createdAt: new Date('2024-01-18')
  }
];

export const mockModels: Model[] = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5-turbo-finetuned-v1', name: 'GPT-3.5 Turbo Fine-tuned v1' },
  { id: 'code-assistant-v2', name: 'Code Assistant v2' }
];
