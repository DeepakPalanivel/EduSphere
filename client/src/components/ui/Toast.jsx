import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  };

  const STYLES = {
    success: { bg:'rgba(52,211,153,0.12)', border:'rgba(52,211,153,0.25)', color:'#6ee7b7', Icon: CheckCircle },
    error:   { bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.25)',  color:'#fca5a5', Icon: XCircle },
    info:    { bg:'rgba(14,165,233,0.12)', border:'rgba(14,165,233,0.25)', color:'#7dd3fc', Icon: Info },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => {
          const s = STYLES[t.type];
          return (
            <div key={t.id} className="flex items-start gap-3 p-4 rounded-2xl shadow-2xl fade-in"
              style={{ background: s.bg, border: `1px solid ${s.border}`, backdropFilter: 'blur(20px)' }}>
              <s.Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: s.color }} />
              <p className="text-sm font-medium flex-1" style={{ color: s.color }}>{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" style={{ color: s.color }} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
