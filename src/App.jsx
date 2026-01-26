import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/common/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Wardrobe = lazy(() => import('./pages/Wardrobe'));
const MixMatch = lazy(() => import('./pages/MixMatch'));
const TryOn = lazy(() => import('./pages/TryOn'));

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Suspense fallback={
              <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner text="Loading..." />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wardrobe" element={<Wardrobe />} />
                <Route path="/mix-match" element={<MixMatch />} />
                <Route path="/try-on" element={<TryOn />} />
              </Routes>
            </Suspense>
          </main>
          
          {/* Global AR Status */}
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">AR Ready</span>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;