import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import API from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate user
      const response = await API.post('/login-json', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // 2. Fetch profile info to store userName
      const meResponse = await API.get('/me');
      localStorage.setItem('user_name', meResponse.data.name);
      localStorage.setItem('user_email', meResponse.data.email);

      // Redirect to Dashboard
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-3">
            <BookOpen className="h-6 w-6 text-slate-950" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 mt-2 text-sm">Log in to resume your AI personalized learning path</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-slate-300 text-sm font-medium" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
