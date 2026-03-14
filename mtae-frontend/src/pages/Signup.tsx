import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Step = 'register' | 'confirm';

export default function Signup() {
  const { signUp, confirmSignUp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, username);
      setStep('confirm');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      navigate('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-100">
            {step === 'register' ? 'Create an account' : 'Check your email'}
          </h1>
          {step !== 'register' ? (
              <>We sent a 6-digit code to <span className="text-slate-300">{email}</span></>
          ) : null}
        </div>

        {/* Card */}
        <div className="bg-neutral-900/95 border border-neutral-700/70 rounded-2xl shadow-xl shadow-black/50 p-8">

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-sm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-sm">Display name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. subwayrat22, transitfan99, etc..."
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-400 transition-colors"
                />
                <p className="text-slate-600 text-xs">This is how you'll appear to other users</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-sm">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-sm">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors mt-1"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

            </form>
          ) : (
            <form onSubmit={handleConfirm} className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-sm">Confirmation code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-400 transition-colors text-center text-xl tracking-widest font-mono"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-950/50 border border-red-900/50 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {loading ? 'Confirming...' : 'Confirm email'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('register'); setError(null); }}
                className="text-slate-500 hover:text-slate-400 text-sm transition-colors text-center"
              >
                ← Back
              </button>

            </form>
          )}

          {step === 'register' && (
            <p className="text-slate-500 text-sm text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-400 hover:text-sky-300 transition-colors">
                Sign in
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
