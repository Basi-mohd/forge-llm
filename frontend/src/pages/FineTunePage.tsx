import { useState, useEffect, useCallback } from 'react';
import { Upload, Loader2, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { FineTuneParams } from '../types';
import { apiService } from '@/lib/api';

interface FineTunePageProps {
  models: string[];
  onJobCreate: (jobName: string, modelName: string, params: FineTuneParams) => void;
}

export function FineTunePage({ models: _models, onJobCreate }: FineTunePageProps) {
  const [selectedModel, setSelectedModel] = useState('');
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelExists, setModelExists] = useState<boolean | null>(null);
  const [isCheckingModel, setIsCheckingModel] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [processModelName, setProcessModelName] = useState('');
  const [processModelExists, setProcessModelExists] = useState<boolean | null>(null);
  const [isCheckingProcessModel, setIsCheckingProcessModel] = useState(false);
  const [isDownloadingProcessModel, setIsDownloadingProcessModel] = useState(false);
  const [processModelDownloadError, setProcessModelDownloadError] = useState<string | null>(null);
  const [processModelDownloadSuccess, setProcessModelDownloadSuccess] = useState(false);
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
      setCurrentPage(0);
      setTotalPages(0);
      setIsProcessing(false);
    }
  };

  const checkProcessModelExists = useCallback(async (modelName: string) => {
    if (!modelName.trim()) {
      setProcessModelExists(null);
      return;
    }

    setIsCheckingProcessModel(true);
    try {
      const result = await apiService.checkModel(modelName);
      setProcessModelExists(result.exists);
      setProcessModelDownloadError(null);
      setProcessModelDownloadSuccess(false);
    } catch (error) {
      console.error('Error checking process model:', error);
      setProcessModelExists(false);
    } finally {
      setIsCheckingProcessModel(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (processModelName) {
        checkProcessModelExists(processModelName);
      } else {
        setProcessModelExists(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [processModelName, checkProcessModelExists]);

  const handleDownloadProcessModel = async () => {
    if (!processModelName.trim()) return;

    setIsDownloadingProcessModel(true);
    setProcessModelDownloadError(null);
    setProcessModelDownloadSuccess(false);

    try {
      await apiService.downloadModel(processModelName);
      setProcessModelDownloadSuccess(true);
      setProcessModelExists(true);
    } catch (error: any) {
      console.error('Error downloading process model:', error);
      setProcessModelDownloadError(
        error.response?.data?.detail || 'Failed to download model. Please try again.'
      );
    } finally {
      setIsDownloadingProcessModel(false);
    }
  };

  const handleFileUpload = async () => {
    if (!trainingFile) return;
    if (!processModelName.trim()) {
      setUploadError('Please enter a model name before uploading.');
      return;
    }

    if (processModelExists === false) {
      setUploadError('Please download the model first before processing the document.');
      return;
    }

    if (processModelExists === null) {
      await checkProcessModelExists(processModelName);
      if (processModelExists === false) {
        setUploadError('Please download the model first before processing the document.');
        return;
      }
    }

    setIsUploading(true);
    setIsProcessing(true);
    setUploadProgress(0);
    setUploadError(null);
    setCurrentPage(0);
    setTotalPages(0);

    try {
      await apiService.processDocument(
        trainingFile,
        processModelName,
        (progress) => {
          setUploadProgress(progress);
        },
        (page, total) => {
          setCurrentPage(page);
          setTotalPages(total);
        }
      );
      setIsUploaded(true);
      setIsUploading(false);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file. Please try again.');
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
      setCurrentPage(0);
      setTotalPages(0);
    }
  };

  const checkModelExists = useCallback(async (modelName: string) => {
    if (!modelName.trim()) {
      setModelExists(null);
      return;
    }

    setIsCheckingModel(true);
    try {
      const result = await apiService.checkModel(modelName);
      setModelExists(result.exists);
      setDownloadError(null);
      setDownloadSuccess(false);
    } catch (error) {
      console.error('Error checking model:', error);
      setModelExists(false);
    } finally {
      setIsCheckingModel(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedModel) {
        checkModelExists(selectedModel);
      } else {
        setModelExists(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedModel, checkModelExists]);

  const handleDownloadModel = async () => {
    if (!selectedModel.trim()) return;

    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      await apiService.downloadModel(selectedModel);
      setDownloadSuccess(true);
      setModelExists(true);
    } catch (error: any) {
      console.error('Error downloading model:', error);
      setDownloadError(
        error.response?.data?.detail || 'Failed to download model. Please try again.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStartTraining = async () => {
    if (!selectedModel) return;

    if (modelExists === false) {
      setDownloadError('Please download the model first before starting fine-tuning.');
      return;
    }

    if (modelExists === null) {
      await checkModelExists(selectedModel);
      if (modelExists === false) {
        setDownloadError('Please download the model first before starting fine-tuning.');
        return;
      }
    }

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
      setCurrentPage(0);
      setTotalPages(0);
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
              <Label htmlFor="process_model">Model for Document Processing</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="process_model"
                  type="text"
                  value={processModelName}
                  onChange={(e) => setProcessModelName(e.target.value)}
                  disabled={isUploading || isUploaded || isDownloadingProcessModel}
                  placeholder="Enter model name (e.g., Qwen/Qwen2-0.5B)"
                  className="flex-1"
                />
                {isCheckingProcessModel && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {processModelName && processModelExists === false && (
                <div className="space-y-3 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                        Model not found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        The model "{processModelName}" does not exist locally. Please download it from HuggingFace Hub first.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDownloadProcessModel}
                    disabled={isDownloadingProcessModel || isUploading || isUploaded}
                    className="w-full"
                    size="lg"
                  >
                    {isDownloadingProcessModel ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Model
                      </>
                    )}
                  </Button>
                  {processModelDownloadSuccess && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Model downloaded successfully!</span>
                    </div>
                  )}
                  {processModelDownloadError && (
                    <div className="text-sm text-red-500">
                      {processModelDownloadError}
                    </div>
                  )}
                </div>
              )}
              {processModelName && processModelExists === true && (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Model is available</span>
                </div>
              )}
            </div>

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

            {(isUploading || isProcessing) && (
              <div className="space-y-4">
                {isUploading && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading file...</span>
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
                {isProcessing && totalPages > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Processing pages...
                      </span>
                      <span className="text-foreground font-medium">
                        {currentPage} / {totalPages}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: totalPages > 0 
                            ? `${(currentPage / totalPages) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                  </div>
                )}
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
                disabled={!trainingFile || isUploading || !processModelName.trim() || processModelExists === false}
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
                <div className="flex items-center gap-2">
                  <Input
                    id="model"
                    type="text"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isTraining || isDownloading}
                    placeholder="Enter model name (e.g., Qwen/Qwen2-0.5B)"
                    className="flex-1"
                  />
                  {isCheckingModel && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {selectedModel && modelExists === false && (
                  <div className="space-y-3 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                          Model not found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          The model "{selectedModel}" does not exist locally. Please download it from HuggingFace Hub first.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownloadModel}
                      disabled={isDownloading || isTraining}
                      className="w-full"
                      size="lg"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Model
                        </>
                      )}
                    </Button>
                    {downloadSuccess && (
                      <div className="flex items-center gap-2 text-sm text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Model downloaded successfully!</span>
                      </div>
                    )}
                    {downloadError && (
                      <div className="text-sm text-red-500">
                        {downloadError}
                      </div>
                    )}
                  </div>
                )}
                {selectedModel && modelExists === true && (
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Model is available</span>
                  </div>
                )}
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
                      setParams({ ...params, epochs: parseInt(e.target.value) || 0 })
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
                      setParams({ ...params, batch_size: parseInt(e.target.value) || 0 })
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
                      setParams({ ...params, learning_rate: parseFloat(e.target.value) || 0 })
                    }
                    disabled={isTraining}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradient_accumulation">Gradient Accumulation</Label>
                  <Input
                    id="gradient_accumulation"
                    type="number"
                    min="1"
                    max="32"
                    value={params.gradient_accumulation}
                    onChange={(e) =>
                      setParams({ ...params, gradient_accumulation: parseInt(e.target.value) || 0 })
                    }
                    disabled={isTraining}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_length">Max Length</Label>
                  <Input
                    id="max_length"
                    type="number"
                    min="256"
                    max="4096"
                    value={params.max_length}
                    onChange={(e) =>
                      setParams({ ...params, max_length: parseInt(e.target.value) || 0 })
                    }
                    disabled={isTraining}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lora_r">LoRA R</Label>
                  <Input
                    id="lora_r"
                    type="number"
                    min="4"
                    max="64"
                    value={params.lora_r}
                    onChange={(e) =>
                      setParams({ ...params, lora_r: parseInt(e.target.value) || 0 })
                    }
                    disabled={isTraining}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lora_alpha">LoRA Alpha</Label>
                  <Input
                    id="lora_alpha"
                    type="number"
                    min="8"
                    max="128"
                    value={params.lora_alpha}
                    onChange={(e) =>
                      setParams({ ...params, lora_alpha: parseInt(e.target.value) || 0 })
                    }
                    disabled={isTraining}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lora_dropout">LoRA Dropout</Label>
                  <Input
                    id="lora_dropout"
                    type="number"
                    step="0.01"
                    min="0.0"
                    max="0.3"
                    value={params.lora_dropout}
                    onChange={(e) =>
                      setParams({ ...params, lora_dropout: parseFloat(e.target.value) || 0 })
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

