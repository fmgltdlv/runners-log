export default function Nav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Run' },
    { id: 'lift', label: 'Lift' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
