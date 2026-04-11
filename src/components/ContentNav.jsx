export default function ContentNav({ active, onTab }) {
  const tabs = [
    { id: 'table', label: 'Data Table' },
    { id: 'posts', label: 'Posts' },
    { id: 'scout', label: '⊙ Scout' },
  ];

  return (
    <div className="content-nav">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`content-nav-tab${active === t.id ? ' active' : ''}`}
          onClick={() => onTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
