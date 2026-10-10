import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMaterials } from '../api/materials';
import { getSoftwareList } from '../api/software';
import { BookOpen, Monitor, Search, ArrowRight, FileText, CheckCircle, Zap, Download } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';

const QuickCard = ({ icon: Icon, label, desc, gradient, to }) => (
  <Link to={to} className="group relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02]"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: gradient, filter: 'blur(30px)', transform: 'scale(0.5)' }} />
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative"
      style={{ background: gradient }}>
      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0 relative">
      <p className="font-bold text-white">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all relative" />
  </Link>
);

const MaterialRow = ({ item }) => (
  <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: 'rgba(99,102,241,0.15)' }}>
      <FileText className="w-4 h-4 text-indigo-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">{item.title}</p>
      <p className="text-xs text-slate-500">{item.subject} · Sem {item.semester}</p>
    </div>
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
      style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
      {item.type}
    </span>
  </div>
);

const SoftwareRow = ({ item }) => (
  <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: 'rgba(20,184,166,0.15)' }}>
      <Monitor className="w-4 h-4 text-teal-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium text-white truncate">{item.name}</p>
        {item.isVerified && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />}
      </div>
      <p className="text-xs text-slate-500">{item.category}</p>
    </div>
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{
      background: item.accessType === 'Free' ? 'rgba(52,211,153,0.15)' : item.accessType === 'Student Plan' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
      color: item.accessType === 'Free' ? '#6ee7b7' : item.accessType === 'Student Plan' ? '#93c5fd' : '#94a3b8',
      border: `1px solid ${item.accessType === 'Free' ? 'rgba(52,211,153,0.2)' : item.accessType === 'Student Plan' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      {item.accessType}
    </span>
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [mRes, sRes] = await Promise.all([getMaterials({ limit: 5, sort: 'newest' }), getSoftwareList({ limit: 5 })]);
        setMaterials(mRes.data.data || []);
        setSoftware(sRes.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 fade-in">

      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(88,28,135,0.6) 0%, rgba(30,27,75,0.8) 50%, rgba(15,23,42,0.9) 100%)',
          border: '1px solid rgba(168,85,247,0.2)',
        }}>
        {/* Orb accents */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3), transparent 70%)' }} />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.2), transparent 70%)' }} />

        <div className="relative">
          <p className="text-slate-400 text-sm mb-1">{greeting} 👋</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0]}!</span>
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {[user?.course, user?.department, user?.yearOfStudy ? `Year ${user.yearOfStudy}` : null].filter(Boolean).join(' · ') || 'Student'}
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search materials, software..."
                className="input-field pl-9 py-3" />
            </div>
            <button type="submit" className="btn-primary px-6 py-3">Search</button>
          </form>
        </div>
      </div>

      {/* Quick access */}
      <div className="grid sm:grid-cols-2 gap-4">
        <QuickCard icon={BookOpen} label="Study Materials" desc="Notes, PDFs, PPTs, Question Papers"
          gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" to="/materials" />
        <QuickCard icon={Monitor} label="Software Access" desc="Student plans & free tools"
          gradient="linear-gradient(135deg,#14b8a6,#0ea5e9)" to="/software" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: 'Materials', value: '29+', color: '#818cf8' },
          { icon: Monitor,  label: 'Software',  value: '21+', color: '#2dd4bf' },
          { icon: Zap,      label: 'Students',  value: '∞',   color: '#f472b6' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-extrabold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Lists */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Recent Materials
              </h2>
              <Link to="/materials" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {materials.length > 0
              ? materials.map(m => <MaterialRow key={m._id} item={m} />)
              : <div className="text-center py-8 text-slate-500 text-sm">No materials yet.
                  <Link to="/materials" className="ml-1 link">Upload one →</Link></div>}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title flex items-center gap-2">
                <Monitor className="w-4 h-4 text-teal-400" /> Software Tools
              </h2>
              <Link to="/software" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {software.length > 0
              ? software.map(s => <SoftwareRow key={s._id} item={s} />)
              : <div className="text-center py-8 text-slate-500 text-sm">No software listed yet.</div>}
          </div>
        </div>
      )}
    </div>
  );
};
