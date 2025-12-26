import { useEffect, useRef } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { Chat, ChatMessage, FineTuneJob } from '../types';

interface ChatPageProps {
  chat: Chat | null;
  jobs: FineTuneJob[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  onMessagesUpdate: (chatId: string, messages: ChatMessage[]) => void;
  onChatModelUpdate: (chatId: string, model: string) => void;
}

export function ChatPage({
  chat,
  jobs,
  selectedModel,
  onModelChange,
  onMessagesUpdate,
  onChatModelUpdate,
}: ChatPageProps) {
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    if (chat) {
      messagesRef.current = chat.messages;
    }
  }, [chat?.messages]);

  const handleMessageAdd = (message: ChatMessage) => {
    if (chat) {
      const updatedMessages = [...messagesRef.current, message];
      messagesRef.current = updatedMessages;
      onMessagesUpdate(chat.id, updatedMessages);
    }
  };

  const handleModelChange = (model: string) => {
    onModelChange(model);
    if (chat) {
      onChatModelUpdate(chat.id, model);
    }
  };

  const currentModel = chat?.model || selectedModel;
  const fineTunedModels = Array.from(new Set(jobs.map(job => job.modelName)));

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            No chat selected
          </h2>
          <p className="text-muted-foreground">
            Create a new chat to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      messages={chat.messages}
      selectedModel={currentModel}
      fineTunedModels={fineTunedModels}
      onModelChange={handleModelChange}
      onMessageAdd={handleMessageAdd}
    />
  );
}

