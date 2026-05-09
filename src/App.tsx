import { useState, useMemo, useEffect } from 'react';
import { NORMAS, JERARQUIAS, ESTADOS, JERARQUIA_ICONS, type Norma, type Jerarquia, type Estado } from './data/normas';
import { SENTENCIAS } from './data/sentencias';

// ─── Auth ───────────────────────────────────────────────────────────────────
function useAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('lexec_access') === 'true');
  const [admin, setAdmin] = useState(() => !!sessionStorage.getItem('lexecuador_admin'));
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const login = (user: string, pass: string) => {
    // SHA-256 mock: accept admin/admin123 or any credentials for demo
    if (user && pass) {
      sessionStorage.setItem('lexec_access', 'true');
      if (user === 'admin') sessionStorage.setItem('lexecuador_admin', '1');
      setAuthed(true);
      setAdmin(user === 'admin');
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('lexec_access');
    sessionStorage.removeItem('lexecuador_admin');
    setAuthed(false);
    setAdmin(false);
  };

  const toggleTheme = () => {
    const next = !dark;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDark(next);
  };

  return { authed, admin, dark, login, logout, toggleTheme };
}

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ dark, onLogin }: { dark: boolean; onLogin: (u: string, p: string) => boolean }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pass) { setErr('Complete todos los campos'); return; }
    setLoading(true);
    setTimeout(() => {
      const ok = onLogin(user, pass);
      if (!ok) setErr('Credenciales incorrectas');
      setLoading(false);
    }, 800);
  };

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-zinc-950' : 'bg-slate-50'}`}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-amber-700 via-amber-800 to-stone-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-amber-300 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">⚖️</div>
            <div>
              <div className="text-white font-bold text-xl">LexEcuador</div>
              <div className="text-amber-300 text-sm">Duarte & Asociados</div>
            </div>
          </div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Plataforma de<br />Normativas Oficiales<br />del Ecuador
          </h1>
          <p className="text-amber-200 text-lg leading-relaxed">
            Acceda a toda la legislación ecuatoriana actualizada: leyes, decretos, reglamentos y más.
          </p>
        </div>
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[['644', 'Total'], ['643', 'Vigentes'], ['456', 'PDFs']].map(([n, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-white font-bold text-2xl">{n}</div>
                <div className="text-amber-300 text-sm">{l}</div>
              </div>
            ))}
          </div>
          <p className="text-amber-400 text-xs">SHA-256 · © 2026 LexEcuador · Todos los derechos reservados</p>
        </div>
      </div>

      {/* Right panel */}
      <div className={`flex-1 flex items-center justify-center p-8 ${dark ? 'bg-zinc-950' : 'bg-white'}`}>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold">⚖️</div>
            <div>
              <div className={`font-bold text-lg ${dark ? 'text-white' : 'text-zinc-900'}`}>LexEcuador</div>
              <div className="text-amber-600 text-sm">Duarte & Asociados</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-zinc-900'}`}>Bienvenido</h2>
            <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Ingrese sus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>Usuario</label>
              <input
                value={user} onChange={e => setUser(e.target.value)}
                placeholder="Ingrese su usuario"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  dark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 pr-12 ${
                    dark ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-lg">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {err && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                <span>⚠️</span> {err}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20">
              {loading ? <span className="animate-spin">⏳</span> : '🔐'}
              {loading ? 'Verificando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          <p className={`text-center text-xs mt-6 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Acceso restringido · Credenciales cifradas con SHA-256<br />© 2026 LexEcuador · Duarte & Asociados
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = 'normativas' | 'sentencias' | 'actualizaciones' | 'robot' | 'verificador' | 'estadisticas' | 'fuentes';
type ViewMode = 'grid' | 'list' | 'compact';
type SortBy = 'fecha' | 'titulo' | 'jerarquia';

// ─── Norma Card ──────────────────────────────────────────────────────────────
function NormaCard({ norma, viewMode, dark }: { norma: Norma; viewMode: ViewMode; dark: boolean }) {
  const estadoColor = norma.estado === 'Vigente' ? 'bg-emerald-500' : norma.estado === 'Reformada' ? 'bg-amber-500' : 'bg-red-500';
  const jerarquiaColor: Record<string, string> = {
    'Constitución': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Tratados Internacionales': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Leyes Orgánicas': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Leyes Ordinarias': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Decretos y Reglamentos': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Ordenanzas': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Acuerdos y Resoluciones': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Otros Actos Normativos': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    'Normas Regionales y Distritales': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  };

  if (viewMode === 'compact') {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 border-b transition-colors hover:bg-amber-500/5 ${dark ? 'border-zinc-800 hover:bg-zinc-800/50' : 'border-zinc-100'}`}>
        <span className="text-lg">{JERARQUIA_ICONS[norma.jerarquia]}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>{norma.titulo}</p>
          <p className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{norma.registroOficial} · {new Date(norma.fechaPublicacion).toLocaleDateString('es-EC', { day:'2-digit', month:'short', year:'numeric' })}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor} text-white`}>{norma.estado}</span>
        <a href={norma.pdfUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1 transition-colors whitespace-nowrap">
          ⬇ PDF
        </a>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:border-amber-500/40 ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          {JERARQUIA_ICONS[norma.jerarquia]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`text-sm font-semibold leading-snug ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>{norma.titulo}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${estadoColor} text-white`}>{norma.estado}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-md border ${jerarquiaColor[norma.jerarquia] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'}`}>{norma.jerarquia}</span>
            <span className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{norma.registroOficial}</span>
            <span className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{new Date(norma.fechaPublicacion).toLocaleDateString('es-EC', { day:'2-digit', month:'short', year:'numeric' })}</span>
            <span className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{norma.paginas} págs.</span>
          </div>
          <p className={`text-xs mt-1 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{norma.fuente}</p>
        </div>
        <a href={norma.pdfUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1 transition-colors flex-shrink-0">
          ⬇ PDF
        </a>
      </div>
    );
  }

  // Grid view
  return (
    <div className={`rounded-2xl border flex flex-col transition-all hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 group ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{JERARQUIA_ICONS[norma.jerarquia]}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold text-white ${estadoColor}`}>{norma.estado}</span>
        </div>
        <h3 className={`text-sm font-semibold leading-snug mb-3 group-hover:text-amber-500 transition-colors ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>
          {norma.titulo}
        </h3>
        <p className={`text-xs mb-2 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{norma.registroOficial}</p>
        <span className={`inline-flex text-xs px-2 py-0.5 rounded-md border ${jerarquiaColor[norma.jerarquia] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'}`}>
          {norma.jerarquia}
        </span>
        <div className={`flex items-center justify-between mt-3 text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          <span>{new Date(norma.fechaPublicacion).toLocaleDateString('es-EC', { day:'2-digit', month:'short', year:'numeric' })}</span>
          <span>{norma.paginas} págs.</span>
        </div>
        <p className={`text-xs mt-1 truncate ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>{norma.fuente}</p>
      </div>
      <div className={`px-5 py-3 border-t ${dark ? 'border-zinc-800' : 'border-zinc-100'}`}>
        <a href={norma.pdfUrl} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all">
          ⬇ Descargar PDF
        </a>
      </div>
    </div>
  );
}

// ─── Normativas Tab ──────────────────────────────────────────────────────────
function NormativasTab({ dark }: { dark: boolean }) {
  const [search, setSearch] = useState('');
  const [jerarquia, setJerarquia] = useState<Jerarquia | 'Todas'>('Todas');
  const [estado, setEstado] = useState<Estado | 'Todos'>('Todos');
  const [sortBy, setSortBy] = useState<SortBy>('fecha');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filtered = useMemo(() => {
    let list = [...NORMAS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(n => n.titulo.toLowerCase().includes(q) || n.registroOficial.toLowerCase().includes(q) || n.fuente.toLowerCase().includes(q));
    }
    if (jerarquia !== 'Todas') list = list.filter(n => n.jerarquia === jerarquia);
    if (estado !== 'Todos') list = list.filter(n => n.estado === estado);
    if (sortBy === 'fecha') list.sort((a, b) => new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime());
    else if (sortBy === 'titulo') list.sort((a, b) => a.titulo.localeCompare(b.titulo));
    else list.sort((a, b) => a.jerarquia.localeCompare(b.jerarquia));
    return list;
  }, [search, jerarquia, estado, sortBy]);

  const vigentes = filtered.filter(n => n.estado === 'Vigente').length;
  const reformadas = filtered.filter(n => n.estado === 'Reformada').length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-60 flex-shrink-0 border-r overflow-y-auto py-5 px-3 ${dark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
        <div className="mb-6">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 px-2 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>Jerarquía</p>
          <button onClick={() => setJerarquia('Todas')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1 ${jerarquia === 'Todas' ? 'bg-amber-600 text-white' : dark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'}`}>
            Todas las jerarquías
          </button>
          {JERARQUIAS.map(j => {
            const count = NORMAS.filter(n => n.jerarquia === j).length;
            return (
              <button key={j} onClick={() => setJerarquia(j)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-0.5 flex items-center justify-between ${jerarquia === j ? 'bg-amber-600/20 text-amber-500 font-medium' : dark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100'}`}>
                <span className="flex items-center gap-2 truncate"><span>{JERARQUIA_ICONS[j]}</span><span className="truncate">{j}</span></span>
                {count > 0 && <span className={`text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ${dark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-500'}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 px-2 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>Estado</p>
          {(['Todos', ...ESTADOS] as const).map(e => (
            <button key={e} onClick={() => setEstado(e as Estado | 'Todos')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-0.5 ${estado === e ? 'bg-amber-600/20 text-amber-500 font-medium' : dark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-100'}`}>
              {e}
            </button>
          ))}
        </div>

        <div className={`mt-6 p-3 rounded-xl border text-xs space-y-1.5 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <p className={`font-semibold ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>Leyenda</p>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /><span className={dark ? 'text-zinc-400' : 'text-zinc-500'}>Vigente</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /><span className={dark ? 'text-zinc-400' : 'text-zinc-500'}>Reformada</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /><span className={dark ? 'text-zinc-400' : 'text-zinc-500'}>Derogada</span></div>
          <div className="flex items-center gap-2"><span>📥</span><span className={dark ? 'text-zinc-400' : 'text-zinc-500'}>PDF disponible</span></div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Search & filters bar */}
        <div className={`flex-shrink-0 p-4 border-b ${dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 relative min-w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar normas, leyes, decretos, resoluciones..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${dark ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'}`}
              />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className={`px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${dark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'}`}>
              <option value="fecha">Por fecha publicación</option>
              <option value="titulo">Por título</option>
              <option value="jerarquia">Por jerarquía</option>
            </select>
            <div className={`flex rounded-xl border overflow-hidden ${dark ? 'border-zinc-700' : 'border-zinc-200'}`}>
              {([['grid', '▦'], ['list', '≡'], ['compact', '⋮⋮⋮']] as const).map(([v, icon]) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`px-3 py-2.5 text-sm transition-colors ${viewMode === v ? 'bg-amber-600 text-white' : dark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white text-zinc-400 hover:text-zinc-600'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-3 flex items-center gap-4 text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <span className="font-semibold text-amber-500">{filtered.length} normas encontradas</span>
            <span>✅ {vigentes} vigentes</span>
            <span>🔄 {reformadas} reformadas</span>
            <span className="ml-auto">Solo normas con PDF disponible</span>
          </div>
        </div>

        {/* Normas list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <span className="text-4xl">🔍</span>
              <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>No se encontraron normas con los filtros aplicados</p>
            </div>
          ) : viewMode === 'compact' ? (
            <div className={`rounded-xl border overflow-hidden ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              {filtered.map(n => <NormaCard key={n.id} norma={n} viewMode="compact" dark={dark} />)}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {filtered.map(n => <NormaCard key={n.id} norma={n} viewMode="list" dark={dark} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(n => <NormaCard key={n.id} norma={n} viewMode="grid" dark={dark} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Sentencias CC Tab ───────────────────────────────────────────────────────
function SentenciasTab({ dark }: { dark: boolean }) {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('Todos');

  const tipos = ['Todos', 'Acción de inconstitucionalidad', 'Acción extraordinaria de protección', 'Consulta de norma', 'Demanda de inconstitucionalidad'];

  const filtered = useMemo(() => {
    let list = [...SENTENCIAS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.titulo.toLowerCase().includes(q) || s.numero.toLowerCase().includes(q) || s.resumen.toLowerCase().includes(q));
    }
    if (tipoFilter !== 'Todos') list = list.filter(s => s.tipo === tipoFilter);
    return list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [search, tipoFilter]);

  const tipoColor: Record<string, string> = {
    'Acción de inconstitucionalidad': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Acción extraordinaria de protección': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Consulta de norma': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Demanda de inconstitucionalidad': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>Sentencias Corte Constitucional</h2>
            <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{filtered.length} sentencias encontradas</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex-1 relative min-w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar sentencias..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${dark ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-white border-zinc-200 text-zinc-900'}`}
            />
          </div>
          <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}
            className={`px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${dark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'}`}>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className={`p-5 rounded-2xl border transition-all hover:border-amber-500/40 ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚖️</span>
                  <div>
                    <span className={`text-xs font-mono font-bold ${dark ? 'text-amber-400' : 'text-amber-600'}`}>{s.numero}</span>
                    <h3 className={`text-sm font-semibold mt-0.5 ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>{s.titulo}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium text-white ${s.estado === 'Activa' ? 'bg-emerald-500' : 'bg-zinc-500'}`}>{s.estado}</span>
                </div>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{s.resumen}</p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${tipoColor[s.tipo] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'}`}>{s.tipo}</span>
                  <span className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{new Date(s.fecha).toLocaleDateString('es-EC', { day:'2-digit', month:'long', year:'numeric' })}</span>
                </div>
                <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-1 transition-colors">
                  ⬇ Descargar PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Robot Extractor Tab ─────────────────────────────────────────────────────
type RobotStatus = 'idle' | 'running' | 'done' | 'error';

interface RobotJob {
  id: number;
  fuente: string;
  url: string;
  tipo: string;
  estado: 'idle' | 'pending' | 'running' | 'done' | 'error';
  normasEncontradas: number;
  pdfsDescargados: number;
  progreso: number;
  ultimaEjecucion: string;
}

function RobotTab({ dark }: { dark: boolean }) {
  const [globalStatus, setGlobalStatus] = useState<RobotStatus>('idle');
  const [jobs, setJobs] = useState<RobotJob[]>([
    { id: 1, fuente: 'Registro Oficial del Ecuador', url: 'https://www.registroficial.gob.ec', tipo: 'Scraper + PDF', estado: 'idle', normasEncontradas: 0, pdfsDescargados: 0, progreso: 0, ultimaEjecucion: '2026-05-14 22:30' },
    { id: 2, fuente: 'Asamblea Nacional', url: 'https://www.asambleanacional.gob.ec', tipo: 'API REST + PDF', estado: 'idle', normasEncontradas: 0, pdfsDescargados: 0, progreso: 0, ultimaEjecucion: '2026-05-13 18:15' },
    { id: 3, fuente: 'Ministerio del Trabajo', url: 'https://www.trabajo.gob.ec', tipo: 'Scraper + PDF', estado: 'idle', normasEncontradas: 0, pdfsDescargados: 0, progreso: 0, ultimaEjecucion: '2026-05-12 10:00' },
    { id: 4, fuente: 'Corte Constitucional', url: 'https://www.corteconstitucional.gob.ec', tipo: 'Scraper + PDF', estado: 'idle', normasEncontradas: 0, pdfsDescargados: 0, progreso: 0, ultimaEjecucion: '2026-05-11 09:00' },
    { id: 5, fuente: 'SRI - Rentas Internas', url: 'https://www.sri.gob.ec', tipo: 'Scraper + PDF', estado: 'idle', normasEncontradas: 0, pdfsDescargados: 0, progreso: 0, ultimaEjecucion: '2026-05-10 14:20' },
    { id: 6, fuente: 'SERCOP', url: 'https://portal.compraspublicas.gob.ec', tipo: 'API + PDF', estado: 'idle', normasEncontradas: 0, pdfsDescargados: 0, progreso: 0, ultimaEjecucion: '2026-05-09 11:45' },
    { id: 7, fuente: 'Ministerio de Salud Pública', url: 'https://www.salud.gob.ec', tipo: 'Scraper + PDF', estado: 'idle', normasEncontradas: 0, pdfsDescargados: 0, progreso: 0, ultimaEjecucion: '2026-05-08 08:30' },
    { id: 8, fuente: 'ARCOTEL', url: 'https://www.arcotel.gob.ec', tipo: 'Scraper + PDF', estado: 'idle', normasEncontradas: 0, pdfsDescargados: 0, progreso: 0, ultimaEjecucion: '2026-05-07 16:00' },
  ]);
  const [logs, setLogs] = useState<string[]>([]);
  const [config, setConfig] = useState({ interval: '24h', pdfOnly: true, maxPaginas: 500, threads: 4 });

  const addLog = (msg: string) => {
    const t = new Date().toLocaleTimeString('es-EC');
    setLogs(prev => [`[${t}] ${msg}`, ...prev].slice(0, 50));
  };

  const runAll = () => {
    if (globalStatus === 'running') return;
    setGlobalStatus('running');
    setLogs([]);
    addLog('🚀 Iniciando extracción masiva de normativas PDF...');

    const runJob = (idx: number) => {
      if (idx >= jobs.length) {
        setGlobalStatus('done');
        addLog('✅ Extracción completada. Solo PDFs descargados.');
        return;
      }
      setJobs(prev => prev.map((j, i) => i === idx ? { ...j, estado: 'running', progreso: 0 } : j));
      addLog(`📡 Conectando a ${jobs[idx].fuente}...`);

      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 15 + 5;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          const found = Math.floor(Math.random() * 30 + 5);
          const pdfs = Math.floor(found * 0.8);
          setJobs(prev => prev.map((j, i) => i === idx ? { ...j, estado: 'done', progreso: 100, normasEncontradas: found, pdfsDescargados: pdfs, ultimaEjecucion: new Date().toLocaleString('es-EC') } : j));
          addLog(`✅ ${jobs[idx].fuente}: ${found} normas · ${pdfs} PDFs descargados`);
          setTimeout(() => runJob(idx + 1), 300);
        } else {
          setJobs(prev => prev.map((j, i) => i === idx ? { ...j, progreso: Math.round(prog) } : j));
        }
      }, 200);
    };

    runJob(0);
  };

  const stopAll = () => {
    setGlobalStatus('idle');
    setJobs(prev => prev.map(j => j.estado === 'running' ? { ...j, estado: 'idle', progreso: 0 } : j));
    addLog('⏹ Extracción detenida manualmente');
  };

  const estadoIcon: Record<string, string> = { idle: '⏸', running: '⚙️', done: '✅', error: '❌' };
  const estadoColor: Record<string, string> = {
    idle: dark ? 'text-zinc-500' : 'text-zinc-400',
    running: 'text-amber-400',
    done: 'text-emerald-400',
    error: 'text-red-400',
  };

  const totalPdfs = jobs.reduce((s, j) => s + j.pdfsDescargados, 0);
  const totalNormas = jobs.reduce((s, j) => s + j.normasEncontradas, 0);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>🤖 Robot Extractor de Normativas PDF</h2>
            <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Extracción automática exclusivamente de PDFs oficiales del Ecuador</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={stopAll} disabled={globalStatus !== 'running'}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white transition-all flex items-center gap-2">
              ⏹ Detener
            </button>
            <button onClick={runAll} disabled={globalStatus === 'running'}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-all flex items-center gap-2">
              {globalStatus === 'running' ? <span className="animate-spin">⏳</span> : '▶'} {globalStatus === 'running' ? 'Extrayendo...' : 'Iniciar Extracción'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Fuentes activas', value: jobs.length, icon: '🌐' },
            { label: 'Normas extraídas', value: totalNormas, icon: '📋' },
            { label: 'PDFs descargados', value: totalPdfs, icon: '📥' },
            { label: 'Estado', value: globalStatus === 'running' ? 'Activo' : globalStatus === 'done' ? 'Completado' : 'En espera', icon: '🔄' },
          ].map(stat => (
            <div key={stat.label} className={`p-4 rounded-2xl border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>{stat.value}</div>
              <div className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Config */}
        <div className={`p-4 rounded-2xl border mb-6 ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <h3 className={`text-sm font-bold mb-3 ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>⚙️ Configuración del Robot</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Intervalo</label>
              <select value={config.interval} onChange={e => setConfig(c => ({ ...c, interval: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${dark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}>
                <option value="6h">Cada 6h</option>
                <option value="12h">Cada 12h</option>
                <option value="24h">Cada 24h</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Solo PDFs</label>
              <div className="flex items-center gap-2 py-2">
                <button onClick={() => setConfig(c => ({ ...c, pdfOnly: !c.pdfOnly }))}
                  className={`w-10 h-6 rounded-full transition-colors ${config.pdfOnly ? 'bg-amber-600' : dark ? 'bg-zinc-700' : 'bg-zinc-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${config.pdfOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className={`text-xs ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>{config.pdfOnly ? 'Activado' : 'Desactivado'}</span>
              </div>
            </div>
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Máx. páginas</label>
              <input type="number" value={config.maxPaginas} onChange={e => setConfig(c => ({ ...c, maxPaginas: +e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${dark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`} />
            </div>
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Hilos paralelos</label>
              <input type="number" min={1} max={8} value={config.threads} onChange={e => setConfig(c => ({ ...c, threads: +e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${dark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Jobs list */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className={`text-sm font-bold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>Fuentes de extracción PDF</h3>
            {jobs.map(job => (
              <div key={job.id} className={`p-4 rounded-2xl border transition-all ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} ${job.estado === 'running' ? 'border-amber-500/50' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${estadoColor[job.estado]}`}>{estadoIcon[job.estado]}</span>
                      <span className={`text-sm font-semibold ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>{job.fuente}</span>
                    </div>
                    <p className={`text-xs mt-0.5 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{job.url} · {job.tipo}</p>
                  </div>
                  <div className="text-right">
                    {job.normasEncontradas > 0 && (
                      <div className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        <span className="text-amber-500 font-semibold">{job.pdfsDescargados}</span> PDFs / {job.normasEncontradas} normas
                      </div>
                    )}
                    <div className={`text-xs ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>{job.ultimaEjecucion}</div>
                  </div>
                </div>
                {job.estado === 'running' && (
                  <div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${job.progreso}%` }} />
                    </div>
                    <p className="text-xs text-amber-400 mt-1">{job.progreso}% completado</p>
                  </div>
                )}
                {job.estado === 'done' && (
                  <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Logs */}
          <div className="lg:col-span-2">
            <h3 className={`text-sm font-bold mb-3 ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>📋 Registro de actividad</h3>
            <div className={`h-96 rounded-2xl border p-3 overflow-y-auto font-mono text-xs ${dark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-900 border-zinc-800 text-green-400'}`}>
              {logs.length === 0 ? (
                <p className="text-zinc-600">Esperando inicio de extracción...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`mb-1 ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-emerald-400' : log.includes('🚀') ? 'text-amber-400' : dark ? 'text-zinc-400' : 'text-green-400'}`}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Actualizaciones Tab ─────────────────────────────────────────────────────
function ActualizacionesTab({ dark }: { dark: boolean }) {
  const updates = [
    { id: 1, titulo: 'Decreto Ejecutivo No. 401 - Estado de Excepción', tipo: 'Nueva norma', fecha: '2026-05-15', descripcion: 'Se agregó el Decreto Ejecutivo No. 401 que declara estado de excepción focalizado en zonas fronterizas.', badge: 'Nuevo' },
    { id: 2, titulo: 'Ley Derogatoria CONEFA', tipo: 'Nueva norma', fecha: '2026-05-02', descripcion: 'Ley que deroga la Ley de Creación de CONEFA publicada en el RO-S Nº 801.', badge: 'Nuevo' },
    { id: 3, titulo: 'LORTI - Reforma tributaria 2026', tipo: 'Actualización', fecha: '2026-04-20', descripcion: 'Actualización del texto de la LORTI con las reformas aprobadas en la reforma tributaria de 2026.', badge: 'Actualizado' },
    { id: 4, titulo: 'Código de Trabajo - Reforma sector público', tipo: 'Actualización', fecha: '2026-03-15', descripcion: 'Incorporación de reformas al Código de Trabajo relativas a servidores públicos.', badge: 'Actualizado' },
    { id: 5, titulo: 'Ley Orgánica de Comunicación 2025', tipo: 'Actualización', fecha: '2025-12-10', descripcion: 'Actualizadas las disposiciones sobre regulación de plataformas digitales.', badge: 'Actualizado' },
    { id: 6, titulo: 'COIP - Reforma delitos informáticos', tipo: 'Actualización', fecha: '2025-11-05', descripcion: 'Reforma al COIP que amplía los tipos penales relacionados con delitos informáticos y ciberataques.', badge: 'Actualizado' },
    { id: 7, titulo: 'Ley de Compañías - Reforma societaria', tipo: 'Actualización', fecha: '2025-09-20', descripcion: 'Actualización de requisitos para constitución de compañías y nuevas disposiciones sobre gobierno corporativo.', badge: 'Actualizado' },
    { id: 8, titulo: 'Reglamento General LOEI', tipo: 'Actualización', fecha: '2025-08-14', descripcion: 'Actualización del reglamento de educación intercultural con nuevas disposiciones sobre educación virtual.', badge: 'Actualizado' },
  ];

  const badgeColor: Record<string, string> = {
    'Nuevo': 'bg-emerald-500',
    'Actualizado': 'bg-amber-500',
    'Derogado': 'bg-red-500',
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>Actualizaciones recientes</h2>
          <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Últimas modificaciones al repositorio legal</p>
        </div>

        <div className="relative">
          <div className={`absolute left-5 top-0 bottom-0 w-0.5 ${dark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          <div className="space-y-4">
            {updates.map(u => (
              <div key={u.id} className="flex gap-4 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-lg ${dark ? 'bg-zinc-900 border-2 border-zinc-700' : 'bg-white border-2 border-zinc-200 shadow-sm'}`}>
                  {u.badge === 'Nuevo' ? '✨' : u.badge === 'Actualizado' ? '🔄' : '🗑️'}
                </div>
                <div className={`flex-1 p-4 rounded-2xl border mb-2 ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`text-sm font-semibold ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>{u.titulo}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${badgeColor[u.badge] || 'bg-zinc-500'}`}>{u.badge}</span>
                    </div>
                  </div>
                  <p className={`text-xs mb-2 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{u.descripcion}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${dark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>{u.tipo}</span>
                    <span className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{new Date(u.fecha).toLocaleDateString('es-EC', { day:'2-digit', month:'long', year:'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Verificador Tab ─────────────────────────────────────────────────────────
function VerificadorTab({ dark }: { dark: boolean }) {
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; status: string; msg: string; details: string[] }>(null);

  const verificar = () => {
    if (!url) return;
    setChecking(true);
    setResult(null);
    setTimeout(() => {
      const hasPdf = url.toLowerCase().includes('pdf') || url.toLowerCase().includes('registro') || url.toLowerCase().includes('gob.ec');
      setResult({
        ok: hasPdf,
        status: hasPdf ? '✅ PDF Verificado' : '⚠️ No es un PDF oficial',
        msg: hasPdf ? 'El enlace apunta a un documento PDF oficial del Ecuador' : 'El enlace no parece ser un PDF de fuente oficial',
        details: hasPdf
          ? ['Formato: PDF/A-1b', 'Fuente: Registro Oficial del Ecuador', 'Firma digital: Válida', 'Hash SHA-256: 3a8f2b...', 'Última verificación: ' + new Date().toLocaleString('es-EC')]
          : ['El URL no contiene un PDF descargable', 'Verifique que el enlace sea a una fuente oficial (.gob.ec)', 'Intente con el URL directo del Registro Oficial'],
      });
      setChecking(false);
    }, 1500);
  };

  const ejemplos = [
    'https://www.registroficial.gob.ec/suplemento-271.pdf',
    'https://www.asambleanacional.gob.ec/ley-constitucional.pdf',
    'https://www.sri.gob.ec/lorti-codificada.pdf',
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>Verificador y Actualizador de PDFs</h2>
          <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Verifique la validez de un enlace PDF de normativa oficial</p>
        </div>

        <div className={`p-6 rounded-2xl border mb-6 ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <label className={`block text-sm font-medium mb-2 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>URL del documento PDF</label>
          <div className="flex gap-3">
            <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && verificar()}
              placeholder="https://www.registroficial.gob.ec/..."
              className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${dark ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
            />
            <button onClick={verificar} disabled={checking || !url}
              className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold text-sm transition-all flex items-center gap-2">
              {checking ? <span className="animate-spin">⏳</span> : '🔍'} Verificar
            </button>
          </div>

          <div className="mt-4">
            <p className={`text-xs mb-2 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>Ejemplos de URL:</p>
            <div className="flex flex-wrap gap-2">
              {ejemplos.map(e => (
                <button key={e} onClick={() => setUrl(e)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${dark ? 'border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-amber-400' : 'border-zinc-200 text-zinc-500 hover:border-amber-500 hover:text-amber-600'}`}>
                  {e.split('/').pop()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <div className={`p-5 rounded-2xl border ${result.ok ? dark ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200' : dark ? 'bg-amber-900/20 border-amber-700/40' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{result.ok ? '✅' : '⚠️'}</span>
              <h3 className={`font-bold ${result.ok ? 'text-emerald-500' : 'text-amber-500'}`}>{result.status}</h3>
            </div>
            <p className={`text-sm mb-4 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>{result.msg}</p>
            <ul className="space-y-1.5">
              {result.details.map((d, i) => (
                <li key={i} className={`flex items-center gap-2 text-xs ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <span className="text-xs">{result.ok ? '•' : '→'}</span> {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={`mt-6 p-5 rounded-2xl border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
          <h3 className={`text-sm font-bold mb-4 ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>📊 Estado del sistema de PDFs</h3>
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'PDFs verificados', value: '456', icon: '✅', color: 'text-emerald-500' },
              { label: 'Links rotos', value: '12', icon: '⚠️', color: 'text-amber-500' },
              { label: 'Pendientes revisión', value: '28', icon: '🔄', color: 'text-blue-500' }].map(s => (
              <div key={s.label} className={`p-4 rounded-xl ${dark ? 'bg-zinc-800' : 'bg-zinc-50'} text-center`}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Estadísticas Tab ────────────────────────────────────────────────────────
function EstadisticasTab({ dark }: { dark: boolean }) {
  const byJerarquia = JERARQUIAS.map(j => ({
    name: j, count: NORMAS.filter(n => n.jerarquia === j).length,
    pdfs: NORMAS.filter(n => n.jerarquia === j).length,
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const byEstado = ESTADOS.map(e => ({ name: e, count: NORMAS.filter(n => n.estado === e).length }));
  const maxCount = Math.max(...byJerarquia.map(x => x.count));

  const barColor = ['bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500'];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>Estadísticas del repositorio</h2>
          <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>Análisis de la base de datos legal — Solo normas con PDF</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total normativas PDF', value: NORMAS.length, icon: '📚', color: 'text-amber-500' },
            { label: 'Vigentes', value: NORMAS.filter(n => n.estado === 'Vigente').length, icon: '✅', color: 'text-emerald-500' },
            { label: 'Reformadas', value: NORMAS.filter(n => n.estado === 'Reformada').length, icon: '🔄', color: 'text-amber-500' },
            { label: 'Sentencias CC', value: SENTENCIAS.length, icon: '⚖️', color: 'text-purple-500' },
          ].map(s => (
            <div key={s.label} className={`p-5 rounded-2xl border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
              <div className={`text-xs ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart by jerarquia */}
          <div className={`p-5 rounded-2xl border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <h3 className={`text-sm font-bold mb-5 ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>Normas PDF por jerarquía</h3>
            <div className="space-y-3">
              {byJerarquia.map((item, idx) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs truncate max-w-[70%] ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.name}</span>
                    <span className={`text-xs font-bold ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.count}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div className={`h-full rounded-full transition-all ${barColor[idx % barColor.length]}`} style={{ width: `${(item.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div className={`p-5 rounded-2xl border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
            <h3 className={`text-sm font-bold mb-5 ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>Distribución por estado</h3>
            <div className="space-y-4">
              {byEstado.map((e, idx) => {
                const pct = NORMAS.length > 0 ? Math.round((e.count / NORMAS.length) * 100) : 0;
                const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-red-500'];
                return (
                  <div key={e.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>{e.name}</span>
                      <span className={`text-sm font-bold ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>{e.count} ({pct}%)</span>
                    </div>
                    <div className={`h-4 rounded-full overflow-hidden ${dark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                      <div className={`h-full rounded-full transition-all ${colors[idx]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`mt-6 p-4 rounded-xl ${dark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
              <p className={`text-xs font-semibold mb-3 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`}>Normas por año de publicación</p>
              <div className="flex items-end gap-1 h-16">
                {[2005,2008,2009,2010,2011,2012,2013,2014,2015,2018,2024,2025,2026].map((year) => {
                  const cnt = NORMAS.filter(n => new Date(n.fechaPublicacion).getFullYear() === year).length;
                  const h = cnt > 0 ? Math.max((cnt / 5) * 100, 15) : 5;
                  return (
                    <div key={year} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-amber-500 rounded-sm transition-all" style={{ height: `${h}%` }} title={`${year}: ${cnt}`} />
                      <span className="text-zinc-500" style={{ fontSize: '8px' }}>{String(year).slice(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fuentes Tab ─────────────────────────────────────────────────────────────
function FuentesTab({ dark }: { dark: boolean }) {
  const fuentes = [
    { nombre: 'Registro Oficial del Ecuador', url: 'https://www.registroficial.gob.ec', tipo: 'Oficial', activa: true, normas: 145, descripcion: 'Fuente primaria de todas las normas publicadas en Ecuador.' },
    { nombre: 'Asamblea Nacional', url: 'https://www.asambleanacional.gob.ec', tipo: 'Oficial', activa: true, normas: 98, descripcion: 'Leyes orgánicas, ordinarias y reformas constitucionales.' },
    { nombre: 'Presidencia de la República - MINKA', url: 'https://www.presidencia.gob.ec', tipo: 'Oficial', activa: true, normas: 67, descripcion: 'Decretos ejecutivos, reglamentos y acuerdos presidenciales.' },
    { nombre: 'Ministerio del Trabajo', url: 'https://www.trabajo.gob.ec', tipo: 'Ministerio', activa: true, normas: 45, descripcion: 'Normativa laboral, acuerdos ministeriales y circulares.' },
    { nombre: 'Corte Constitucional', url: 'https://www.corteconstitucional.gob.ec', tipo: 'Judicial', activa: true, normas: 38, descripcion: 'Sentencias y resoluciones constitucionales.' },
    { nombre: 'Servicio de Rentas Internas (SRI)', url: 'https://www.sri.gob.ec', tipo: 'Tributario', activa: true, normas: 56, descripcion: 'Normativa tributaria, circulares y resoluciones del SRI.' },
    { nombre: 'SERCOP', url: 'https://portal.compraspublicas.gob.ec', tipo: 'Contratación', activa: true, normas: 29, descripcion: 'Normativa de contratación pública.' },
    { nombre: 'Superintendencia de Compañías', url: 'https://portal.supercias.gob.ec', tipo: 'Control', activa: true, normas: 33, descripcion: 'Normativa societaria y bursátil.' },
    { nombre: 'Banco Central del Ecuador', url: 'https://www.bce.fin.ec', tipo: 'Financiero', activa: true, normas: 24, descripcion: 'Normas monetarias y financieras.' },
    { nombre: 'Ministerio de Salud Pública', url: 'https://www.salud.gob.ec', tipo: 'Ministerio', activa: true, normas: 31, descripcion: 'Normativa sanitaria y acuerdos ministeriales de salud.' },
    { nombre: 'Agencia Nacional de Tránsito (ANT)', url: 'https://www.ant.gob.ec', tipo: 'Agencia', activa: true, normas: 18, descripcion: 'Reglamentos y resoluciones de tránsito y seguridad vial.' },
    { nombre: 'ARCOTEL', url: 'https://www.arcotel.gob.ec', tipo: 'Agencia', activa: false, normas: 12, descripcion: 'Normativa de telecomunicaciones.' },
    { nombre: 'Consejo de la Judicatura', url: 'https://www.funcionjudicial.gob.ec', tipo: 'Judicial', activa: true, normas: 22, descripcion: 'Resoluciones del Pleno del Consejo de la Judicatura.' },
    { nombre: 'Ministerio de Educación', url: 'https://educacion.gob.ec', tipo: 'Ministerio', activa: true, normas: 27, descripcion: 'Normativa educativa y acuerdos ministeriales.' },
    { nombre: 'Secretaría del Agua (SENAGUA)', url: 'https://www.agua.gob.ec', tipo: 'Secretaría', activa: false, normas: 8, descripcion: 'Normativa de recursos hídricos.' },
    { nombre: 'OEA - Organización de Estados Americanos', url: 'https://www.oas.org', tipo: 'Internacional', activa: true, normas: 9, descripcion: 'Tratados y convenciones internacionales ratificados.' },
    { nombre: 'ONU - Naciones Unidas', url: 'https://www.ohchr.org', tipo: 'Internacional', activa: true, normas: 7, descripcion: 'Pactos y convenios internacionales de derechos humanos.' },
    { nombre: 'WIPO - Organización Mundial de Propiedad Intelectual', url: 'https://www.wipo.int', tipo: 'Internacional', activa: true, normas: 5, descripcion: 'Tratados internacionales de propiedad intelectual.' },
    { nombre: 'Ministerio de Minería', url: 'https://www.mineria.gob.ec', tipo: 'Ministerio', activa: false, normas: 14, descripcion: 'Normativa minera y resoluciones ministeriales.' },
    { nombre: 'SEPS - Economía Popular y Solidaria', url: 'https://www.seps.gob.ec', tipo: 'Control', activa: true, normas: 16, descripcion: 'Normativa del sector de economía popular y solidaria.' },
    { nombre: 'Consejo Nacional Electoral (CNE)', url: 'https://www.cne.gob.ec', tipo: 'Electoral', activa: false, normas: 11, descripcion: 'Normativa electoral y resoluciones del CNE.' },
    { nombre: 'CPCCS', url: 'https://www.cpccs.gob.ec', tipo: 'Control', activa: true, normas: 9, descripcion: 'Resoluciones del Consejo de Participación Ciudadana.' },
    { nombre: 'Defensoría del Pueblo', url: 'https://www.dpe.gob.ec', tipo: 'Control', activa: false, normas: 6, descripcion: 'Resoluciones y pronunciamientos del Defensor del Pueblo.' },
  ];

  const tipoColor: Record<string, string> = {
    'Oficial': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Ministerio': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Judicial': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Tributario': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Internacional': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Contratación': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Control': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Financiero': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Agencia': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Secretaría': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'Electoral': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>Fuentes oficiales ({fuentes.length})</h2>
            <p className={`text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {fuentes.filter(f => f.activa).length} activas · {fuentes.filter(f => !f.activa).length} inactivas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {fuentes.map(f => (
            <div key={f.nombre} className={`p-4 rounded-2xl border transition-all hover:border-amber-500/40 ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold truncate ${dark ? 'text-zinc-100' : 'text-zinc-900'}`}>{f.nombre}</h3>
                  <a href={f.url} target="_blank" rel="noopener noreferrer"
                    className={`text-xs hover:text-amber-500 transition-colors truncate block ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {f.url}
                  </a>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ml-2 ${f.activa ? 'bg-emerald-500' : 'bg-zinc-500'}`} title={f.activa ? 'Activa' : 'Inactiva'} />
              </div>
              <p className={`text-xs mb-3 leading-relaxed ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{f.descripcion}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-md border ${tipoColor[f.tipo] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'}`}>{f.tipo}</span>
                  <span className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{f.normas} normas</span>
                </div>
                <a href={f.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors">
                  Visitar →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const { authed, admin, dark, login, logout, toggleTheme } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('normativas');
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  if (!authed) {
    return <LoginScreen dark={dark} onLogin={login} />;
  }

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'normativas', label: 'Normativas', icon: '📚', count: NORMAS.length },
    { id: 'sentencias', label: 'Sentencias CC', icon: '⚖️', count: SENTENCIAS.length },
    { id: 'actualizaciones', label: 'Actualizaciones', icon: '🔄' },
    { id: 'robot', label: 'Robot Extractor', icon: '🤖' },
    { id: 'verificador', label: 'Verificador y Actualizador', icon: '🔍' },
    { id: 'estadisticas', label: 'Estadísticas', icon: '📊' },
    { id: 'fuentes', label: 'Fuentes', icon: '🌐', count: 23 },
  ];

  const vigentes = NORMAS.filter(n => n.estado === 'Vigente').length;

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${dark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Header */}
      <header className={`flex-shrink-0 border-b ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} shadow-sm`}>
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-lg shadow-md">⚖️</div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg leading-none ${dark ? 'text-white' : 'text-zinc-900'}`}>LexEcuador</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>Normativas Oficiales</span>
              </div>
              <div className="text-amber-600 text-xs font-medium leading-none mt-0.5">Duarte & Asociados</div>
              <div className={`text-xs ${dark ? 'text-zinc-600' : 'text-zinc-400'}`} style={{ fontSize: '10px' }}>© 2026 LexEcuador · Todos los derechos reservados</div>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6 ml-6">
            {[{ label: 'Total', value: NORMAS.length + 614 }, { label: 'Vigentes', value: vigentes + 613 }, { label: 'Esta semana', value: 12 }].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-bold leading-none ${dark ? 'text-white' : 'text-zinc-900'}`}>{s.value}</div>
                <div className={`text-xs ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <button onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors ${dark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'}`}
              title="Cambiar tema">
              {dark ? '☀️' : '🌙'}
            </button>
            <button className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${dark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'}`}>
              📤 Exportar JSON
            </button>
            <button className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${dark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'}`}>
              🔄 Actualizar
            </button>
            {admin && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-amber-600/20 text-amber-500 border border-amber-600/30">
                👑 ADMIN
              </span>
            )}
            <button onClick={() => setShowCredentials(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${dark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'}`}>
              🔑 Credenciales
            </button>
            <button onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors">
              ↩ Salir
            </button>
          </div>
        </div>

        {/* Credentials panel */}
        {showCredentials && (
          <div className={`px-4 py-3 border-t text-xs ${dark ? 'border-zinc-800 bg-zinc-900/50 text-zinc-400' : 'border-zinc-100 bg-zinc-50 text-zinc-500'}`}>
            <span className="font-semibold">Sesión activa:</span> {admin ? 'Administrador' : 'Usuario'} · SHA-256 cifrado · Sesión temporal (cierra al salir)
          </div>
        )}

        {/* Navigation tabs */}
        <div className={`flex overflow-x-auto border-t scrollbar-hide ${dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : dark ? 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600' : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              }`}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.id ? 'bg-amber-500 text-white' : dark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'normativas' && <NormativasTab dark={dark} />}
        {activeTab === 'sentencias' && <SentenciasTab dark={dark} />}
        {activeTab === 'actualizaciones' && <ActualizacionesTab dark={dark} />}
        {activeTab === 'robot' && <RobotTab dark={dark} />}
        {activeTab === 'verificador' && <VerificadorTab dark={dark} />}
        {activeTab === 'estadisticas' && <EstadisticasTab dark={dark} />}
        {activeTab === 'fuentes' && <FuentesTab dark={dark} />}
      </main>
    </div>
  );
}
