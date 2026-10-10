import { SearchX } from 'lucide-react';

export const EmptyState = ({ title = 'No results found', description = '', icon: Icon = SearchX, action }) => (
  <div className="text-center py-16 px-4 fade-in">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
      style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
      <Icon className="w-7 h-7" style={{ color: '#a855f7' }} />
    </div>
    <h3 className="text-base font-bold text-white mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
