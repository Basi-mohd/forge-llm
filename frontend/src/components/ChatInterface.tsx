import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { ChatMessage } from '../types';
import { apiService } from '@/lib/api';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  selectedModel: string;
  fineTunedModels: string[];
  onModelChange: (model: string) => void;
  onMessageAdd: (message: ChatMessage) => void;
}

export function ChatInterface({
  messages,
  selectedModel,
  fineTunedModels,
  onModelChange,
  onMessageAdd,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    onMessageAdd(userMessage);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiService.chat(selectedModel, userInput);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };
      onMessageAdd(assistantMessage);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      onMessageAdd(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground">
                  Select a model and start a conversation
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-muted text-foreground rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  <span className={`text-xs text-muted-foreground mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 max-w-[80%] items-start flex flex-col">
                <div className="bg-muted text-foreground rounded-lg rounded-tl-none px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4 bg-background">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-48"
            disabled={isLoading}
          >
            {fineTunedModels.length === 0 ? (
              <option value="">No models available</option>
            ) : (
              fineTunedModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))
            )}
            {selectedModel && !fineTunedModels.includes(selectedModel) && (
              <option value={selectedModel}>{selectedModel}</option>
            )}
          </Select>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

