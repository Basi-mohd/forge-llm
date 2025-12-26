import { ChatInterface } from '../components/ChatInterface';
import { Chat, ChatMessage } from '../types';

interface ChatPageProps {
  chat: Chat | null;
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  onMessagesUpdate: (chatId: string, messages: ChatMessage[]) => void;
  onChatModelUpdate: (chatId: string, model: string) => void;
}

export function ChatPage({
  chat,
  models,
  selectedModel,
  onModelChange,
  onMessagesUpdate,
  onChatModelUpdate,
}: ChatPageProps) {
  const handleMessageAdd = (message: ChatMessage) => {
    if (chat) {
      const updatedMessages = [...chat.messages, message];
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
      models={models}
      onModelChange={handleModelChange}
      onMessageAdd={handleMessageAdd}
    />
  );
}

