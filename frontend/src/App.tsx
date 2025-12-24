import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Tabs } from './components/Tabs';
import { TestModel } from './components/TestModel';
import { FineTuneModel } from './components/FineTuneModel';
import { FineTuningJob } from './types';
import { mockJobs, mockModels } from './mock/data';

function App() {
  const [jobs, setJobs] = useState<FineTuningJob[]>(mockJobs);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'test' | 'fine-tune'>('test');

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleNewJob = () => {
    setActiveTab('fine-tune');
    setSelectedJobId(null);
  };

  const handleFineTuneSubmit = (jobId: string) => {
    const newJob = jobs.find(j => j.id === jobId);
    if (newJob) {
      setJobs([newJob, ...jobs]);
      setSelectedJobId(jobId);
      setActiveTab('test');
    }
  };

  return (
    <div className="app">
      <Sidebar
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={handleSelectJob}
        onNewJob={handleNewJob}
      />
      <div className="main-panel">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="tab-content">
          {activeTab === 'test' ? (
            <TestModel models={mockModels} />
          ) : (
            <FineTuneModel models={mockModels} onSubmit={handleFineTuneSubmit} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
