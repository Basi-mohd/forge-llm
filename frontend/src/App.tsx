import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { FineTunePage } from './pages/FineTunePage';
import { ChatPage } from './pages/ChatPage';
import { FineTuneJob, Chat, ChatMessage, FineTuneParams } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'fine-tuning' | 'chat'>('fine-tuning');
  const [jobs, setJobs] = useState<FineTuneJob[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | undefined>();
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState('llama-2-7b-chat-hf');

  const models = ['llama-2-7b-chat-hf', 'mistral-7b-instruct-v0.2', 'phi-2'];

  const handleNewJob = () => {
    setActiveTab('fine-tuning');
    setActiveJobId(undefined);
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      model: selectedModel,
      createdAt: new Date().toISOString(),
    };
    setChats([...chats, newChat]);
    setActiveChatId(newChat.id);
    setActiveTab('chat');
  };

  const handleJobClick = (jobId: string) => {
    setActiveJobId(jobId);
    setActiveTab('fine-tuning');
  };

  const handleChatClick = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveTab('chat');
  };

  const handleJobCreate = (jobName: string, modelName: string, params: FineTuneParams) => {
    const newJob: FineTuneJob = {
      id: Date.now().toString(),
      name: jobName,
      status: 'running',
      modelName: modelName,
      createdAt: new Date().toISOString(),
    };
    setJobs([...jobs, newJob]);
    setActiveJobId(newJob.id);
  };

  const handleMessagesUpdate = (chatId: string, messages: ChatMessage[]) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, messages } : chat
    ));
  };

  const handleChatModelUpdate = (chatId: string, model: string) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, model } : chat
    ));
  };

  const activeChat = chats.find(chat => chat.id === activeChatId);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        jobs={jobs}
        chats={chats}
        activeJobId={activeJobId}
        activeChatId={activeChatId}
        onJobClick={handleJobClick}
        onChatClick={handleChatClick}
        onNewJob={handleNewJob}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col">
        {activeTab === 'fine-tuning' ? (
          <FineTunePage
            models={models}
            onJobCreate={handleJobCreate}
          />
        ) : (
          <ChatPage
            chat={activeChat || null}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onMessagesUpdate={handleMessagesUpdate}
            onChatModelUpdate={handleChatModelUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default App;

