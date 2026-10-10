import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Monitor, Search, ArrowRight, CheckCircle, Users, Zap, Layers, ChevronRight, Star, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-40" style={{ background:'rgba(10,7,20,0.8)', borderBottom:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#9333ea,#3b82f6)', boxShadow:'0 0 16px rgba(147,51,234,0.4)' }}>
            <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">EduSphere</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {['Features','How It Works','About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`}
              className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all">Log in</Link>
          <Link to="/register" className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all"
            style={{ background:'linear-gradient(135deg,#9333ea,#7c3aed)', boxShadow:'0 0 16px rgba(147,51,234,0.3)' }}>
            Get Started
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 py-4 flex flex-col gap-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <a href="#features" onClick={() => setOpen(false)} className="text-sm text-slate-400 py-1">Features</a>
          <a href="#how-it-works" onClick={() => setOpen(false)} className="text-sm text-slate-400 py-1">How It Works</a>
          <div className="flex gap-3 pt-2" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/login" className="flex-1 text-center text-sm font-semibold text-white py-2.5 rounded-xl" style={{ border:'1px solid rgba(255,255,255,0.12)' }}>Log in</Link>
            <Link to="/register" className="flex-1 text-center text-sm font-bold text-white py-2.5 rounded-xl" style={{ background:'linear-gradient(135deg,#9333ea,#7c3aed)' }}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description, gradient, link, tag }) => (
  <Link to={link} className="group relative rounded-2xl p-6 flex flex-col overflow-hidden transition-all duration-300 hover:translate-y-[-4px]"
    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/4"
      style={{ background: gradient, filter:'blur(20px)' }} />
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shrink-0"
      style={{ background: gradient, boxShadow: `0 0 20px rgba(168,85,247,0.2)` }}>
      <Icon className="w-6 h-6 text-white" strokeWidth={2} />
    </div>
    {tag && <span className="text-[10px] font-bold uppercase tracking-wider mb-2 px-2.5 py-0.5 rounded-full w-fit"
      style={{ background:'rgba(168,85,247,0.15)', color:'#d8b4fe', border:'1px solid rgba(168,85,247,0.25)' }}>{tag}</span>}
    <h3 className="text-lg font-extrabold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">{description}</p>
    <div className="flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color:'#a855f7' }}>
      Explore <ChevronRight className="w-4 h-4" />
    </div>
  </Link>
);

export const Landing = () => {
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
  };

  return (
    <div className="min-h-screen" style={{ background:'#0a0714' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{ background:'radial-gradient(circle,#7c3aed,transparent)' }} />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background:'radial-gradient(circle,#0ea5e9,transparent)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px"
            style={{ background:'linear-gradient(90deg,transparent,rgba(168,85,247,0.3),transparent)' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-sm"
            style={{ background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.25)', color:'#c084fc' }}>
            <Star className="w-3.5 h-3.5 fill-purple-400" /> Smart Campus Resource Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-white">One Place for</span>
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage:'linear-gradient(135deg,#c084fc,#60a5fa,#34d399)' }}>
              Every Student Need
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Find study materials, discover software with student plans — all in one smart platform built for college students.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2 mb-10">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search notes, software..."
                className="input-field pl-12 pr-4 py-4 text-base" />
            </div>
            <button type="submit" className="btn-primary px-7 py-4 text-base whitespace-nowrap">
              Search <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            {[['Free to use','#34d399'],['Verified info','#60a5fa'],['Student community','#c084fc']].map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" style={{ color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color:'#a855f7' }}>What We Offer</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Two Modules, One Platform</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Everything a college student needs, organized and easy to find.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <FeatureCard icon={BookOpen} title="Study Materials"
              description="Access and share notes, books, PDFs, PPTs, and question papers. Filter by department, semester, and subject."
              gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" link="/materials" tag="Community" />
            <FeatureCard icon={Monitor} title="Software Access"
              description="Discover software with student plans, free tiers, and campus licences — with verified official pricing and instructions."
              gradient="linear-gradient(135deg,#0ea5e9,#14b8a6)" link="/software" tag="Verified" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color:'#0ea5e9' }}>Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Up and running in under a minute.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num:'01', title:'Create Account', desc:'Register with your college email and academic details.' },
              { num:'02', title:'Search or Browse', desc:'Find exactly what you need by subject, department, or keyword.' },
              { num:'03', title:'Access Resources', desc:'Download materials and discover student software deals.' },
              { num:'04', title:'Contribute', desc:'Upload your own notes to help fellow students.' },
            ].map(step => (
              <div key={step.num} className="rounded-2xl p-6 transition-all hover:translate-y-[-2px]"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-4xl font-black mb-3 leading-none bg-clip-text text-transparent"
                  style={{ backgroundImage:'linear-gradient(135deg,rgba(168,85,247,0.4),rgba(14,165,233,0.3))' }}>
                  {step.num}
                </div>
                <h4 className="font-bold text-white mb-2">{step.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="about" className="py-20" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color:'#34d399' }}>Why EduSphere?</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Built for Students</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: CheckCircle, title:'Verified Info',       desc:'Software pricing and access details are verified before going live.', color:'#34d399', bg:'rgba(52,211,153,0.1)' },
              { icon: Users,       title:'Student Community',   desc:'Notes uploaded by students, for students. Contribute and earn trust.', color:'#60a5fa', bg:'rgba(96,165,250,0.1)' },
              { icon: Zap,         title:'Fast & Simple',       desc:'No clutter. Find what you need in seconds with smart search.',         color:'#c084fc', bg:'rgba(192,132,252,0.1)' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-2xl p-6 transition-all hover:translate-y-[-2px]"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: bg, border:`1px solid ${color}25` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h4 className="font-bold text-white mb-2">{title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-2xl mx-auto text-center px-4 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full opacity-15 blur-3xl"
              style={{ background:'radial-gradient(circle,#7c3aed,transparent)' }} />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color:'#a855f7' }}>Ready?</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Get Started Today</h2>
          <p className="text-slate-400 mb-8 text-lg">Join your campus on EduSphere and study smarter.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary py-4 px-10 text-base">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary py-4 px-10 text-base">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(5,3,12,0.8)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background:'linear-gradient(135deg,#9333ea,#3b82f6)' }}>
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-white">EduSphere</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
              {['About','Contact','Privacy Policy','Terms of Use'].map(l => (
                <a key={l} href="#" className="hover:text-slate-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-slate-700">
            © {new Date().getFullYear()} EduSphere. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
