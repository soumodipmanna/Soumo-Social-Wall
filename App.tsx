
import React, { useState, useEffect, useCallback } from 'react';
import { User, Post } from './types';
import { api } from './services/api';
import Header from './components/Header';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';
import PostDetailModal from './components/PostDetailModal';
import FlowDiagram from './components/FlowDiagram';
import { LogIn, UserCircle, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('social_wall_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showFlow, setShowFlow] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPosts(searchQuery);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername.trim()) {
      const user = {
        username: loginUsername.trim().toLowerCase(),
        isAuthenticated: true,
      };
      setCurrentUser(user);
      localStorage.setItem('social_wall_user', JSON.stringify(user));
      setShowLogin(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('social_wall_user');
  };

  const handlePostCreated = () => {
    loadPosts();
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    try {
      await api.likePost(postId, currentUser.username);
      loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowLogin(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onShowFlow={() => setShowFlow(!showFlow)}
      />

      <main className="max-w-2xl mx-auto px-4 pt-20">
        {showFlow ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-blue-500" />
                System Architecture
              </h2>
              <button 
                onClick={() => setShowFlow(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Back to Feed
              </button>
            </div>
            <FlowDiagram />
          </div>
        ) : (
          <>
            {currentUser ? (
              <CreatePost 
                currentUser={currentUser} 
                onPostCreated={handlePostCreated} 
              />
            ) : (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8 flex flex-col items-center text-center">
                <UserCircle className="w-12 h-12 text-blue-400 mb-3" />
                <h3 className="text-blue-900 font-semibold text-lg">Join the Conversation</h3>
                <p className="text-blue-700 mb-4 max-w-xs">Log in to share your updates, like posts and join the community.</p>
                <button 
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Log In
                </button>
              </div>
            )}

            <Feed 
              posts={posts} 
              loading={loading} 
              onLike={handleLike}
              onCommentClick={(id) => setSelectedPostId(id)}
              onDelete={currentUser ? (id) => api.deletePost(id).then(loadPosts) : undefined}
              currentUsername={currentUser?.username}
            />
          </>
        )}
      </main>

      {/* Post Detail Modal */}
      {selectedPostId && (
        <PostDetailModal 
          postId={selectedPostId} 
          onClose={() => setSelectedPostId(null)} 
          currentUser={currentUser}
          onCommentAdded={loadPosts}
        />
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <button onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pick a username</label>
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. creative_mind"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                Continue to Feed
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
