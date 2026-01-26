import { Link } from 'react-router-dom';
import { Shirt, Grid3x3, Camera, Upload, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Items in Wardrobe', value: '0', icon: Shirt, color: 'text-blue-500' },
    { label: 'Saved Outfits', value: '0', icon: Grid3x3, color: 'text-green-500' },
    { label: 'Try-On Sessions', value: '0', icon: Camera, color: 'text-purple-500' },
  ];

  const quickActions = [
    {
      title: 'Upload Clothing',
      description: 'Add new items to your digital wardrobe',
      icon: Upload,
      link: '/wardrobe',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Create Outfit',
      description: 'Mix & match items from your wardrobe',
      icon: Grid3x3,
      link: '/mix-match',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Virtual Try-On',
      description: 'Try outfits with AR technology',
      icon: Camera,
      link: '/try-on',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl mb-6">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-primary-600">Stylo</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your personal digital wardrobe and virtual fitting room
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color.replace('text', 'bg')} bg-opacity-20 mr-4`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className="card group hover:shadow-lg transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-lg ${action.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 mb-4">{action.description}</p>
                <div className="text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                  Get started →
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shirt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Digital Wardrobe</h3>
                <p className="text-gray-600 mt-1">
                  Upload your clothing items with automatic background removal. 
                  Organize by type, color, and category.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Grid3x3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Mix & Match</h3>
                <p className="text-gray-600 mt-1">
                  Create unlimited outfit combinations from your digital wardrobe. 
                  Save your favorite looks for later.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Virtual Try-On</h3>
              <p className="text-gray-600 mt-1">
                Experience outfits in augmented reality with body tracking technology. 
                See how clothes fit without physically trying them on.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}