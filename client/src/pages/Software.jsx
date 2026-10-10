import { useState, useEffect, useCallback } from 'react';
import { getSoftwareList, createSoftware, updateSoftware, deleteSoftware } from '../api/software';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { PageSpinner, Spinner } from '../components/ui/Spinner';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Monitor, Search, ExternalLink, CheckCircle, AlertTriangle, Plus, Trash2, Edit3, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['Programming','Design','Productivity','AI Tools','Cloud Computing','Office Applications','Other'];
const ACCESS_TYPES = ['Free','Free Tier','Student Plan','Paid','Campus Licence'];

const ACCESS_STYLE = {
  'Free':           { bg:'rgba(52,211,153,0.12)',  color:'#6ee7b7', border:'rgba(52,211,153,0.25)' },
  'Free Tier':      { bg:'rgba(20,184,166,0.12)',  color:'#5eead4', border:'rgba(20,184,166,0.25)' },
  'Student Plan':   { bg:'rgba(59,130,246,0.12)',  color:'#93c5fd', border:'rgba(59,130,246,0.25)' },
  'Paid':           { bg:'rgba(251,113,133,0.12)', color:'#fda4af', border:'rgba(251,113,133,0.2)' },
  'Campus Licence': { bg:'rgba(168,85,247,0.12)',  color:'#d8b4fe', border:'rgba(168,85,247,0.25)' },
};

const AccessBadge = ({ type }) => {
  const s = ACCESS_STYLE[type] || { bg:'rgba(255,255,255,0.06)', color:'#94a3b8', border:'rgba(255,255,255,0.12)' };
  return (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {type}
    </span>
  );
};

const SoftwareCard = ({ item, isAdmin, onEdit, onDelete }) => (
  <div className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:translate-y-[-2px]"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.35)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>

    <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg,#0ea5e9,#14b8a6)' }} />

    <div className="p-4 flex flex-col flex-1">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <AccessBadge type={item.accessType} />
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background:'rgba(255,255,255,0.06)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.1)' }}>
            {item.category}
          </span>
        </div>
        {isAdmin && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(item._id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex items-center gap-2 mb-2">
        <Monitor className="w-4 h-4 text-teal-400 shrink-0" />
        <h3 className="font-bold text-white">{item.name}</h3>
        {item.isVerified
          ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Unverified — check official site" />}
      </div>

      <p className="text-xs text-slate-400 line-clamp-3 mb-3 leading-relaxed">{item.description}</p>

      {item.accessInstructions && (
        <div className="rounded-xl p-3 mb-3 text-xs"
          style={{ background:'rgba(14,165,233,0.07)', border:'1px solid rgba(14,165,233,0.15)', color:'#7dd3fc' }}>
          <p className="font-bold mb-0.5 text-sky-400">How to access</p>
          <p className="text-sky-300/80 line-clamp-2">{item.accessInstructions}</p>
        </div>
      )}

      {!item.isVerified && (
        <div className="rounded-xl p-2.5 mb-3 flex items-center gap-2 text-xs"
          style={{ background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.15)', color:'#fcd34d' }}>
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Pricing not recently verified — confirm on official site.
        </div>
      )}

      <div className="mt-auto flex gap-2">
        <a href={item.officialWebsite} target="_blank" rel="noopener noreferrer"
          className="btn-primary flex-1 py-2.5 text-xs"
          style={{ background:'linear-gradient(135deg,#0ea5e9,#14b8a6)', boxShadow:'0 0 12px rgba(14,165,233,0.2)' }}>
          <ExternalLink className="w-3.5 h-3.5" /> Official Site
        </a>
        {item.pricingUrl && (
          <a href={item.pricingUrl} target="_blank" rel="noopener noreferrer"
            className="btn-secondary px-3 py-2.5 text-xs">Pricing</a>
        )}
      </div>

      {item.lastVerifiedDate && (
        <p className="text-[10px] text-slate-600 text-center mt-2">
          Verified {new Date(item.lastVerifiedDate).toLocaleDateString('en-IN')}
        </p>
      )}
    </div>
  </div>
);

const SoftwareFormModal = ({ isOpen, onClose, onSaved, editItem }) => {
  const blank = { name:'', description:'', category:'Programming', officialWebsite:'', pricingUrl:'', accessType:'Free', accessInstructions:'', isVerified:false };
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) { setForm(editItem ? { ...blank, ...editItem } : blank); setError(''); }
  }, [isOpen, editItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.officialWebsite) { setError('Name, description and official website are required.'); return; }
    setLoading(true);
    try {
      if (editItem) await updateSoftware(editItem._id, form);
      else await createSoftware(form);
      toast.success(editItem ? 'Software updated.' : 'Software added.');
      onSaved(); onClose();
    } catch (err) { setError(err.response?.data?.message || 'Save failed.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Edit Software' : 'Add Software'} size="lg">
      {error && (
        <div className="rounded-xl p-3 mb-4 text-sm flex items-center gap-2"
          style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Name *</label><input name="name" value={form.name} onChange={handleChange} className="input-field" /></div>
          <div><label className="label">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Access Type *</label>
            <select name="accessType" value={form.accessType} onChange={handleChange} className="input-field">
              {ACCESS_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label className="label">Description *</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none" /></div>
          <div><label className="label">Official Website *</label><input name="officialWebsite" value={form.officialWebsite} onChange={handleChange} placeholder="https://" className="input-field" /></div>
          <div><label className="label">Pricing URL</label><input name="pricingUrl" value={form.pricingUrl} onChange={handleChange} placeholder="https://" className="input-field" /></div>
          <div className="col-span-2"><label className="label">Access Instructions</label><textarea name="accessInstructions" value={form.accessInstructions} onChange={handleChange} rows={2} className="input-field resize-none" /></div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" name="isVerified" checked={form.isVerified} onChange={handleChange} className="w-4 h-4 accent-purple-500" />
              <span className="text-sm text-slate-300">Mark as verified</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner size="sm" /> : null} {editItem ? 'Update' : 'Add Software'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const Software = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [software, setSoftware]     = useState([]);
  const [pagination, setPagination] = useState({ page:1, totalPages:1, total:0 });
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ search:'', category:'', accessType:'', page:1 });
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen]     = useState(false);
  const [editItem, setEditItem]     = useState(null);

  const fetchSoftware = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit:12 };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await getSoftwareList(params);
      setSoftware(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load software.'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchSoftware(); }, [fetchSoftware]);

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v, page:1 }));
  const clearFilters = () => setFilters({ search:'', category:'', accessType:'', page:1 });
  const hasActive = filters.search || filters.category || filters.accessType;

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try { await deleteSoftware(id); toast.success('Deleted.'); fetchSoftware(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Software Access</h1>
          <p className="text-muted mt-0.5">Student plans, free tiers and campus licences</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Software
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {['', ...CATEGORIES].map(cat => {
          const active = filters.category === cat;
          return (
            <button key={cat} onClick={() => setFilter('category', cat)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
              style={active
                ? { background:'rgba(14,165,233,0.18)', color:'#7dd3fc', border:'1px solid rgba(14,165,233,0.35)', boxShadow:'0 0 12px rgba(14,165,233,0.1)' }
                : { background:'rgba(255,255,255,0.04)', color:'#64748b', border:'1px solid rgba(255,255,255,0.08)' }}>
              {cat || 'All'}
            </button>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
              placeholder="Search software..." className="input-field pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={showFilters || filters.accessType
              ? { background:'rgba(14,165,233,0.12)', border:'1px solid rgba(14,165,233,0.3)', color:'#7dd3fc' }
              : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b' }}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {filters.accessType && <span className="w-2 h-2 rounded-full bg-sky-400" />}
          </button>
          {hasActive && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-3 rounded-xl text-xs text-slate-500 hover:text-white border transition-colors"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
        {showFilters && (
          <div className="pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <label className="label">Access Type</label>
            <select value={filters.accessType} onChange={e => setFilter('accessType', e.target.value)} className="input-field text-sm">
              <option value="">All Access Types</option>
              {ACCESS_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        )}
      </div>

      {!loading && (
        <p className="text-sm text-slate-500">{pagination.total} tool{pagination.total !== 1 ? 's' : ''}</p>
      )}

      {loading ? <PageSpinner /> : (
        <>
          {software.length === 0
            ? <EmptyState title="No software found" description="Try adjusting your filters." icon={Monitor}
                action={isAdmin ? <button onClick={() => setFormOpen(true)} className="btn-primary text-sm">Add Software</button> : null} />
            : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {software.map(s => (
                  <SoftwareCard key={s._id} item={s} isAdmin={isAdmin}
                    onEdit={item => { setEditItem(item); setFormOpen(true); }}
                    onDelete={handleDelete} />
                ))}
              </div>
          }
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={p => setFilter('page', p)} />
        </>
      )}

      <div className="rounded-2xl p-4 text-xs"
        style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.12)', color:'#fcd34d' }}>
        <p className="font-bold mb-1 text-amber-400">Important Notice</p>
        <p className="text-amber-300/70">Pricing and availability info is verified periodically but may change. Always confirm on the official software website before making decisions.</p>
      </div>

      <SoftwareFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSaved={fetchSoftware} editItem={editItem} />
    </div>
  );
};
