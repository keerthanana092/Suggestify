'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(pwd)) return "Password must contain at least one special character.";
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to signup');
      }

      setSuccess("Account created successfully! You can now log in.");
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white">Create Account</h2>
        <p className="text-center text-gray-400">Join Suggestify today</p>
        
        {error && <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">{error}</div>}
        {success && <div className="p-3 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg">{success}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 mt-1 text-white bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 mt-1 text-white bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <ul className="mt-2 space-y-1 text-xs text-gray-500">
              <li className={password.length >= 8 ? 'text-green-500' : ''}>• 8+ characters</li>
              <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>• At least 1 uppercase</li>
              <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>• At least 1 lowercase</li>
              <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>• At least 1 number</li>
              <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}>• At least 1 special character</li>
            </ul>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
