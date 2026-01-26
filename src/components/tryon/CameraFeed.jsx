import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export default function CameraFeed({ 
  onVideoReady, 
  onDimensionsChange,
  isDetecting 
}) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          if (onVideoReady) onVideoReady(videoRef.current);
          
          if (onDimensionsChange) {
            onDimensionsChange({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            });
          }
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    startCamera();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 rounded-lg p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Camera Error</h3>
        <p className="text-gray-300 text-center mb-6">{error}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-white">Initializing camera...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-contain ${isDetecting ? 'mirror' : ''}`}
        style={{
          transform: isDetecting ? 'scaleX(-1)' : 'none'
        }}
      />
      
      {/* Camera overlay grid */}
      {isDetecting && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-primary-500 opacity-50 rounded-lg"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary-500 opacity-30"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary-500 opacity-30"></div>
        </div>
      )}
      
      {/* Camera status */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <span>{isDetecting ? 'AR Active' : 'Camera Ready'}</span>
      </div>
    </div>
  );
}