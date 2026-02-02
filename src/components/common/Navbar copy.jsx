import { Link, useLocation } from 'react-router-dom';
import { Shirt, Grid3x3, Camera, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/wardrobe', label: 'Wardrobe', icon: Shirt },
    { path: '/mix-match', label: 'Mix & Match', icon: Grid3x3 },
    { path: '/try-on', label: 'Try On', icon: Camera },
  ];
  
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Shirt className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Stylo</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}