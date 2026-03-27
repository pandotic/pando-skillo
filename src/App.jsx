import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CFG, RAW, MANIFEST_URL } from './config';
import { Icons } from './components/Icons';
import SkillCard from './components/SkillCard';
import SkillDetailModal from './components/SkillDetailModal';
import RepoPickerModal from './components/RepoPickerModal';
import SuccessModal from './components/SuccessModal';

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

export default function App() {
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [ghToken, setGhToken] = useState(localStorage.getItem('gh_token') || '');
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

  useEffect(() => {
    if (!isConfigured) { setLoadingSkills(false); return; }
    fetch(MANIFEST_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setSkills(data); setLoadingSkills(false); })
      .catch(err => { setError(`Could not load skills manifest from GitHub (${err.message}). Check that repoOwner/repoName are correct and the repo is public.`); setLoadingSkills(false); });
  }, [isConfigured]);

  useEffect(() => {
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

  const categories = useMemo(() => ['All', ...new Set(skills.map(s => s.category))], [skills]);

  const filtered = useMemo(() => skills.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.triggers.some(t => t.toLowerCase().includes(q));
    const matchC = catFilter === 'All' || s.category === catFilter;
    return matchQ && matchC;
  }), [skills, search, catFilter]);

  const toggle = useCallback(id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);

  const loginWithGitHub = () => {
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

      const branch = `add-skills-${Date.now()}`;
      await fetch(`${base}/git/refs`, { method: 'POST', headers: h, body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }) });

      const selectedSkills = skills.filter(s => selected.has(s.id));
      for (const skill of selectedSkills) {
        const skillContent = await fetch(RAW(`skills/${skill.id}/SKILL.md`)).then(r => r.ok ? r.text() : `---\nname: ${skill.id}\ndescription: "${skill.description}"\n---\n\n# ${skill.name}\n\n${skill.description}\n`);
        const content = btoa(unescape(encodeURIComponent(skillContent)));
        await fetch(`${base}/contents/.claude/skills/${skill.id}/SKILL.md`, {
          method: 'PUT', headers: h,
          body: JSON.stringify({ message: `Add ${skill.name} skill`, content, branch }),
        });
      }

      const names = selectedSkills.map(s => s.name).join(', ');
      const body = `## Skills added\n\n${selectedSkills.map(s => `- **${s.name}** — ${s.description}`).join('\n')}\n\n---\n*Deployed via [Skills Store](${window.location.origin}) from [\`${CFG.repoOwner}/${CFG.repoName}\`](https://github.com/${CFG.repoOwner}/${CFG.repoName})*`;
      const pr = await fetch(`${base}/pulls`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ title: `Add skills: ${names}`, body, head: branch, base: default_branch }),
      }).then(r => r.json());

      pr.html_url ? setPrUrl(pr.html_url) : setError(pr.message || 'PR creation failed');
    } catch (e) { setError(e.message); }
    setCreating(false);
  };

  return (
    <div className="min-h-screen pb-28">
      <header className="bg-white border-b border-surface-200 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
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
      </header>

      <main className="max-w-5xl mx-auto px-5 py-7">
        {!isConfigured && <ConfigWarning />}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3.5 mb-5 flex items-start gap-3 fade-in">
            <span className="text-red-400 mt-0.5 flex-shrink-0"><Icons.AlertCircle /></span>
            <p className="text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 flex-shrink-0"><Icons.X /></button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"><Icons.Search /></div>
            <input type="text" placeholder="Search by name, description, or trigger keyword..." value={search} onChange={e => setSearch(e.target.value)}
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
            {loadingSkills ? 'Loading skills...' : `${filtered.length} skill${filtered.length !== 1 ? 's' : ''}`}
            {selected.size > 0 && <span className="text-brand-600 font-medium"> &middot; {selected.size} selected</span>}
          </p>
          {filtered.length > 0 && (
            <button onClick={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(s => s.id)))}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>

        {loadingSkills
          ? <div className="flex items-center justify-center py-20 text-surface-400 gap-2"><Icons.Loader /><span className="text-sm">Loading from GitHub...</span></div>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(s => <SkillCard key={s.id} skill={s} selected={selected.has(s.id)} onToggle={toggle} onDetail={setDetailSkill} />)}
            </div>
        }
      </main>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-surface-200 shadow-xl z-40 fade-in">
          <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="bg-brand-100 text-brand-700 font-semibold text-sm px-2.5 py-0.5 rounded-full">{selected.size}</span>
              <span className="text-sm text-surface-600 hidden sm:inline">skill{selected.size > 1 ? 's' : ''} ready to deploy</span>
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

      {detailSkill && <SkillDetailModal skill={detailSkill} selected={selected.has(detailSkill.id)} onToggle={toggle} onClose={() => setDetailSkill(null)} />}
      {showRepoPicker && <RepoPickerModal repos={repos} loading={reposLoading} onSelect={r => { setTargetRepo(r); setShowRepoPicker(false); }} onClose={() => setShowRepoPicker(false)} />}
      {prUrl && <SuccessModal prUrl={prUrl} onClose={() => setPrUrl(null)} />}
    </div>
  );
}
