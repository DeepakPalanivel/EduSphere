import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { globalSearch } from '../api/search';
import { PageSpinner, Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Search as SearchIcon, BookOpen, Monitor, ArrowRight, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';

const ResultCard = ({ children, accentColor = '#a855f7' }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 cursor-default"
    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = accentColor + '55'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
    {children}
  </div>
);

const MaterialResult = ({ item }) => (
  <ResultCard accentColor="#6366f1">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.2)' }}>
      <BookOpen className="w-4 h-4 text-indigo-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-white text-sm">{item.title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{item.subject} · {item.department} · Sem {item.semester}</p>
    </div>
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
      style={{ background:'rgba(99,102,241,0.15)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)' }}>
      {item.type}
    </span>
  </ResultCard>
);

const SoftwareResult = ({ item }) => (
  <ResultCard accentColor="#0ea5e9">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background:'rgba(14,165,233,0.12)', border:'1px solid rgba(14,165,233,0.2)' }}>
      <Monitor className="w-4 h-4 text-sky-400" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <p className="font-semibold text-white text-sm">{item.name}</p>
        {item.isVerified
          ? <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
          : <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />}
      </div>
      <p className="text-xs text-slate-500 mt-0.5">{item.category} · {item.accessType}</p>
    </div>
    <a href={item.officialWebsite} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 shrink-0 transition-colors">
      <ExternalLink className="w-3 h-3" /> Visit
    </a>
  </ResultCard>
);

const Section = ({ title, icon: Icon, count, children, viewAllLink, accentColor }) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: accentColor + '20', border: `1px solid ${accentColor}30` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
        </div>
        <h2 className="font-bold text-white text-sm">{title}</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background:'rgba(255,255,255,0.06)', color:'#94a3b8' }}>{count}</span>
      </div>
      {count > 0 && (
        <Link to={viewAllLink} className="text-xs font-semibold flex items-center gap-1 transition-colors"
          style={{ color: accentColor }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
    {children}
  </div>
);

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery]   = useState(searchParams.get('q') || '');
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const doSearch = async (q) => {
    if (!q || q.trim().length < 2) { setError('Enter at least 2 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await globalSearch(q.trim(), 8);
      setResults(res.data.results);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed.');
      setResults(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); setInputVal(q); doSearch(q); }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: inputVal });
    setQuery(inputVal);
    doSearch(inputVal);
  };

  const total = results ? (results.materials.count + results.software.count) : 0;

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      <h1 className="page-title">Search</h1>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input value={inputVal} onChange={e => setInputVal(e.target.value)}
            placeholder="Search materials, software..."
            className="input-field pl-11 py-3 text-base" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-3">
          {loading ? <Spinner size="sm" /> : <SearchIcon className="w-4 h-4" />}
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-xl p-3 text-sm"
          style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171' }}>
          {error}
        </div>
      )}

      {loading && <PageSpinner />}

      {!loading && results && (
        <div>
          {total === 0 ? (
            <EmptyState title={`No results for "${query}"`}
              description="Try different keywords or browse the sections directly." icon={SearchIcon} />
          ) : (
            <div className="space-y-7">
              <p className="text-sm text-slate-500">
                {total} result{total !== 1 ? 's' : ''} for{' '}
                <span className="font-semibold text-white">"{query}"</span>
              </p>

              <Section title="Study Materials" icon={BookOpen} count={results.materials.count}
                viewAllLink={`/materials?search=${encodeURIComponent(query)}`} accentColor="#6366f1">
                {results.materials.count === 0
                  ? <p className="text-sm text-slate-600 py-2">No materials found</p>
                  : <div className="space-y-2">{results.materials.data.map(m => <MaterialResult key={m._id} item={m} />)}</div>
                }
              </Section>

              <Section title="Software" icon={Monitor} count={results.software.count}
                viewAllLink={`/software?search=${encodeURIComponent(query)}`} accentColor="#0ea5e9">
                {results.software.count === 0
                  ? <p className="text-sm text-slate-600 py-2">No software found</p>
                  : <div className="space-y-2">{results.software.data.map(s => <SoftwareResult key={s._id} item={s} />)}</div>
                }
              </Section>
            </div>
          )}
        </div>
      )}

      {!loading && !results && !error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.15)' }}>
            <SearchIcon className="w-7 h-7 text-purple-500/50" />
          </div>
          <p className="text-slate-500">Search across study materials and software</p>
        </div>
      )}
    </div>
  );
};
