import { useState } from 'react';
import { Model, InferenceRequest } from '../types';
import { runInference } from '../mock/api';

interface TestModelProps {
  models: Model[];
}

export const TestModel = ({ models }: TestModelProps) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRunInference = async () => {
    if (!selectedModelId || !prompt.trim()) {
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const request: InferenceRequest = {
        modelId: selectedModelId,
        prompt: prompt.trim()
      };
      const result = await runInference(request);
      setResponse(result.response);
    } catch (error) {
      setResponse('Error: Failed to run inference');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="test-model">
      <div className="form-group">
        <label htmlFor="model-select">Select Model</label>
        <select
          id="model-select"
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
        >
          <option value="">Choose a model...</option>
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="prompt-input">Prompt</label>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={6}
        />
      </div>

      <button
        className="primary-button"
        onClick={handleRunInference}
        disabled={!selectedModelId || !prompt.trim() || isLoading}
      >
        {isLoading ? 'Running...' : 'Run Inference'}
      </button>

      {response && (
        <div className="form-group">
          <label>Response</label>
          <div className="output-box">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};




