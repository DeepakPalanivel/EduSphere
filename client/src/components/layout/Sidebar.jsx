import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, Monitor, Search, User, LogOut, ShieldCheck, X, Layers } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/materials',  icon: BookOpen,        label: 'Study Materials' },
  { to: '/software',   icon: Monitor,         label: 'Software' },
  { to: '/search',     icon: Search,          label: 'Search' },
];

export const Sidebar = ({ open, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 flex flex-col
          transform transition-transform duration-250 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        style={{
          background: 'rgba(10,7,20,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow-sm shrink-0"
              style={{ background: 'linear-gradient(135deg,#9333ea,#3b82f6)' }}>
              <Layers className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-extrabold text-white text-base leading-none tracking-tight">EduSphere</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Smart Campus Platform</p>
            </div>
          </NavLink>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">Menu</p>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mt-5 mb-2">Admin</p>
              <NavLink to="/admin" onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                }>
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Admin Dashboard
              </NavLink>
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 pt-3 space-y-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <NavLink to="/profile" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <User className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
          </NavLink>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};
