import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Layers, AlertCircle, UserPlus } from 'lucide-react';
import { register as registerApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';

const DEPTS = ['Computer Science','Electronics and Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Information Technology','Chemical Engineering','Biotechnology','Business Administration','Arts and Science','Other'];

export const Register = () => {
  const [form, setForm]   = useState({ fullName:'', email:'', password:'', confirmPassword:'', department:'', course:'', yearOfStudy:1 });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'yearOfStudy' ? parseInt(value) : value }));
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.length < 2) e.fullName = 'Full name must be at least 2 characters.';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Please enter a valid email.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Registration failed.' });
    } finally { setLoading(false); }
  };

  const errBorder = (key) => errors[key] ? { borderColor: 'rgba(239,68,68,0.6)' } : {};

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4 py-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle,#9333ea,transparent)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle,#0ea5e9,transparent)' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-glow"
              style={{ background: 'linear-gradient(135deg,#9333ea,#3b82f6)' }}>
              <Layers className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">EduSphere</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join thousands of students on EduSphere</p>
        </div>

        <div className="rounded-3xl p-6 space-y-4"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(20px)' }}>

          {errors.api && (
            <div className="flex items-center gap-2 rounded-xl p-3 text-sm"
              style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171' }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {errors.api}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange}
                placeholder="Your full name" className="input-field" style={errBorder('fullName')} />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="label">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@college.edu" className="input-field" style={errBorder('email')} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="At least 6 characters"
                  className="input-field pr-10" style={errBorder('password')} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} placeholder="Repeat your password"
                className="input-field" style={errBorder('confirmPassword')} />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
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
              <input name="course" value={form.course} onChange={handleChange}
                placeholder="e.g. B.Tech, B.Sc, MBA" className="input-field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-1">
              {loading ? <><Spinner size="sm" /> Creating account...</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="link font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
