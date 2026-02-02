import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AIChatProvider } from './contexts/AIChatContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages yang sudah dibuat
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import Profile from './pages/Profile';
import TryOn from './pages/TryOn';

// Icons
import HomeIcon from './assets/icons/nav/home.svg?react';
import CalendarIcon from './assets/icons/nav/calendar.svg?react';
import WardrobeIcon from './assets/icons/nav/wardrobe.svg?react';
import CommunityIcon from './assets/icons/nav/community.svg?react';
import ProfileIcon from './assets/icons/nav/profile.svg?react';

// Icons
import { Sparkles, Shirt, Camera, Grid3x3, Users, User } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('hasCompletedOnboarding');
    if (onboardingCompleted === 'true') {
      setHasCompletedOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompletedOnboarding(true);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans antialiased">
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/onboarding" element={
              !hasCompletedOnboarding ? 
                <Onboarding onComplete={handleOnboardingComplete} /> : 
                <Navigate to="/auth" />
            } />
            
            <Route path="/auth" element={
              !hasCompletedOnboarding ? 
                <Navigate to="/onboarding" /> : 
                <Auth />
            } />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                <AIChatProvider> {/* ⬅️ Bungkus dengan Provider */}
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </AIChatProvider>
              } />
              
              {/* Route untuk halaman wardrobe */}
              <Route path="/wardrobe" element={
                <MainLayout>
                  <Wardrobe />
                </MainLayout>
              } />
              
              <Route path="/try-on" element={
                <MainLayout>
                  <TryOn />
                </MainLayout>
              } />
              
              <Route path="/profile" element={
                <MainLayout>
                  <Profile />
                </MainLayout>
              } />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const MainLayout = ({ children }) => {
  const [showAIChat, setShowAIChat] = useState(false);

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/mix-match', icon: CalendarIcon, label: 'Mix & Match' },
    { path: '/wardrobe', icon: WardrobeIcon, label: 'Wardrobe' },
    // { path: '/try-on', icon: Camera, label: 'Try On' },
    { path: '/community', icon: CommunityIcon, label: 'Community' },
    { path: '/profile', icon: ProfileIcon, label: 'Profile' },
  ];

  return (
    <div className="pb-30">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl">
        <Navbar />
        <main className="px-4 pt-10 pb-4">
          {children}
        </main>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50">
          <div className="bg-white border-t border-gray-100 shadow-lg">
            <div className="flex items-center justify-around px-2 py-3">
              {navItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Floating AI Button */}
        <button
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-xl shadow-purple-500/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
        >
          <Sparkles size={24} />
        </button>
        
        {/* AI Chat Modal */}
        {showAIChat && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center">
            <div className="bg-white w-full max-w-md h-[80vh] rounded-t-3xl md:rounded-3xl animate-slide-up">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">AI Stylist</h3>
                  <button onClick={() => setShowAIChat(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    ✕
                  </button>
                </div>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles size={32} className="text-blue-500" />
                  </div>
                  <p className="text-gray-600">AI Stylist coming soon!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavButton = ({ item }) => {
  // Gunakan window.location.pathname untuk sekarang
  const isActive = window.location.pathname === item.path;
  
  return (
    <a
      href={item.path}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
        isActive ? 'text-blue-600 bg-[#2762EB1A]' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <item.icon size={32} strokeWidth={isActive ? 2.5 : 2} />
      {/* <span className="text-xs font-medium">{item.label}</span> */}
    </a>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
        <Shirt size={32} className="text-white" />
      </div>
      <p className="text-gray-600 font-medium">Loading your style...</p>
    </div>
  </div>
);

export default App;