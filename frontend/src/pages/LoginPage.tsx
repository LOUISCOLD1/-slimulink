import { useState } from 'react';
import { login, register, fetchMe } from '../services/api';
import { useTranslationStore } from '../stores/translationStore';

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useTranslationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = isRegister
        ? await register(username, password)
        : await login(username, password);

      localStorage.setItem('token', result.access_token);
      const user = await fetchMe();
      setAuth(result.access_token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="text-indigo-500">AI</span> Voice Translator
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Understand what you truly mean
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none"
            placeholder="Enter username"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none"
            placeholder="Enter password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-gray-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="font-medium text-indigo-500 hover:text-indigo-600"
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </form>
    </div>
  );
}
