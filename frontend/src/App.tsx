import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { FineTunePage } from './pages/FineTunePage';
import { ChatPage } from './pages/ChatPage';
import { FineTuneJob, Chat, ChatMessage, FineTuneParams } from './types';

const STORAGE_KEYS = {
  JOBS: 'forge-llm-jobs',
  CHATS: 'forge-llm-chats',
  ACTIVE_JOB_ID: 'forge-llm-active-job-id',
  ACTIVE_CHAT_ID: 'forge-llm-active-chat-id',
  SELECTED_MODEL: 'forge-llm-selected-model',
  MODELS: 'forge-llm-models',
} as const;

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

function App() {
  const [activeTab, setActiveTab] = useState<'fine-tuning' | 'chat'>('fine-tuning');
  const [jobs, setJobs] = useState<FineTuneJob[]>(() => 
    loadFromStorage<FineTuneJob[]>(STORAGE_KEYS.JOBS, [])
  );
  const [chats, setChats] = useState<Chat[]>(() => 
    loadFromStorage<Chat[]>(STORAGE_KEYS.CHATS, [])
  );
  const [activeJobId, setActiveJobId] = useState<string | undefined>(() => {
    const savedJobId = loadFromStorage<string | undefined>(STORAGE_KEYS.ACTIVE_JOB_ID, undefined);
    const savedJobs = loadFromStorage<FineTuneJob[]>(STORAGE_KEYS.JOBS, []);
    if (savedJobId && savedJobs.some(job => job.id === savedJobId)) {
      return savedJobId;
    }
    return undefined;
  });
  const [activeChatId, setActiveChatId] = useState<string | undefined>(() => {
    const savedChatId = loadFromStorage<string | undefined>(STORAGE_KEYS.ACTIVE_CHAT_ID, undefined);
    const savedChats = loadFromStorage<Chat[]>(STORAGE_KEYS.CHATS, []);
    if (savedChatId && savedChats.some(chat => chat.id === savedChatId)) {
      return savedChatId;
    }
    return undefined;
  });
  const [selectedModel, setSelectedModel] = useState(() => 
    loadFromStorage<string>(STORAGE_KEYS.SELECTED_MODEL, 'llama-2-7b-chat-hf')
  );
  const [models, setModels] = useState<string[]>(() => 
    loadFromStorage<string[]>(STORAGE_KEYS.MODELS, ['llama-2-7b-chat-hf', 'mistral-7b-instruct-v0.2', 'phi-2'])
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.JOBS, jobs);
  }, [jobs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CHATS, chats);
  }, [chats]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_JOB_ID, activeJobId);
  }, [activeJobId]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_CHAT_ID, activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SELECTED_MODEL, selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MODELS, models);
  }, [models]);

  const handleAddModel = (modelName: string) => {
    if (modelName.trim() && !models.includes(modelName.trim())) {
      const updatedModels = [...models, modelName.trim()];
      setModels(updatedModels);
      setSelectedModel(modelName.trim());
    }
  };

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
    setChats(prevChats => prevChats.map(chat => 
      chat.id === chatId ? { ...chat, messages } : chat
    ));
  };

  const handleChatModelUpdate = (chatId: string, model: string) => {
    setChats(prevChats => prevChats.map(chat => 
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
            jobs={jobs}
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
