import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const delta = 2;
  const pages = [];
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i);

  const btnBase = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94a3b8',
  };
  const btnActive = {
    background: 'linear-gradient(135deg,#9333ea,#7c3aed)',
    border: '1px solid rgba(168,85,247,0.4)',
    color: '#fff',
    boxShadow: '0 0 12px rgba(168,85,247,0.25)',
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        className="p-2 rounded-xl transition-all disabled:opacity-30"
        style={btnBase}
        onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
        <ChevronLeft className="w-4 h-4" />
      </button>

      {page > 3 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-xl text-sm transition-all" style={btnBase}>1</button>
          <span className="text-slate-600 text-sm">…</span>
        </>
      )}

      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
          style={p === page ? btnActive : btnBase}>
          {p}
        </button>
      ))}

      {page < totalPages - 2 && (
        <>
          <span className="text-slate-600 text-sm">…</span>
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-xl text-sm transition-all" style={btnBase}>{totalPages}</button>
        </>
      )}

      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
        className="p-2 rounded-xl transition-all disabled:opacity-30"
        style={btnBase}
        onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
