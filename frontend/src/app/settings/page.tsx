'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Lock, Trash2, Globe, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Password updated successfully");
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch('http://localhost:5000/api/user', { method: 'DELETE', credentials: 'include' });
      logout();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-400">Please log in to access settings.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="border-b border-white/10 pb-8 mb-10">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your personal information and security settings.</p>
      </div>
      
      <div className="space-y-12">
        {/* Password Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-white">Security</h2>
            <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure.</p>
          </div>
          <div className="md:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-xl p-6 space-y-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {error && <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">{error}</div>}
              {success && <div className="p-3 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg">{success}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Current Password</label>
                <input 
                  type="password" required
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">New Password</label>
                <input 
                  type="password" required
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        {/* Preferences Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-white">Preferences</h2>
            <p className="text-sm text-gray-500 mt-1">Customize how Suggestify looks and feels.</p>
          </div>
          <div className="md:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Language</p>
                <p className="text-xs text-gray-500 mt-0.5">Choose your preferred interface language.</p>
              </div>
              <select className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        {/* Danger Zone */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
            <p className="text-sm text-gray-500 mt-1">Actions that cannot be undone.</p>
          </div>
          <div className="md:col-span-2 border border-red-500/20 bg-red-500/5 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-red-500">Delete Account</p>
                <p className="text-xs text-gray-500 mt-0.5">Permanently remove your account and all associated data.</p>
              </div>
              {showDeleteConfirm ? (
                <div className="flex gap-2">
                  <button onClick={handleDeleteAccount} className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-bold">Confirm</button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-1.5 bg-white/5 text-gray-400 rounded-lg text-sm">Cancel</button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-semibold transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );



}
