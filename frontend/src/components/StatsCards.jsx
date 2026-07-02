const cards = [
  { key: 'total', label: 'Total Tasks', color: 'bg-indigo-50 text-indigo-700' },
  { key: 'pending', label: 'Pending', color: 'bg-yellow-50 text-yellow-700' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700' },
  { key: 'completed', label: 'Completed', color: 'bg-green-50 text-green-700' },
  { key: 'overdue', label: 'Overdue', color: 'bg-red-50 text-red-700' },
];

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.key} className={`rounded-xl p-4 ${c.color} shadow-sm`}>
          <p className="text-2xl font-bold">{stats[c.key] ?? 0}</p>
          <p className="text-xs font-medium mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
