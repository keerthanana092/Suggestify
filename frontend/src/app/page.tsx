'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Loader2, PlayCircle, BookOpen, Music, ShoppingBag, LayoutGrid, Heart } from 'lucide-react';

interface DiscoveryResult {
  introductoryMessage: string;
  mainMatch: {
    title: string;
    type: string;
    vibeWords: string[];
    description: string;
    whyItMatches: string;
  };
  similarItems: {
    title: string;
    type: string;
    description: string;
    isUnderrrated: boolean;
  }[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch vibe matches');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('movie') || t.includes('tv') || t.includes('anime')) return <PlayCircle size={18} />;
    if (t.includes('book') || t.includes('course')) return <BookOpen size={18} />;
    if (t.includes('song') || t.includes('album') || t.includes('music')) return <Music size={18} />;
    if (t.includes('product') || t.includes('gear')) return <ShoppingBag size={18} />;
    return <LayoutGrid size={18} />;
  };

  return (
    <main>
      <div className="bg-gradient-sphere"></div>
      
      <div className="container" style={{ paddingTop: result ? '4rem' : '20vh', transition: 'padding 0.8s ease' }}>
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ textAlign: 'center' }}
        >
          <h1>Suggestify</h1>
          <p className="subtitle">Tell me what you're feeling. I'll find exactly what you need.</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSearch} className="search-container">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., A gritty cyberpunk movie, a hyper-focus playlist, an underrated sci-fi book..."
              className="search-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Search size={24} />}
            </button>
          </form>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="loader-container"
          >
            <div className="pulse-ring">
              <div className="pulse-inner">
                <Sparkles size={24} color="#a5b4fc" />
              </div>
            </div>
            <p className="loader-text">Feeling the vibe...</p>
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, staggerChildren: 0.1 }}
            >
              <motion.p 
                className="intro-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                "{result.introductoryMessage}"
              </motion.p>

              {/* Main Match */}
              <motion.div 
                className="glass-card main-match"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between items-start">
                  <div className="badge">
                    {getIconForType(result.mainMatch.type)}
                    <span style={{ marginLeft: '6px' }}>Perfect Match: {result.mainMatch.type}</span>
                  </div>
                  <button 
                    onClick={async () => {
                      await fetch('http://localhost:5000/api/user/favorites', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: result.mainMatch.title, type: result.mainMatch.type }),
                        credentials: 'include'
                      });
                      alert('Saved to favorites!');
                    }}
                    className="p-2 bg-white/10 rounded-full hover:bg-pink-500/20 hover:text-pink-500 transition-all"
                  >
                    <Heart size={20} />
                  </button>
                </div>
                <h2>{result.mainMatch.title}</h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  {result.mainMatch.vibeWords.map((word, i) => (
                    <span key={i} className="vibe-tag">{word}</span>
                  ))}
                </div>
                
                <p className="description">{result.mainMatch.description}</p>
                
                <div className="why-match">
                  <h4>Why it matches your vibe</h4>
                  <p style={{ color: '#e4e4e7' }}>{result.mainMatch.whyItMatches}</p>
                </div>
              </motion.div>

              {/* Similar Items */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="grid-header">
                  <ArrowRight color="#ec4899" />
                  Continue the vibe with these 8 picks
                </h3>
                
                <div className="items-grid">
                  {result.similarItems.map((item, index) => (
                    <motion.div 
                      key={index}
                      className="similar-item-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (index * 0.1) }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="item-type">{item.type}</span>
                        {item.isUnderrrated && (
                          <span style={{ fontSize: '0.7rem', color: '#ec4899', border: '1px solid #ec4899', padding: '2px 6px', borderRadius: '4px' }}>Underrated</span>
                        )}
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
