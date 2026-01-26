import { Cpu, Download, Wifi, Zap, AlertCircle } from 'lucide-react';

export default function LoadingScreen({ step, progress, error, onRetry }) {
  const getStepIcon = (currentStep) => {
    if (currentStep.includes('TensorFlow') || currentStep.includes('CDN')) {
      return <Download className="h-6 w-6" />;
    } else if (currentStep.includes('WebGL')) {
      return <Cpu className="h-6 w-6" />;
    } else if (currentStep.includes('model')) {
      return <Zap className="h-6 w-6" />;
    } else {
      return <Wifi className="h-6 w-6" />;
    }
  };

  const getStepColor = (currentStep) => {
    if (currentStep.includes('failed') || currentStep.includes('error')) {
      return 'text-red-500';
    } else if (currentStep.includes('ready') || currentStep.includes('complete')) {
      return 'text-green-500';
    } else {
      return 'text-blue-500';
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">AI Model Failed to Load</h2>
          <p className="text-gray-300 mb-2">{error}</p>
          <p className="text-gray-400 text-sm mb-6">
            This may be due to network issues or browser restrictions.
          </p>
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Retry Loading AI Model
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>If the problem persists, try:</p>
            <ul className="mt-2 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Disable ad blockers for this site</li>
              <li>• Use Chrome or Firefox browser</li>
              <li>• Enable WebGL in browser settings</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-blue-900 z-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Cpu className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-sm">{progress}%</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Initializing Body Tracking AI
          </h2>
          
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 ${getStepColor(step)} bg-opacity-20 bg-current`}>
            {getStepIcon(step)}
            <span className="font-medium">{step}</span>
          </div>
          
          <p className="text-gray-300">
            Loading real-time pose detection for accurate clothing placement
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Loading AI Models</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Details */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 text-yellow-400 mr-2" />
            Loading Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">TensorFlow.js Core</span>
              <span className={`px-2 py-1 rounded text-xs ${
                progress >= 25 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {progress >= 25 ? 'Loaded' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">WebGL Backend</span>
              <span className={`px-2 py-1 rounded text-xs ${
                progress >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {progress >= 50 ? 'Active' : 'Initializing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Pose Detection Model</span>
              <span className={`px-2 py-1 rounded text-xs ${
                progress >= 75 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {progress >= 75 ? 'Downloaded' : 'Downloading...'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Camera Setup</span>
              <span className={`px-2 py-1 rounded text-xs ${
                progress >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {progress >= 90 ? 'Ready' : 'Waiting'}
              </span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="text-center text-sm text-gray-400">
          <p>First load may take 20-60 seconds depending on network speed.</p>
          <p className="mt-1">Models are cached for faster loading next time.</p>
        </div>
      </div>
    </div>
  );
}