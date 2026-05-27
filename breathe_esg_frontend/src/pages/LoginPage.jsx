import { useState } from 'react';
import { Wind } from 'lucide-react';
import { login } from '../api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await login(email, password);
      localStorage.setItem('access_token', data.access);
      onLogin();
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-gray-800 p-3 rounded-2xl shadow-[0_0_15px_rgba(52,211,153,0.5)]">
             <img src="/logo.svg" alt="Breathe ESG Logo" className="w-12 h-12" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight" style={{fontFamily: '"Courier New", monospace'}}>
          Breathe ESG
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400" style={{fontFamily: '"Courier New", monospace'}}>
          SYSTEM ACCESS PROTOCOL
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/90 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-700">
          <form className="space-y-6 flex flex-col items-center" onSubmit={handleSubmit}>
            <div className="uiverse-pixel-input-wrapper">
              <label className="uiverse-pixel-label" htmlFor="email">EMAIL</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="uiverse-pixel-input"
                placeholder="Enter email..."
              />
            </div>

            <div className="uiverse-pixel-input-wrapper">
              <label className="uiverse-pixel-label" htmlFor="password">PASSWORD</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="uiverse-pixel-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
            )}

            <div className="w-full max-w-[18em]">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border-2 border-emerald-500 text-sm font-bold text-emerald-400 bg-transparent hover:bg-emerald-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors uppercase tracking-widest"
                style={{fontFamily: '"Courier New", monospace'}}
              >
                {loading ? 'AUTHENTICATING...' : 'LOGIN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
