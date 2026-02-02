import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Shield, 
  HelpCircle, 
  Star,
  Palette,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const result = await signOut();
      if (result.success) {
        toast.success('Signed out successfully');
        navigate('/auth');
      } else {
        toast.error(result.error || 'Failed to sign out');
      }
    } catch (error) {
      toast.error('An error occurred during sign out');
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: Settings, label: 'Settings', color: 'text-gray-600' },
    { icon: Bell, label: 'Notifications', color: 'text-blue-600' },
    { icon: Palette, label: 'Appearance', color: 'text-purple-600' },
    { icon: Shield, label: 'Privacy & Security', color: 'text-green-600' },
    { icon: HelpCircle, label: 'Help & Support', color: 'text-amber-600' },
    { icon: Star, label: 'Rate Stylo', color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user?.displayName || 'User'}</h1>
            <p className="text-blue-100">{user?.email || 'user@example.com'}</p>
          </div>
          <button className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors">
            <Camera size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-blue-100">Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-blue-100">Outfits</p>
          </div>
          <div>
            <p className="text-2xl font-bold">92%</p>
            <p className="text-sm text-blue-100">Match</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-left"
          >
            <div className={`w-10 h-10 rounded-xl ${item.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
              <item.icon size={20} className={item.color} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">Manage your {item.label.toLowerCase()}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="w-full flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl hover:bg-red-100 transition-colors text-left disabled:opacity-50"
      >
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <LogOut size={20} className="text-red-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-red-900">Sign Out</p>
          <p className="text-sm text-red-600">Exit your account</p>
        </div>
        {loading && (
          <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
        )}
      </button>

      {/* App Version */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-500">Stylo v1.0.0</p>
      </div>
    </div>
  );
}