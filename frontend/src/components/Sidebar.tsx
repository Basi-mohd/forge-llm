import { FineTuningJob } from '../types';

interface SidebarProps {
  jobs: FineTuningJob[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onNewJob: () => void;
}

export const Sidebar = ({ jobs, selectedJobId, onSelectJob, onNewJob }: SidebarProps) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>FineTuner</h1>
      </div>
      <div className="sidebar-content">
        <button className="new-job-button" onClick={onNewJob}>
          + New Job
        </button>
        <div className="jobs-section">
          <h2>My Jobs</h2>
          <div className="jobs-list">
            {jobs.map(job => (
              <div
                key={job.id}
                className={`job-item ${selectedJobId === job.id ? 'active' : ''}`}
                onClick={() => onSelectJob(job.id)}
              >
                <div className="job-name">{job.name}</div>
                <div className={`status-badge status-${job.status}`}>
                  {job.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
