import React from 'react';
import { Cpu, Download, Wifi, Zap, AlertCircle, Sparkles, Camera, CpuIcon, Cloud, CheckCircle } from 'lucide-react';

export default function LoadingScreen({ step, progress, error, onRetry }) {
  const loadingSteps = [
    {
      id: 1,
      name: 'Loading AI Engine',
      icon: <Cpu className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-400',
      description: 'Initializing TensorFlow.js',
      progressMin: 0,
      progressMax: 25
    },
    {
      id: 2,
      name: 'Downloading Models',
      icon: <Download className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-400',
      description: 'Fetching pose detection model',
      progressMin: 25,
      progressMax: 50
    },
    {
      id: 3,
      name: 'GPU Acceleration',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-amber-500 to-orange-400',
      description: 'Setting up WebGL backend',
      progressMin: 50,
      progressMax: 75
    },
    {
      id: 4,
      name: 'Camera Setup',
      icon: <Camera className="h-5 w-5" />,
      color: 'from-emerald-500 to-teal-400',
      description: 'Preparing camera stream',
      progressMin: 75,
      progressMax: 90
    },
    {
      id: 5,
      name: 'Finalizing',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'from-violet-500 to-purple-400',
      description: 'Starting AR experience',
      progressMin: 90,
      progressMax: 100
    }
  ];

  const getCurrentStep = () => {
    for (let i = loadingSteps.length - 1; i >= 0; i--) {
      if (progress >= loadingSteps[i].progressMin) {
        return loadingSteps[i];
      }
    }
    return loadingSteps[0];
  };

  const currentStep = getCurrentStep();

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 to-blue-900/30 flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-64 h-64 rounded-full opacity-5"
              style={{
                background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `scale(${0.5 + Math.random() * 1.5})`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Error Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-400" />
              </div>
              {/* Pulsing Ring */}
              <div className="absolute inset-0 m-auto w-24 h-24 rounded-2xl border-2 border-red-500/30 animate-ping" />
            </div>

            {/* Error Message */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Setup Failed</h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-200 font-medium">{error}</p>
              </div>
              <p className="text-gray-300 text-sm">
                The AR system failed to initialize properly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={onRetry}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {/* Help Tips */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Troubleshooting Tips</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-300">Check connection</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-gray-300">Disable ad blockers</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-300">Use Chrome/Firefox</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-gray-300">Enable WebGL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 to-blue-900/30 flex flex-col items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-64 h-64 rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `scale(${0.5 + Math.random() * 1.5})`,
              animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 p-1 shadow-2xl shadow-purple-500/30">
              <div className="w-full h-full rounded-2xl bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            
            {/* Progress Ring */}
            <div className="absolute -inset-4">
              <svg className="w-28 h-28" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * progress) / 100}
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Progress Text */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="px-3 py-1 bg-gray-900/80 backdrop-blur-sm rounded-full border border-white/10">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Starting AR Experience
          </h1>
          <p className="text-gray-300">
            Preparing real-time body tracking for virtual try-on
          </p>
        </div>

        {/* Loading Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
          {/* Current Step */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center`}>
                <div className="text-white">{currentStep.icon}</div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{currentStep.name}</h3>
                <p className="text-gray-300 text-sm">{step}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Initializing...</span>
                <span className="text-gray-300">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-3">
            {loadingSteps.map((stepItem) => {
              const isCompleted = progress >= stepItem.progressMax;
              const isActive = progress >= stepItem.progressMin && progress < stepItem.progressMax;
              const stepProgress = Math.max(0, Math.min(100, 
                ((progress - stepItem.progressMin) / (stepItem.progressMax - stepItem.progressMin)) * 100
              ));

              return (
                <div key={stepItem.id} className="flex items-center gap-3">
                  {/* Step Icon */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-400' 
                        : isActive
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                        : 'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <div className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
                          {stepItem.icon}
                        </div>
                      )}
                    </div>
                    
                    {/* Connection Line */}
                    {stepItem.id < loadingSteps.length && (
                      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8">
                        <div className={`w-full h-full transition-all duration-500 ${
                          progress >= stepItem.progressMax 
                            ? 'bg-gradient-to-b from-emerald-400 to-blue-500' 
                            : 'bg-white/10'
                        }`} />
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${
                        isCompleted ? 'text-green-300' :
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}>
                        {stepItem.name}
                      </span>
                      <span className={`text-xs ${
                        isCompleted ? 'text-green-300' :
                        isActive ? 'text-blue-300' : 'text-gray-500'
                      }`}>
                        {isCompleted ? 'Complete' : 
                         isActive ? `${Math.round(stepProgress)}%` : 'Pending'}
                      </span>
                    </div>
                    
                    {/* Step Progress Bar */}
                    {isActive && (
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${stepItem.color} rounded-full transition-all duration-300`}
                          style={{ width: `${stepProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  progress >= 100 ? 'bg-green-500 animate-pulse' :
                  progress >= 75 ? 'bg-blue-500' :
                  progress >= 50 ? 'bg-purple-500' :
                  'bg-amber-500'
                }`} />
                <span className="text-sm text-gray-300">
                  {progress >= 100 ? 'Almost ready...' :
                   progress >= 75 ? 'Finalizing setup...' :
                   progress >= 50 ? 'Downloading models...' :
                   'Initializing AI...'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {progress >= 100 ? '✓ Ready' : 'Loading...'}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Tips */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">
              First load may take a moment
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Models are cached for faster loading next time
          </p>
        </div>
      </div>

      {/* Floating Animation */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2 text-gray-400 text-sm animate-pulse">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-150" />
          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse delay-300" />
          <span>Initializing AR system</span>
        </div>
      </div>
    </div>
  );
}