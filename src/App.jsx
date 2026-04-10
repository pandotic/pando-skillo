import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CFG, RAW, MANIFEST_URL, KB_MANIFEST_URL } from './config';
import { Icons } from './components/Icons';
import SkillCard from './components/SkillCard';
import SkillDetailModal from './components/SkillDetailModal';
import RepoPickerModal from './components/RepoPickerModal';
import SuccessModal from './components/SuccessModal';
import GuideSections from './components/GuideSections';
import KBGuideSections from './components/KBGuideSections';
import { openAuthPopup } from './widget/auth-popup';

function ConfigWarning() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 fade-in">
      <span className="text-amber-500 flex-shrink-0 mt-0.5"><Icons.AlertCircle /></span>
      <div>
        <p className="text-sm font-medium text-amber-900">Repo not configured</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Edit <code className="bg-amber-100 px-1 rounded">src/config.js</code> and set <code className="bg-amber-100 px-1 rounded">repoOwner</code> and <code className="bg-amber-100 px-1 rounded">repoName</code>.
        </p>
      </div>
    </div>
  );
}

export default function App({ embedded = false, ghToken: externalToken, authOrigin } = {}) {
  const [section, setSection] = useState('skills');
  const [view, setView] = useState('browse');
  const [skills, setSkills] = useState([]);
  const [knowledgebases, setKnowledgebases] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingKBs, setLoadingKBs] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [ghToken, setGhToken] = useState(externalToken || localStorage.getItem('gh_token') || '');
  const [ghUser, setGhUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [showRepoPicker, setShowRepoPicker] = useState(false);
  const [targetRepo, setTargetRepo] = useState(null);
  const [creating, setCreating] = useState(false);
  const [prUrl, setPrUrl] = useState(null);
  const [error, setError] = useState(null);
  const [detailSkill, setDetailSkill] = useState(null);
  const isConfigured = CFG.repoOwner !== 'YOUR_ORG_OR_USERNAME';

  // Derive content type from section (skills and knowledgebases share selection/deploy logic)
  const contentType = section === 'knowledgebases' ? 'knowledgebases' : 'skills';
  const items = contentType === 'skills' ? skills : knowledgebases;
  const loading = contentType === 'skills' ? loadingSkills : loadingKBs;

  useEffect(() => {
    if (!isConfigured) { setLoadingSkills(false); setLoadingKBs(false); return; }
    fetch(MANIFEST_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setSkills(data); setLoadingSkills(false); })
      .catch(err => { setError(`Could not load skills manifest from GitHub (${err.message}). Check that repoOwner/repoName are correct and the repo is public.`); setLoadingSkills(false); });
    fetch(KB_MANIFEST_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setKnowledgebases(data); setLoadingKBs(false); })
      .catch(() => { setKnowledgebases([]); setLoadingKBs(false); });
  }, [isConfigured]);

  // Sync token from external prop (for embedded mode)
  useEffect(() => {
    if (externalToken && externalToken !== ghToken) setGhToken(externalToken);
  }, [externalToken]);

  // Handle OAuth redirect code (standalone mode only)
  useEffect(() => {
    if (embedded) return;
    const p = new URLSearchParams(window.location.search);
    const code = p.get('code');
    if (code && !ghToken) {
      window.history.replaceState({}, '', '/');
      fetch('/.netlify/functions/github-auth', { method: 'POST', body: JSON.stringify({ code }) })
        .then(r => r.json())
        .then(d => { if (d.access_token) { setGhToken(d.access_token); localStorage.setItem('gh_token', d.access_token); } else setError('GitHub login failed — check Netlify function logs.'); })
        .catch(() => setError('Auth error — make sure the Netlify function is deployed.'));
    }
  }, []);

  useEffect(() => {
    if (!ghToken) return;
    fetch('https://api.github.com/user', { headers: { Authorization: `token ${ghToken}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setGhUser)
      .catch(() => { setGhToken(''); localStorage.removeItem('gh_token'); });
  }, [ghToken]);

  // Reset selection and filters when switching section
  useEffect(() => {
    setSelected(new Set());
    setCatFilter('All');
    setSearch('');
    setView('browse');
  }, [section]);

  const categories = useMemo(() => ['All', ...new Set(items.map(s => s.category))], [items]);

  const filtered = useMemo(() => items.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || (s.triggers && s.triggers.some(t => t.toLowerCase().includes(q))) || (s.domain && s.domain.toLowerCase().includes(q));
    const matchC = catFilter === 'All' || s.category === catFilter;
    return matchQ && matchC;
  }), [items, search, catFilter]);

  const toggle = useCallback(id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);

  const loginWithGitHub = () => {
    if (embedded) {
      openAuthPopup({ authOrigin })
        .then(token => { setGhToken(token); localStorage.setItem('gh_token', token); })
        .catch(err => { if (err.message !== 'Authentication cancelled') setError(err.message); });
      return;
    }
    const clientId = 'Ov23lictx0nzL5xiXx2D';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`;
  };

  const loadRepos = async () => {
    setShowRepoPicker(true);
    setReposLoading(true);
    try {
      const r = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member', { headers: { Authorization: `token ${ghToken}` } });
      const data = await r.json();
      setRepos(data.filter(r => r.permissions?.push));
    } catch { setError('Failed to load repositories'); }
    setReposLoading(false);
  };

  const createPR = async () => {
    if (!targetRepo || selected.size === 0) return;
    setCreating(true); setError(null);
    try {
      const h = { Authorization: `token ${ghToken}`, 'Content-Type': 'application/json' };
      const base = `https://api.github.com/repos/${targetRepo.full_name}`;

      const { default_branch } = await fetch(base, { headers: h }).then(r => r.json());
      const { object: { sha } } = await fetch(`${base}/git/ref/heads/${default_branch}`, { headers: h }).then(r => r.json());

      const isKB = contentType === 'knowledgebases';
      const branchPrefix = isKB ? 'add-knowledgebases' : 'add-skills';
      const branch = `${branchPrefix}-${Date.now()}`;
      await fetch(`${base}/git/refs`, { method: 'POST', headers: h, body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }) });

      const selectedItems = items.filter(s => selected.has(s.id));

      let guardrailsBody = '';
      if (isKB) {
        const guardrailsContent = await fetch(RAW('knowledgebases/_guardrails/GUARDRAILS.md')).then(r => r.ok ? r.text() : '');
        guardrailsBody = guardrailsContent.replace(/^---[\s\S]*?---\n*/, '');
      }

      for (const item of selectedItems) {
        let fileContent;
        if (isKB) {
          const kbContent = await fetch(RAW(`knowledgebases/${item.id}/KB.md`)).then(r => r.ok ? r.text() : `---\nname: ${item.id}\ndomain: "${item.domain}"\ndescription: "${item.description}"\n---\n\n# ${item.name}\n\n${item.description}\n`);
          fileContent = kbContent.replace(/^(---[\s\S]*?---\n*)/, `$1\n${guardrailsBody}\n`);
        } else {
          fileContent = await fetch(RAW(`skills/${item.id}/SKILL.md`)).then(r => r.ok ? r.text() : `---\nname: ${item.id}\ndescription: "${item.description}"\n---\n\n# ${item.name}\n\n${item.description}\n`);
        }
        const content = btoa(unescape(encodeURIComponent(fileContent)));
        await fetch(`${base}/contents/.claude/skills/${item.id}/SKILL.md`, {
          method: 'PUT', headers: h,
          body: JSON.stringify({ message: `Add ${item.name} ${isKB ? 'knowledgebase' : 'skill'}`, content, branch }),
        });
      }

      const names = selectedItems.map(s => s.name).join(', ');
      const typeLabel = isKB ? 'Knowledgebases' : 'Skills';
      const body = `## ${typeLabel} added\n\n${selectedItems.map(s => `- **${s.name}** — ${s.description}`).join('\n')}${isKB ? '\n\n> Universal guardrails have been automatically prepended to all knowledgebases to prevent hallucinations, prompt injection, and out-of-domain answers.' : ''}\n\n---\n*Deployed via [Skills Store](${window.location.origin}) from [\`${CFG.repoOwner}/${CFG.repoName}\`](https://github.com/${CFG.repoOwner}/${CFG.repoName})*`;
      const pr = await fetch(`${base}/pulls`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ title: `Add ${typeLabel.toLowerCase()}: ${names}`, body, head: branch, base: default_branch }),
      }).then(r => r.json());

      pr.html_url ? setPrUrl(pr.html_url) : setError(pr.message || 'PR creation failed');
    } catch (e) { setError(e.message); }
    setCreating(false);
  };

  const typeLabel = contentType === 'skills' ? 'skill' : 'knowledgebase';
  const typeLabelPlural = contentType === 'skills' ? 'skills' : 'knowledgebases';

  const navItems = [
    { key: 'skills', label: 'Skills', icon: <Icons.Package />, count: skills.length },
    { key: 'knowledgebases', label: 'Knowledgebases', icon: <Icons.BookOpen />, count: knowledgebases.length },
  ];

  return (
    <div className="min-h-screen pb-28">
      {/* Header with primary navigation */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5">
          {/* Top row: logo + user */}
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <div className="bg-brand-600 text-white p-2 rounded-xl"><Icons.Package /></div>
              <div>
                <h1 className="font-bold text-surface-900 leading-none">Skills Store</h1>
                {isConfigured && <p className="text-xs text-surface-500 mt-0.5">{CFG.repoOwner}/{CFG.repoName}</p>}
              </div>
            </div>
            {ghUser
              ? <div className="flex items-center gap-2">
                  <img src={ghUser.avatar_url} className="w-7 h-7 rounded-full" />
                  <span className="text-sm font-medium text-surface-800 hidden sm:inline">{ghUser.login}</span>
                  <button onClick={() => { setGhToken(''); setGhUser(null); localStorage.removeItem('gh_token'); }} className="text-xs text-surface-400 hover:text-surface-700 ml-1">Sign out</button>
                </div>
              : <button onClick={loginWithGitHub} className="inline-flex items-center gap-2 bg-surface-900 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-surface-800 transition-colors">
                  <Icons.Github /> Sign in with GitHub
                </button>
            }
          </div>

          {/* Primary navigation */}
          <nav className="flex gap-1 -mb-px">
            {navItems.map(item => (
              <button key={item.key} onClick={() => setSection(item.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  section === item.key
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                }`}>
                {item.icon}
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${section === item.key ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-500'}`}>{item.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-6">
        {!isConfigured && <ConfigWarning />}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3.5 mb-5 flex items-start gap-3 fade-in">
            <span className="text-red-400 mt-0.5 flex-shrink-0"><Icons.AlertCircle /></span>
            <p className="text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 flex-shrink-0"><Icons.X /></button>
          </div>
        )}

        {/* Sub-navigation: Browse / Guide */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 bg-surface-100 p-1 rounded-xl">
            <button onClick={() => setView('browse')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'browse' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
              Browse
            </button>
            <button onClick={() => setView('guide')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'guide' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
              How It Works
            </button>
          </div>

          {view === 'browse' && section === 'knowledgebases' && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <Icons.Shield />
              <span>Guardrails auto-included</span>
            </div>
          )}
        </div>

        {/* Guide view */}
        {view === 'guide' && (
          <div className="fade-in">
            {section === 'skills' ? <GuideSections /> : <KBGuideSections />}
          </div>
        )}

        {/* Browse view */}
        {view === 'browse' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"><Icons.Search /></div>
                <input type="text" placeholder={contentType === 'skills' ? 'Search by name, description, or trigger keyword...' : 'Search by name, domain, or keyword...'} value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${catFilter === c ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:border-surface-300'}`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-surface-500">
                {loading ? `Loading ${typeLabelPlural}...` : `${filtered.length} ${filtered.length !== 1 ? typeLabelPlural : typeLabel}`}
                {selected.size > 0 && <span className="text-brand-600 font-medium"> &middot; {selected.size} selected</span>}
              </p>
              {filtered.length > 0 && (
                <button onClick={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(s => s.id)))}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
                </button>
              )}
            </div>

            {loading
              ? <div className="flex items-center justify-center py-20 text-surface-400 gap-2"><Icons.Loader /><span className="text-sm">Loading from GitHub...</span></div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(s => <SkillCard key={s.id} skill={s} selected={selected.has(s.id)} onToggle={toggle} onDetail={setDetailSkill} />)}
                </div>
            }
          </>
        )}
      </main>

      {/* Deploy bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-surface-200 shadow-xl z-40 fade-in">
          <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="bg-brand-100 text-brand-700 font-semibold text-sm px-2.5 py-0.5 rounded-full">{selected.size}</span>
              <span className="text-sm text-surface-600 hidden sm:inline">{typeLabel}{selected.size > 1 ? 's' : ''} ready to deploy</span>
              {targetRepo && (
                <button onClick={loadRepos}
                  className="inline-flex items-center gap-1.5 bg-surface-100 px-3 py-1.5 rounded-lg text-sm font-medium text-surface-800 hover:bg-surface-200 max-w-[180px] truncate">
                  <Icons.Github /><span className="truncate">{targetRepo.full_name}</span>
                </button>
              )}
            </div>
            <div className="flex-shrink-0">
              {!ghUser
                ? <button onClick={loginWithGitHub} className="inline-flex items-center gap-2 bg-surface-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-800 transition-colors"><Icons.Github />Sign in to deploy</button>
                : !targetRepo
                  ? <button onClick={loadRepos} className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"><Icons.Github />Choose repo</button>
                  : <button onClick={createPR} disabled={creating} className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors">
                      {creating ? <><Icons.Loader />Creating PR...</> : <><Icons.GitPR />Create pull request</>}
                    </button>
              }
            </div>
          </div>
        </div>
      )}

      {detailSkill && <SkillDetailModal skill={detailSkill} contentType={contentType} selected={selected.has(detailSkill.id)} onToggle={toggle} onClose={() => setDetailSkill(null)} />}
      {showRepoPicker && <RepoPickerModal repos={repos} loading={reposLoading} onSelect={r => { setTargetRepo(r); setShowRepoPicker(false); }} onClose={() => setShowRepoPicker(false)} />}
      {prUrl && <SuccessModal prUrl={prUrl} onClose={() => setPrUrl(null)} />}
    </div>
  );
}
