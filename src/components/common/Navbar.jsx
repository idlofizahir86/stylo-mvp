import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  
  const isDashboard = location.pathname === '/';

  return (
    <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="px-4 py-3">
        {/* <div className="flex items-center justify-between"> */}
          {/* Logo */}
          {/* <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Stylo</span>
          </Link> */}

          {/* Right Side Actions */}
          {/* <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
             */}
            {/* User Avatar */}
            {/* {user && (
              <Link to="/profile" className="ml-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              </Link>
            )}
          </div> */}
        {/* </div> */}

        {/* Page Title */}
        {/* {!isDashboard && (
          <div className="mt-2">
            <h1 className="text-lg font-bold text-gray-900">
              {location.pathname === '/wardrobe' && 'Wardrobe'}
              {location.pathname === '/try-on' && 'Virtual Try-On'}
              {location.pathname === '/mix-match' && 'Mix & Match'}
              {location.pathname === '/community' && 'Community'}
              {location.pathname === '/profile' && 'Profile'}
            </h1>
          </div>
        )} */}
      </div>
    </div>
  );
}