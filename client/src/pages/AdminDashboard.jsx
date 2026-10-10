import { useState, useEffect } from 'react';
import { getAdminStats, getUnapprovedMaterials, approveMaterial, getAllUsers, promoteUser, deactivateUser } from '../api/admin';
import { deleteMaterial } from '../api/materials';
import { useToast } from '../components/ui/Toast';
import { PageSpinner, Spinner } from '../components/ui/Spinner';
import { Users, BookOpen, Monitor, CheckCircle, Trash2, ShieldCheck, UserX, RefreshCw } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="rounded-2xl p-5 flex items-center gap-4"
    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: gradient }}>
      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-extrabold text-white">{value ?? '—'}</p>
    </div>
  </div>
);

const Tab = ({ label, active, onClick, badge }) => (
  <button onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
    style={active
      ? { background:'rgba(168,85,247,0.15)', border:'1px solid rgba(168,85,247,0.3)', color:'#d8b4fe' }
      : { background:'transparent', border:'1px solid transparent', color:'#64748b' }}>
    {label}
    {badge > 0 && (
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ background:'#dc2626' }}>{badge}</span>
    )}
  </button>
);

export const AdminDashboard = () => {
  const toast = useToast();
  const [stats, setStats]         = useState(null);
  const [unapproved, setUnapproved] = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('overview');
  const [actionLoading, setAL]    = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [sR, uR, uUR] = await Promise.all([getAdminStats(), getUnapprovedMaterials(), getAllUsers({ limit:50 })]);
      setStats(sR.data.data);
      setUnapproved(uR.data.data || []);
      setUsers(uUR.data.data || []);
    } catch { toast.error('Failed to load data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const setL = (id, v) => setAL(p => ({ ...p, [id]: v }));

  const handleApprove = async (id) => {
    setL(id, true);
    try { await approveMaterial(id); toast.success('Approved.'); setUnapproved(p => p.filter(m => m._id !== id)); }
    catch { toast.error('Failed.'); } finally { setL(id, false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;
    setL(id, true);
    try { await deleteMaterial(id); toast.success('Deleted.'); setUnapproved(p => p.filter(m => m._id !== id)); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); } finally { setL(id, false); }
  };

  const handlePromote = async (id, name) => {
    if (!confirm(`Promote ${name} to Admin?`)) return;
    setL(id, true);
    try { await promoteUser(id); toast.success(`${name} promoted.`); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); } finally { setL(id, false); }
  };

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    setL(id, true);
    try { await deactivateUser(id); toast.success(`${name} deactivated.`); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); } finally { setL(id, false); }
  };

  if (loading) return <PageSpinner />;

  const tbl = { borderColor:'rgba(255,255,255,0.06)' };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="text-muted mt-0.5">EduSphere platform management</p>
        </div>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Total Users"    value={stats?.stats.totalUsers}    gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <StatCard icon={BookOpen}   label="Materials"      value={stats?.stats.totalMaterials} gradient="linear-gradient(135deg,#0ea5e9,#14b8a6)" />
        <StatCard icon={Monitor}    label="Software"       value={stats?.stats.totalSoftware}  gradient="linear-gradient(135deg,#14b8a6,#059669)" />
        <StatCard icon={ShieldCheck}label="Admins"         value={stats?.stats.totalAdmins}    gradient="linear-gradient(135deg,#f59e0b,#ef4444)" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Tab label="Overview"        active={tab==='overview'} onClick={() => setTab('overview')} />
        <Tab label="Pending Approval" active={tab==='pending'}  onClick={() => setTab('pending')}  badge={unapproved.length} />
        <Tab label="Users"           active={tab==='users'}    onClick={() => setTab('users')} />
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-5">
          {[
            { title:'Recent Uploads', icon: BookOpen, items: stats?.recentMaterials, render: m => (
              <div key={m._id} className="flex items-center gap-3 py-2.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'rgba(99,102,241,0.12)' }}>
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.title}</p>
                  <p className="text-xs text-slate-500">{m.uploader?.fullName} · {new Date(m.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            )},
            { title:'New Users', icon: Users, items: stats?.recentUsers, render: u => (
              <div key={u._id} className="flex items-center gap-3 py-2.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background:'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
                  {u.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{u.fullName}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                  style={u.role==='admin'
                    ? { background:'rgba(168,85,247,0.15)', color:'#d8b4fe', border:'1px solid rgba(168,85,247,0.2)' }
                    : { background:'rgba(255,255,255,0.06)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.1)' }}>
                  {u.role}
                </span>
              </div>
            )},
          ].map(({ title, icon: Icon, items, render }) => (
            <div key={title} className="rounded-2xl p-5"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <Icon className="w-4 h-4 text-purple-400" /> {title}
              </h2>
              {items?.length > 0 ? items.map(render) : <p className="text-sm text-slate-600">No data yet.</p>}
            </div>
          ))}
        </div>
      )}

      {/* Pending */}
      {tab === 'pending' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white">Pending Approval ({unapproved.length})</h2>
          </div>
          {unapproved.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-500">All materials approved!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    {['Title','Uploader','Type','Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unapproved.map(m => (
                    <tr key={m._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-white truncate max-w-[180px]">{m.title}</p>
                        <p className="text-xs text-slate-500">{m.subject}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{m.uploader?.fullName}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background:'rgba(255,255,255,0.06)', color:'#94a3b8' }}>{m.type}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(m._id)} disabled={actionLoading[m._id]}
                            className="btn-primary text-xs py-1.5 px-3">
                            {actionLoading[m._id] ? <Spinner size="sm" /> : <CheckCircle className="w-3 h-3" />} Approve
                          </button>
                          <button onClick={() => handleDelete(m._id)} disabled={actionLoading[m._id]}
                            className="btn-danger text-xs py-1.5 px-3">
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-5 py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-bold text-white">All Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  {['Name','Email','Role','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-3 font-semibold text-white">{u.fullName}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={u.role==='admin'
                          ? { background:'rgba(168,85,247,0.15)', color:'#d8b4fe', border:'1px solid rgba(168,85,247,0.2)' }
                          : { background:'rgba(255,255,255,0.06)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.1)' }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={u.isActive!==false
                          ? { background:'rgba(52,211,153,0.12)', color:'#6ee7b7', border:'1px solid rgba(52,211,153,0.2)' }
                          : { background:'rgba(239,68,68,0.12)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.2)' }}>
                        {u.isActive!==false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {u.role!=='admin' && u.isActive!==false && (
                          <button onClick={() => handlePromote(u._id, u.fullName)} disabled={actionLoading[u._id]}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl transition-colors font-semibold"
                            style={{ background:'rgba(168,85,247,0.1)', color:'#d8b4fe', border:'1px solid rgba(168,85,247,0.2)' }}>
                            {actionLoading[u._id] ? <Spinner size="sm" /> : <ShieldCheck className="w-3 h-3" />} Promote
                          </button>
                        )}
                        {u.isActive!==false && (
                          <button onClick={() => handleDeactivate(u._id, u.fullName)} disabled={actionLoading[u._id]}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl transition-colors font-semibold"
                            style={{ background:'rgba(239,68,68,0.08)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.15)' }}>
                            <UserX className="w-3 h-3" /> Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
