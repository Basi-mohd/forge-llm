import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { FineTuneJob, Chat } from '../types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: 'fine-tuning' | 'chat';
  onTabChange: (tab: 'fine-tuning' | 'chat') => void;
  jobs: FineTuneJob[];
  chats: Chat[];
  activeJobId?: string;
  activeChatId?: string;
  onJobClick: (jobId: string) => void;
  onChatClick: (chatId: string) => void;
  onNewJob: () => void;
  onNewChat: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  jobs,
  chats,
  activeJobId,
  activeChatId,
  onJobClick,
  onChatClick,
  onNewJob,
  onNewChat,
}: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-[#1a1a1f] border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground">ForgeLLM</h1>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => onTabChange('fine-tuning')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === 'fine-tuning'
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Fine Tuning
        </button>
        <button
          onClick={() => onTabChange('chat')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === 'chat'
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Chat
        </button>
      </div>

      <div className="p-4">
        <Button
          onClick={activeTab === 'fine-tuning' ? onNewJob : onNewChat}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          {activeTab === 'fine-tuning' ? 'New Job' : 'New Chat'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {activeTab === 'fine-tuning' ? 'Jobs' : 'Chats'}
          </h2>
          <div className="space-y-1">
            {activeTab === 'fine-tuning' ? (
              jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                  No jobs yet
                </p>
              ) : (
                jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => onJobClick(job.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      activeJobId === job.id
                        ? "bg-primary/20 text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <div className="font-medium truncate">{job.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {job.status}
                    </div>
                  </button>
                ))
              )
            ) : (
              chats.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                  No chats yet
                </p>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onChatClick(chat.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      activeChatId === chat.id
                        ? "bg-primary/20 text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <div className="font-medium truncate">{chat.name}</div>
                  </button>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

