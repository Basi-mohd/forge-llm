import { useState } from 'react';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { FineTuneParams } from '../types';
import { apiService } from '@/lib/api';

interface FineTunePageProps {
  models: string[];
  onJobCreate: (jobName: string, modelName: string, params: FineTuneParams) => void;
}

export function FineTunePage({ models, onJobCreate }: FineTunePageProps) {
  const [selectedModel, setSelectedModel] = useState('');
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [params, setParams] = useState<FineTuneParams>({
    epochs: 2,
    learning_rate: 0.0002,
    batch_size: 1,
    gradient_accumulation: 8,
    max_length: 1024,
    lora_r: 8,
    lora_alpha: 16,
    lora_dropout: 0.05,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTrainingFile(e.target.files[0]);
      setIsUploaded(false);
      setUploadProgress(0);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!trainingFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      await apiService.processDocument(trainingFile, (progress) => {
        setUploadProgress(progress);
      });
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleStartTraining = async () => {
    if (!selectedModel) return;

    setIsTraining(true);
    try {
      await apiService.fineTune(selectedModel, params);

      const jobName = `${selectedModel}-${Date.now()}`;
      onJobCreate(jobName, selectedModel, params);
      
      alert('Fine-tuning job started successfully!');
      
      setTrainingFile(null);
      setIsUploaded(false);
      setUploadProgress(0);
      setIsTraining(false);
    } catch (error) {
      console.error('Error starting fine-tuning:', error);
      alert('Failed to start fine-tuning job. Please try again.');
      setIsTraining(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-foreground mb-8">
          Fine-tune Model
        </h1>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Training File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.json,.jsonl"
                  disabled={isUploading || isUploaded}
                  className="flex-1"
                />
                {trainingFile && (
                  <span className="text-sm text-muted-foreground">
                    {trainingFile.name}
                  </span>
                )}
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-foreground font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {isUploaded && (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>File uploaded and processed successfully</span>
              </div>
            )}

            {uploadError && (
              <div className="text-sm text-red-500">
                {uploadError}
              </div>
            )}

            {!isUploaded && (
              <Button
                onClick={handleFileUpload}
                disabled={!trainingFile || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
            )}
          </div>

          {isUploaded && (
            <div className="space-y-6 border-t border-border pt-6">
              <h2 className="text-xl font-semibold text-foreground">
                Training Configuration
              </h2>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isTraining}
                  placeholder="Enter model name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="epochs">Epochs</Label>
                  <Input
                    id="epochs"
                    type="number"
                    min="1"
                    max="10"
                    value={params.epochs}
                    onChange={(e) =>
                      setParams({ ...params, epochs: parseInt(e.target.value) })
                    }
                    disabled={isTraining}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch_size">Batch Size</Label>
                  <Input
                    id="batch_size"
                    type="number"
                    min="1"
                    max="8"
                    value={params.batch_size}
                    onChange={(e) =>
                      setParams({ ...params, batch_size: parseInt(e.target.value) })
                    }
                    disabled={isTraining}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learning_rate">Learning Rate</Label>
                  <Input
                    id="learning_rate"
                    type="number"
                    step="0.00001"
                    min="0.00001"
                    max="0.0005"
                    value={params.learning_rate}
                    onChange={(e) =>
                      setParams({ ...params, learning_rate: parseFloat(e.target.value) })
                    }
                    disabled={isTraining}
                  />
                </div>
              </div>

              <Button
                onClick={handleStartTraining}
                className="w-full"
                disabled={isTraining || !selectedModel}
                size="lg"
              >
                {isTraining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting Fine-tuning...
                  </>
                ) : (
                  'Start Fine-tuning'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

