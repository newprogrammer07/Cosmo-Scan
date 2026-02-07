import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import MagneticButton from '../components/MagneticButton';
import * as authService from '../services/authService';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }

    setLoading(true);
    try {
      await authService.signup(name, email, password);
      setSuccess('Account created successfully! Redirecting to sign in...');
      setTimeout(() => navigate('/auth/sign-in'), 2000);
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
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/Dark Space Wallpapers HD.jpeg')` 
  }}
>
      <GlassCard className="w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold text-center mb-2">
          Join Cosmic Watch
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Create an account to begin monitoring the cosmos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm text-gray-300">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name "
              autoComplete="name"
              className="w-full mt-1 bg-black/20 p-3 rounded-lg border border-transparent focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              autoComplete="new-password"
              className="w-full mt-1 bg-black/20 p-3 rounded-lg border border-transparent focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
            />
          </div>
           <div>
            <label htmlFor="confirm-password" className="text-sm text-gray-300">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full mt-1 bg-black/20 p-3 rounded-lg border border-transparent focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-sm animate-shake-subtle">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}
          
          <div className="pt-2">
            <MagneticButton type="submit" className="w-full" variant="primary" disabled={loading || !!success}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </MagneticButton>
          </div>
        </form>
        
        <div className="text-center mt-6 text-sm">
            <p className="text-gray-400">
              Already have an account? <Link to="/auth/sign-in" className="font-semibold text-neon-cyan hover:underline">Sign in</Link>
            </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default SignUpPage;