'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/suggestify_logo.png" alt="Suggestify" className="w-10 h-10 object-contain rounded-xl" />
        <span>Suggestify</span>
      </div>
      <nav className="sidebar-nav" style={{ flexGrow: 1 }}>
        <Link href="/">All</Link>
        <Link href="/movies">Movies</Link>
        <Link href="/books">Books</Link>
        <Link href="/songs">Songs</Link>
        <Link href="/courses">Courses</Link>
        <Link href="/products">Products</Link>
        <div className="border-t border-white/5 my-4"></div>
        <Link href="/profile">Profile</Link>
        <Link href="/settings">Settings</Link>
      </nav>
      
      <div className="mt-auto pt-8 border-t border-white/5">
        {user ? (
          <button 
            onClick={logout}
            className="w-full text-left text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Sign Out
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center font-medium transition-colors">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

