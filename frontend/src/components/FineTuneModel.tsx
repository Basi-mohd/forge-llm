import { useState } from 'react';
import { Model, FineTuneRequest } from '../types';
import { startFineTuning } from '../mock/api';

interface FineTuneModelProps {
  models: Model[];
  onSubmit: (jobId: string) => void;
}

export const FineTuneModel = ({ models, onSubmit }: FineTuneModelProps) => {
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [baseModelId, setBaseModelId] = useState<string>('');
  const [epochs, setEpochs] = useState<number>(3);
  const [batchSize, setBatchSize] = useState<number>(4);
  const [learningRate, setLearningRate] = useState<number>(0.0001);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrainingFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trainingFile || !baseModelId) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const request: FineTuneRequest = {
        trainingFile,
        baseModelId,
        epochs,
        batchSize,
        learningRate
      };
      const job = await startFineTuning(request);
      onSubmit(job.id);
      
      setTrainingFile(null);
      setBaseModelId('');
      setEpochs(3);
      setBatchSize(4);
      setLearningRate(0.0001);
      
      const fileInput = document.getElementById('training-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Failed to start fine-tuning:', error);
      setError(error instanceof Error ? error.message : 'Failed to start fine-tuning. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fine-tune-model">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="training-file">Training File</label>
          <input
            id="training-file"
            type="file"
            accept=".pdf,.json,.jsonl"
            onChange={handleFileChange}
            required
          />
          {trainingFile && (
            <div className="file-info">Selected: {trainingFile.name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="base-model-select">Base Model</label>
          <select
            id="base-model-select"
            value={baseModelId}
            onChange={(e) => setBaseModelId(e.target.value)}
            required
          >
            <option value="">Choose a base model...</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hyperparameters">
          <div className="form-group">
            <label htmlFor="epochs">Epochs</label>
            <input
              id="epochs"
              type="number"
              min="1"
              max="100"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value) || 3)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="batch-size">Batch Size</label>
            <input
              id="batch-size"
              type="number"
              min="1"
              max="128"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value) || 4)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="learning-rate">Learning Rate</label>
            <input
              id="learning-rate"
              type="number"
              min="0.00001"
              max="1"
              step="0.00001"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.0001)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={!trainingFile || !baseModelId || isSubmitting}
        >
          {isSubmitting ? 'Starting...' : 'Start Fine-tuning'}
        </button>
      </form>
    </div>
  );
};




