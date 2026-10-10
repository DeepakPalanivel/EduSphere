import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import api from '../../api/axios';
import { User, Mail, BookOpen, Calendar, Building, Edit3, Save, X } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';

const DEPTS = ['Computer Science','Electronics and Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Information Technology','Chemical Engineering','Biotechnology','Business Administration','Arts and Science','Other'];

export const Profile = () => {
  const { user, loadUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    department: user?.department || '',
    course: user?.course || '',
    yearOfStudy: user?.yearOfStudy || 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'yearOfStudy' ? parseInt(value) : value }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || form.fullName.length < 2) { toast.error('Full name must be at least 2 characters.'); return; }
    setLoading(true);
    try {
      await api.put('/users/profile', form);
      await loadUser();
      toast.success('Profile updated.');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed.'); }
    finally { setLoading(false); }
  };

  const InfoRow = ({ icon: Icon, label, value, accent = '#a855f7' }) => (
    <div className="flex items-center gap-3 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent + '15', border: `1px solid ${accent}25` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{label}</p>
        <p className="text-sm font-medium text-white mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <h1 className="page-title mb-6">My Profile</h1>

      <div className="rounded-3xl overflow-hidden"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>

        {/* Header banner */}
        <div className="relative h-24 overflow-hidden"
          style={{ background:'linear-gradient(135deg,rgba(88,28,135,0.6),rgba(30,27,75,0.8),rgba(15,23,42,0.9))' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30"
            style={{ background:'radial-gradient(circle,#a855f7,transparent)' }} />
        </div>

        {/* Avatar & Name */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shadow-glow shrink-0"
              style={{ background:'linear-gradient(135deg,#9333ea,#3b82f6)', border:'3px solid rgba(10,7,20,0.8)' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
                    {loading ? <Spinner size="sm" /> : <Save className="w-3.5 h-3.5" />} Save
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm px-3">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-1">
            <h2 className="text-xl font-extrabold text-white">{user?.fullName}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] font-bold px-3 py-1 rounded-full capitalize"
              style={user?.role === 'admin'
                ? { background:'rgba(168,85,247,0.15)', color:'#d8b4fe', border:'1px solid rgba(168,85,247,0.3)' }
                : { background:'rgba(255,255,255,0.07)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.12)' }}>
              {user?.role}
            </span>
          </div>

          <div className="mt-5" style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'1.25rem' }}>
            {!editing ? (
              <div>
                <InfoRow icon={User}     label="Full Name"     value={user?.fullName}   accent="#a855f7" />
                <InfoRow icon={Mail}     label="Email"         value={user?.email}      accent="#0ea5e9" />
                <InfoRow icon={Building} label="Department"    value={user?.department} accent="#14b8a6" />
                <InfoRow icon={BookOpen} label="Course"        value={user?.course}     accent="#6366f1" />
                <InfoRow icon={Calendar} label="Year of Study" value={user?.yearOfStudy ? `Year ${user.yearOfStudy}` : null} accent="#f59e0b" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Department</label>
                    <select name="department" value={form.department} onChange={handleChange} className="input-field">
                      <option value="">Select</option>
                      {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Year of Study</label>
                    <select name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} className="input-field">
                      {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Course</label>
                  <input name="course" value={form.course} onChange={handleChange} placeholder="e.g. B.Tech, B.Sc" className="input-field" />
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 mt-4">
            Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};
