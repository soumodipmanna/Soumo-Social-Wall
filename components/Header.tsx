import React from 'react';
import { LogIn, LogOut, Search, LayoutDashboard } from 'lucide-react';
import { User } from '../types';


type HeaderProps = {
  currentUser: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onShowFlow: () => void;
};

const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onLoginClick,
  searchQuery,
  setSearchQuery,
  onShowFlow,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.webp"  className="h-10 w-auto" />
          <div>
            <p className="text-lg font-semibold text-gray-900">Soumo's Mini Social Wall</p>
            <p className="text-xs text-gray-500">
              {currentUser ? `Signed in as ${currentUser.username}` : 'Guest mode'}
            </p>
          </div>
        </div>

        <div className="flex-1 sm:max-w-xs">
          <label className="relative block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search posts or users"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowFlow}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Flow
          </button>
          {currentUser ? (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
