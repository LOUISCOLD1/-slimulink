import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { TranslatePage } from './pages/TranslatePage';
import { ConversationPage } from './pages/ConversationPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { useTranslationStore } from './stores/translationStore';
import { fetchMe } from './services/api';

function NavIcon({ path, label, children }: { path: string; label: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
          isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
        }`
      }
    >
      {children}
      <span>{label}</span>
    </NavLink>
  );
}

function AuthenticatedApp() {
  const { user, logout } = useTranslationStore();

  return (
    <div className="mx-auto flex h-[100dvh] max-w-lg flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <h1 className="text-lg font-bold text-gray-800">
          <span className="text-indigo-500">AI</span> Voice Translator
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{user?.display_name || user?.username}</span>
          <button
            onClick={logout}
            className="rounded-lg px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<TranslatePage />} />
          <Route path="/conversation" element={<ConversationPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Bottom navigation */}
      <nav className="flex border-t border-gray-200 bg-white safe-bottom">
        <NavIcon path="/" label="Translate">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </NavIcon>
        <NavIcon path="/conversation" label="Dialogue">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
        </NavIcon>
        <NavIcon path="/history" label="History">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </NavIcon>
        <NavIcon path="/settings" label="Settings">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </NavIcon>
      </nav>
    </div>
  );
}

export default function App() {
  const { token, setAuth, logout } = useTranslationStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe()
        .then((user) => setAuth(token, user))
        .catch(() => logout())
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-gray-50">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <HashRouter>
      {token ? <AuthenticatedApp /> : <LoginPage />}
    </HashRouter>
  );
}
