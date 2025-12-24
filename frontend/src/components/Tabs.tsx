interface TabsProps {
  activeTab: 'test' | 'fine-tune';
  onTabChange: (tab: 'test' | 'fine-tune') => void;
}

export const Tabs = ({ activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === 'test' ? 'active' : ''}`}
        onClick={() => onTabChange('test')}
      >
        Test Model
      </button>
      <button
        className={`tab ${activeTab === 'fine-tune' ? 'active' : ''}`}
        onClick={() => onTabChange('fine-tune')}
      >
        Fine-tune Model
      </button>
    </div>
  );
};




