import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { getMaterials, uploadMaterial, deleteMaterial } from '../api/materials';
import { PageSpinner, Spinner } from '../components/ui/Spinner';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { BookOpen, Upload, Search, Download, Trash2, FileText, Calendar, User, AlertCircle, X, Filter, SlidersHorizontal } from 'lucide-react';

const DEPTS = ['Computer Science','Information Technology','Electronics and Communication','Electrical Engineering','Mechanical Engineering','Civil Engineering','Chemical Engineering','Biotechnology','Business Administration','Arts and Science','All Departments','Other'];
const ALL_TYPES = ['Notes','Book','PDF','PPT','Question Paper','Other'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);
const EXAM_TYPES = ['Mid Semester','End Semester','Internal','University','Other'];

const TYPE_STYLE = {
  'Notes':          { bg:'rgba(99,102,241,0.15)',  color:'#a5b4fc', border:'rgba(99,102,241,0.25)' },
  'Book':           { bg:'rgba(52,211,153,0.12)',  color:'#6ee7b7', border:'rgba(52,211,153,0.25)' },
  'PDF':            { bg:'rgba(251,113,133,0.12)', color:'#fda4af', border:'rgba(251,113,133,0.25)' },
  'PPT':            { bg:'rgba(251,191,36,0.12)',  color:'#fcd34d', border:'rgba(251,191,36,0.25)' },
  'Question Paper': { bg:'rgba(168,85,247,0.15)',  color:'#d8b4fe', border:'rgba(168,85,247,0.3)' },
  'Other':          { bg:'rgba(255,255,255,0.06)', color:'#94a3b8', border:'rgba(255,255,255,0.12)' },
};

const TypeBadge = ({ type }) => {
  const s = TYPE_STYLE[type] || TYPE_STYLE['Other'];
  return (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {type}
    </span>
  );
};

const MaterialCard = ({ material, onDelete, currentUserId, isAdmin }) => {
  const canDelete = material.uploader?._id === currentUserId || material.uploader === currentUserId || isAdmin;
  return (
    <div className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:translate-y-[-2px]"
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.35)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>

      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{
        background: material.type === 'Question Paper'
          ? 'linear-gradient(90deg,#9333ea,#c084fc)'
          : 'linear-gradient(90deg,#6366f1,#0ea5e9)',
      }} />

      <div className="p-4 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={material.type} />
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background:'rgba(255,255,255,0.06)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.1)' }}>
              Sem {material.semester}
            </span>
            {material.year && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background:'rgba(14,165,233,0.12)', color:'#7dd3fc', border:'1px solid rgba(14,165,233,0.2)' }}>
                {material.year}
              </span>
            )}
            {material.examType && (
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background:'rgba(251,191,36,0.1)', color:'#fcd34d', border:'1px solid rgba(251,191,36,0.2)' }}>
                {material.examType}
              </span>
            )}
          </div>
          {canDelete && (
            <button onClick={() => onDelete(material._id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all text-red-400/70 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <h3 className="font-bold text-white text-sm mb-1.5 line-clamp-2 leading-snug">{material.title}</h3>
        {material.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{material.description}</p>
        )}

        <div className="mt-auto space-y-1.5 mb-4">
          {[
            { icon: FileText, text: material.subject },
            { icon: User,     text: material.uploader?.fullName || 'Unknown' },
            { icon: Calendar, text: new Date(material.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Icon className="w-3 h-3 shrink-0" />
              <span className="truncate">{text}</span>
            </div>
          ))}
        </div>

        <a href={`/api/materials/${material._id}/download`} target="_blank" rel="noopener noreferrer"
          className="btn-primary w-full py-2.5 text-xs">
          <Download className="w-3.5 h-3.5" /> Download
        </a>
      </div>
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, onUploaded }) => {
  const blank = { title:'', description:'', subject:'', department:'', semester:1, type:'Notes', year:'', examType:'', tags:'' };
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [extUrl, setExtUrl] = useState('');
  const [useUrl, setUseUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => { if (isOpen) { setForm(blank); setFile(null); setExtUrl(''); setError(''); } }, [isOpen]);

  const isQP = form.type === 'Question Paper';
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'semester' ? parseInt(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.department) { setError('Title, subject and department are required.'); return; }
    if (!useUrl && !file) { setError('Please upload a file or provide an external URL.'); return; }
    if (isQP && !form.year) { setError('Please select the exam year.'); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    if (useUrl) fd.append('fileUrl', extUrl); else fd.append('file', file);
    setLoading(true);
    try {
      await uploadMaterial(fd);
      toast.success('Material uploaded!');
      onClose(); onUploaded();
    } catch (err) { setError(err.response?.data?.message || 'Upload failed.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Study Material" size="lg">
      {error && (
        <div className="flex items-center gap-2 rounded-xl p-3 mb-4 text-sm"
          style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171' }}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. DSA Complete Notes" className="input-field" />
          </div>
          <div>
            <label className="label">Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className="input-field">
              {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Subject *</label>
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Data Structures" className="input-field" />
          </div>
          <div>
            <label className="label">Department *</label>
            <select name="department" value={form.department} onChange={handleChange} className="input-field">
              <option value="">Select department</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Semester *</label>
            <select name="semester" value={form.semester} onChange={handleChange} className="input-field">
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tags <span className="text-slate-600 normal-case font-normal">(comma separated)</span></label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. sorting, trees" className="input-field" />
          </div>
        </div>

        {isQP && (
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl"
            style={{ background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.2)' }}>
            <div>
              <label className="label">Exam Year *</label>
              <select name="year" value={form.year} onChange={handleChange} className="input-field">
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Exam Type</label>
              <select name="examType" value={form.examType} onChange={handleChange} className="input-field">
                <option value="">Select type</option>
                {EXAM_TYPES.map(et => <option key={et} value={et}>{et}</option>)}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={2} placeholder="Brief description" className="input-field resize-none" />
        </div>

        <div>
          <div className="flex gap-2 mb-3">
            {['Upload File','External URL'].map((opt, i) => (
              <button key={opt} type="button" onClick={() => setUseUrl(i === 1)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                  useUrl === (i===1) ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                style={useUrl === (i===1)
                  ? { background:'rgba(168,85,247,0.2)', borderColor:'rgba(168,85,247,0.4)' }
                  : { background:'rgba(255,255,255,0.04)', borderColor:'rgba(255,255,255,0.1)' }}>
                {opt}
              </button>
            ))}
          </div>
          {!useUrl ? (
            <div className="rounded-2xl p-5 text-center transition-all cursor-pointer"
              style={{ border:'2px dashed rgba(255,255,255,0.1)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
              <input type="file" id="file-input" className="hidden"
                onChange={e => setFile(e.target.files[0])} accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png" />
              <label htmlFor="file-input" className="cursor-pointer block">
                <Upload className="w-7 h-7 mx-auto mb-2 text-slate-600" />
                {file
                  ? <><p className="text-sm font-semibold text-white">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size/1024/1024).toFixed(2)} MB</p></>
                  : <><p className="text-sm text-slate-400">Click to choose a file</p>
                      <p className="text-xs text-slate-600 mt-0.5">PDF, PPT, DOC, TXT — max 10 MB</p></>}
              </label>
            </div>
          ) : (
            <input value={extUrl} onChange={e => setExtUrl(e.target.value)}
              placeholder="https://drive.google.com/..." className="input-field" />
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <><Spinner size="sm" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const Materials = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [materials, setMaterials]   = useState([]);
  const [pagination, setPagination] = useState({ page:1, totalPages:1, total:0 });
  const [loading, setLoading]       = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search:'', department:'', semester:'', type:'', page:1 });

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit:12 };
      Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
      const res = await getMaterials(params);
      setMaterials(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load materials.'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v, page:1 }));
  const clearFilters = () => setFilters({ search:'', department:'', semester:'', type:'', page:1 });
  const hasActive = filters.search || filters.department || filters.semester || filters.type;

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;
    try { await deleteMaterial(id); toast.success('Deleted.'); fetchMaterials(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed.'); }
  };

  return (
    <div className="space-y-5 fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Study Materials</h1>
          <p className="text-muted mt-0.5">Notes, books, PDFs, PPTs, and question papers</p>
        </div>
        <button onClick={() => setUploadOpen(true)} className="btn-primary">
          <Upload className="w-4 h-4" /> Upload Material
        </button>
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-2">
        {['', ...ALL_TYPES].map(t => {
          const s = t ? TYPE_STYLE[t] : null;
          const active = filters.type === t;
          return (
            <button key={t} onClick={() => setFilter('type', t)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
              style={active
                ? { background: s ? s.bg : 'rgba(168,85,247,0.2)', color: s ? s.color : '#d8b4fe', border: `1px solid ${s ? s.border : 'rgba(168,85,247,0.4)'}`, boxShadow: '0 0 12px rgba(168,85,247,0.15)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
              {t || 'All'}
            </button>
          );
        })}
      </div>

      {/* Search + filter bar */}
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
              placeholder="Search by title, subject, keyword..." className="input-field pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              showFilters || filters.department || filters.semester ? 'text-white' : 'text-slate-500 hover:text-white'
            }`}
            style={showFilters || filters.department || filters.semester
              ? { background:'rgba(168,85,247,0.15)', borderColor:'rgba(168,85,247,0.3)' }
              : { background:'rgba(255,255,255,0.04)', borderColor:'rgba(255,255,255,0.08)' }}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {(filters.department || filters.semester) && (
              <span className="w-2 h-2 rounded-full" style={{ background:'#a855f7' }} />
            )}
          </button>
          {hasActive && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 px-3 rounded-xl text-xs text-slate-500 hover:text-white border transition-colors"
              style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.08)' }}>
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <label className="label">Department</label>
              <select value={filters.department} onChange={e => setFilter('department', e.target.value)} className="input-field text-sm">
                <option value="">All Departments</option>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester</label>
              <select value={filters.semester} onChange={e => setFilter('semester', e.target.value)} className="input-field text-sm">
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-slate-500">
          {pagination.total} material{pagination.total !== 1 ? 's' : ''}
          {filters.type && <span style={{ color:'#c084fc' }} className="font-semibold"> — {filters.type}</span>}
        </p>
      )}

      {/* Grid */}
      {loading ? <PageSpinner /> : (
        <>
          {materials.length === 0
            ? <EmptyState title="No materials found" description="Try adjusting your filters or upload a new material." icon={BookOpen}
                action={<button onClick={() => setUploadOpen(true)} className="btn-primary text-sm">Upload Material</button>} />
            : <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {materials.map(m => <MaterialCard key={m._id} material={m} onDelete={handleDelete} currentUserId={user?._id} isAdmin={isAdmin} />)}
              </div>
          }
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={p => setFilter('page', p)} />
        </>
      )}

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={fetchMaterials} />
    </div>
  );
};
