import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import MagneticButton from '../components/MagneticButton';
import { useAuthStore } from '../store/useAuthStore';
import * as authService from '../services/authService';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
     <div 
  className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
  style={{ 
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('download.jpeg')` 
  }}
>
      <GlassCard className="w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back, Commander
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Enter your credentials to access the command center.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email "
              autoComplete="email"
              className="w-full mt-1 bg-black/20 p-3 rounded-lg border border-transparent focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full mt-1 bg-black/20 p-3 rounded-lg border border-transparent focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-sm animate-shake-subtle">{error}</p>}
          
          <div className="pt-2">
            <MagneticButton type="submit" className="w-full" variant="primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </MagneticButton>
          </div>
        </form>
        
        <div className="text-center mt-6 text-sm">
          <p className="text-gray-400">
            Don't have an account? <Link to="/auth/sign-up" className="font-semibold text-neon-cyan hover:underline">Create one</Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default SignInPage;
