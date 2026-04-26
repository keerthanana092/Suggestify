'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Clock, Heart, LogOut, Edit2, Save, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, login } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('http://localhost:5000/api/user/history', { credentials: 'include' })
        .then(res => res.json())
        .then(setHistory);
      fetch('http://localhost:5000/api/user/favorites', { credentials: 'include' })
        .then(res => res.json())
        .then(setFavorites);
    }
  }, [user]);

  const handleUpdateName = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include'
      });
      const updatedUser = await res.json();
      login(updatedUser);
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/user/favorites/${id}`, { method: 'DELETE', credentials: 'include' });
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-400">Please log in to view your profile.</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Identity Section */}
      <div className="flex items-center gap-6 pb-10 border-b border-white/10">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <User size={36} className="text-white" />
        </div>
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="bg-black border border-white/10 rounded-lg px-3 py-1 text-white text-xl font-bold outline-none focus:border-indigo-500"
              />
              <button onClick={handleUpdateName} disabled={isLoading} className="p-2 text-indigo-400 hover:text-indigo-300">
                <Save size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{user.name || 'Anonymous'}</h1>
              <button onClick={() => setIsEditingName(true)} className="text-gray-500 hover:text-white">
                <Edit2 size={16} />
              </button>
            </div>
          )}
          <p className="text-gray-400 mt-1">{user.email}</p>
        </div>
        <button 
          onClick={logout} 
          className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/5 rounded-lg border border-red-500/20 transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {/* Favorites */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Heart size={20} className="text-pink-500" />
              Favorites
            </h2>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">{favorites.length} saved</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {favorites.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-gray-600 text-sm">No favorites yet.</p>
              </div>
            ) : (
              favorites.map(fav => (
                <div key={fav.id} className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-200">{fav.title}</h4>
                    <p className="text-[10px] text-gray-600 uppercase font-bold mt-0.5 tracking-wider">{fav.type}</p>
                  </div>
                  <button onClick={() => removeFavorite(fav.id)} className="text-gray-700 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* History */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock size={20} className="text-indigo-400" />
              Recent History
            </h2>
          </div>
          
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-gray-600 text-sm">Your search history is empty.</p>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-indigo-400 font-medium mb-0.5">"{item.query}"</p>
                    <h4 className="font-medium text-gray-300 truncate">{item.mainMatchTitle}</h4>
                  </div>
                  <span className="text-[10px] text-gray-600 font-bold uppercase whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );


}
