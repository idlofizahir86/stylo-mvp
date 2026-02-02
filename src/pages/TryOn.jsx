import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  RefreshCw, 
  Download,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Maximize2,
  Minimize2,
  Heart,
  Share2,
  X,
  ScanLine,
  Zap,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Settings,
  Eye,
  EyeOff,
  Play
} from 'lucide-react';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { useFirestore } from '../hooks/useFirestore';
import LoadingScreen from '../components/tryon/LoadingScreen';
import toast from 'react-hot-toast';

export default function TryOn() {
  // === STATE DECLARATIONS ===
  const [mode, setMode] = useState('camera');
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const [showDebug, setShowDebug] = useState(false);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState('stopped');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeTab, setActiveTab] = useState('outfits');
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showKeypoints, setShowKeypoints] = useState(true);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  
  const [debugInfo, setDebugInfo] = useState({
    poseCount: 0,
    lastPoseTime: null,
    fps: 0
  });
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const poseCanvasRef = useRef(null);
  
  // Custom Hooks
  const { 
    pose, 
    startPoseDetection, 
    stopPoseDetection, 
    isInitialized, 
    error: poseError,
    isLoading: isLoadingPose,
    loadingStep,
    loadingProgress,
    calibrateBody,
    retryInitialization 
  } = useMediaPipe();
  
  const { items: wardrobeItems, loading: wardrobeLoading } = useFirestore();

  // Memoized outfits
  const availableOutfits = useRef([]);
  useEffect(() => {
    if (wardrobeItems.length > 0) {
      availableOutfits.current = [
        {
          id: 'top-bottom',
          name: 'Casual Style',
          description: 'Clean outfit with jacket',
          items: wardrobeItems.filter(item => item.type === 'top' || item.type === 'bottom').slice(0, 2),
          emoji: '👕👖',
          color: 'from-blue-500 to-cyan-400',
          category: 'Casual'
        },
        {
          id: 'dress',
          name: 'Summer Dress',
          items: wardrobeItems.filter(item => item.type === 'dress').slice(0, 1),
          emoji: '👗',
          color: 'from-pink-500 to-rose-400',
          category: 'Formal'
        },
        {
          id: 'top-only',
          name: 'Graphic Tee',
          items: wardrobeItems.filter(item => item.type === 'top').slice(0, 1),
          emoji: '👕',
          color: 'from-purple-500 to-pink-400',
          category: 'Casual'
        },
        {
          id: 'bottom-only',
          name: 'Cargo Pants',
          items: wardrobeItems.filter(item => item.type === 'bottom').slice(0, 1),
          emoji: '👖',
          color: 'from-green-500 to-emerald-400',
          category: 'Casual'
        },
        {
          id: 'jacket',
          name: 'Denim Jacket',
          items: wardrobeItems.filter(item => item.type === 'outerwear').slice(0, 1),
          emoji: '🧥',
          color: 'from-indigo-500 to-blue-400',
          category: 'Outerwear'
        },
        {
          id: 'shoes',
          name: 'White Sneakers',
          items: wardrobeItems.filter(item => item.type === 'shoes').slice(0, 1),
          emoji: '👟',
          color: 'from-gray-500 to-gray-400',
          category: 'Footwear'
        }
      ].filter(outfit => outfit.items.length > 0);
    }
  }, [wardrobeItems]);

  // Initialize camera - SIMPLIFIED VERSION
  const initializeCamera = async () => {
  try {

      if (!videoRef.current) {
        console.log('⏳ Waiting for video element...');
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (videoRef.current) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      }
      
    console.log('1️⃣ START initializeCamera');
    setIsCameraReady('starting');
    console.log('2️⃣ State set to "starting"');
    
    // Stop existing stream if any
    if (cameraStream) {
      console.log('3️⃣ Stopping previous camera stream');
      cameraStream.getTracks().forEach(track => {
        console.log(`   Stopping ${track.kind} track`);
        track.stop();
      });
    }
    
    console.log('4️⃣ Requesting camera permission...');
    const constraints = {
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    };

    console.log('5️⃣ Calling getUserMedia...');
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('✅ 6️⃣ getUserMedia SUCCESS - Stream obtained');
    
    setCameraStream(stream);
    console.log('7️⃣ cameraStream state updated');
    
    if (!videoRef.current) {
      console.error('❌ videoRef is null!');
      setIsCameraReady('error');
      return;
    }
    
    console.log('8️⃣ Setting srcObject to video element');
    videoRef.current.srcObject = stream;
    
    // Setup canvas
    if (poseCanvasRef.current) {
      poseCanvasRef.current.width = 640;
      poseCanvasRef.current.height = 480;
      console.log('9️⃣ Canvas dimensions set');
    }
    
    console.log('🔟 Waiting for video to be ready...');
    
    // Versi SANGAT SEDERHANA untuk testing
    return new Promise((resolve) => {
      const checkVideo = () => {
        console.log(`   Video readyState: ${videoRef.current.readyState}`);
        console.log(`   Video width: ${videoRef.current.videoWidth}`);
        console.log(`   Video height: ${videoRef.current.videoHeight}`);
        
        if (videoRef.current.videoWidth > 0) {
          const width = videoRef.current.videoWidth;
          const height = videoRef.current.videoHeight;
          console.log(`   📏 Video dimensions: ${width}x${height}`);
          
          setVideoDimensions({ width, height });
          
          if (poseCanvasRef.current) {
            poseCanvasRef.current.width = width;
            poseCanvasRef.current.height = height;
          }
          
          setIsCameraReady('ready');
          console.log('🎉 Camera READY!');
          
          // Try to play
          videoRef.current.play()
            .then(() => console.log('▶️ Video playback started'))
            .catch(err => console.warn('⚠️ Autoplay blocked:', err.name));
          
          resolve();
          return true;
        }
        return false;
      };
      
      // Cek langsung
      if (checkVideo()) {
        return;
      }
      
      // Coba lagi setelah delay
      setTimeout(() => {
        if (!checkVideo()) {
          console.warn('⚠️ Video not ready yet, but proceeding anyway');
          setIsCameraReady('ready');
          resolve();
        }
      }, 500);
      
      // Fallback timeout
      setTimeout(() => {
        console.log('⏰ Fallback timeout - marking as ready');
        setIsCameraReady('ready');
        resolve();
      }, 3000);
    });
    
  } catch (error) {
    console.error('❌ ERROR in initializeCamera:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    setIsCameraReady('error');
    
    if (error.name === 'NotAllowedError') {
      toast.error('Camera permission denied. Please allow access.');
    } else if (error.name === 'NotFoundError') {
      toast.error('No camera found on this device.');
    } else if (error.name === 'NotReadableError') {
      toast.error('Camera is busy or not readable.');
    } else {
      toast.error(`Camera error: ${error.message}`);
    }
  }
};

  // Start camera on mount
  useEffect(() => {
    console.log('🏁 Component mounted');
    
    // Start camera with a small delay
    const timer = setTimeout(() => {
      initializeCamera();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
      stopPoseDetection();
    };
  }, []);

  // Draw pose on canvas
  useEffect(() => {
    if (pose && poseCanvasRef.current && videoRef.current && showSkeleton) {
      drawPoseOnCanvas();
    }
  }, [pose, showSkeleton, showKeypoints]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady('stopped');
  };

  const drawPoseOnCanvas = () => {
    const canvas = poseCanvasRef.current;
    if (!canvas || !pose || !pose.keypoints) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mirror canvas to match video
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    
    const keypoints = Object.values(pose.keypoints);
    
    // Draw skeleton
    if (showSkeleton) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      const connections = [
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_shoulder', 'left_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'],
        ['right_elbow', 'right_wrist'],
        ['left_hip', 'left_knee'],
        ['left_knee', 'left_ankle'],
        ['right_hip', 'right_knee'],
        ['right_knee', 'right_ankle']
      ];
      
      connections.forEach(([startKey, endKey]) => {
        const startPoint = pose.keypoints[startKey];
        const endPoint = pose.keypoints[endKey];
        
        if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
          ctx.stroke();
        }
      });
    }
    
    // Draw keypoints
    if (showKeypoints) {
      keypoints.forEach(point => {
        if (point.score > 0.3) {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
    
    ctx.restore();
  };


  const handleStartAR = async () => {
    if (!selectedOutfit || selectedOutfit.items.length === 0) {
      toast.error('Please select an outfit first!');
      return;
    }

    if (!isInitialized) {
      toast.loading('Initializing AI...');
      return;
    }

    // Ensure video is playing
    if (videoRef.current && videoRef.current.paused) {
      await videoRef.current.play();
    }

    setIsDetecting(true);
    setCalibrationComplete(false);
    
    try {
      await startPoseDetection(videoRef.current);
      toast.success('Body tracking started!');
    } catch (error) {
      console.error('Failed to start pose detection:', error);
      toast.error('Tracking failed');
      setIsDetecting(false);
    }
  };

  const handleStopAR = () => {
    setIsDetecting(false);
    stopPoseDetection();
    setCalibrationComplete(false);
    toast('Tracking stopped');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
      setShowControls(false);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
      setShowControls(true);
    }
  };

  const handleSaveSnapshot = () => {
    try {
      const snapshotCanvas = document.createElement('canvas');
      const ctx = snapshotCanvas.getContext('2d');
      
      snapshotCanvas.width = videoDimensions.width;
      snapshotCanvas.height = videoDimensions.height;
      
      if (videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
      }
      
      if (poseCanvasRef.current && isDetecting) {
        ctx.drawImage(poseCanvasRef.current, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
      }
      
      // Add watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(20, snapshotCanvas.height - 80, 300, 70);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Styled with Stylo', 30, snapshotCanvas.height - 50);
      ctx.font = '14px Arial';
      ctx.fillText(new Date().toLocaleDateString(), 30, snapshotCanvas.height - 25);
      
      if (selectedOutfit) {
        ctx.font = 'bold 18px Arial';
        ctx.fillText(selectedOutfit.name, 30, snapshotCanvas.height - 75);
      }
      
      const link = document.createElement('a');
      link.download = `stylo-ar-${Date.now()}.png`;
      link.href = snapshotCanvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Snapshot saved!');
    } catch (error) {
      console.error('Error saving snapshot:', error);
      toast.error('Failed to save snapshot');
    }
  };

  const handleReset = () => {
    console.log('🔄 Resetting camera...');
    handleStopAR();
    stopCamera();
    calibrateBody();
    
    setTimeout(() => {
      initializeCamera();
    }, 500);
    
    toast('Camera reset');
  };

  const handleNextOutfit = () => {
    if (availableOutfits.current.length === 0) return;
    const nextIndex = (currentOutfitIndex + 1) % availableOutfits.current.length;
    setCurrentOutfitIndex(nextIndex);
    setSelectedOutfit(availableOutfits.current[nextIndex]);
  };

  const handlePrevOutfit = () => {
    if (availableOutfits.current.length === 0) return;
    const prevIndex = (currentOutfitIndex - 1 + availableOutfits.current.length) % availableOutfits.current.length;
    setCurrentOutfitIndex(prevIndex);
    setSelectedOutfit(availableOutfits.current[prevIndex]);
  };

  // Show loading screen while AI model is loading
  if (isLoadingPose) {
    return (
      <LoadingScreen 
        step={loadingStep}
        progress={loadingProgress}
        error={poseError}
        onRetry={retryInitialization}
      />
    );
  }

  if (poseError && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Model Failed to Load
          </h2>
          <p className="text-gray-600 mb-6">{poseError}</p>
          <div className="space-y-3">
            <button
              onClick={retryInitialization}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Retry Loading AI Model
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-blue-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <X className="h-6 w-6 text-white" />
        <button className="px-4 py-2 rounded-full bg-gray-700 text-white">AR Try On Mode</button>
        <button className="px-4 py-2 rounded-full bg-purple-500 text-white">AI Try On Mode</button>
      </div>

      {/* AR Preview Section */}
      <div className="relative mx-4 border-2 border-white/30 rounded-3xl overflow-hidden" style={{ height: '60vh' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ 
            transform: 'scaleX(-1)',
            backgroundColor: '#000'
          }}
          onClick={() => {
            if (videoRef.current && videoRef.current.paused) {
              console.log('👆 User clicked video to start playback');
              videoRef.current.play().catch(e => {
                console.log('Play on click failed:', e);
              });
            }
          }}
        />

        {/* Pose Overlay Canvas */}
        <canvas
          ref={poseCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Scan Animation */}
        {isDetecting && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-4 top-1/4 h-2/3 border-2 border-green-400/30 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* Camera Loading/Error Overlay */}
        {isCameraReady !== 'ready' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
            <div className="text-center space-y-4 p-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                isCameraReady === 'starting' ? 'animate-pulse bg-blue-500/20' :
                isCameraReady === 'error' ? 'bg-red-500/20' : 'bg-gray-500/20'
              }`}>
                {isCameraReady === 'starting' && (
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {isCameraReady === 'error' && (
                  <AlertCircle className="h-10 w-10 text-red-400" />
                )}
                {isCameraReady === 'stopped' && (
                  <Camera className="h-10 w-10 text-gray-400" />
                )}
              </div>

              <h3 className="text-xl font-bold text-white">
                {isCameraReady === 'starting' && 'Starting Camera...'}
                {isCameraReady === 'error' && 'Camera Error'}
                {isCameraReady === 'stopped' && 'Camera Not Ready'}
              </h3>
              
              <p className="text-gray-300">
                {isCameraReady === 'starting' && 'Please wait...'}
                {isCameraReady === 'error' && 'Unable to access camera'}
                {isCameraReady === 'stopped' && 'Camera needs to be started'}
              </p>
              
              {(isCameraReady === 'error' || isCameraReady === 'stopped') && (
                <button
                  onClick={initializeCamera}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  Start Camera
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Controls Bar */}
        {showControls && isCameraReady === 'ready' && (
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm ${
                  isDetecting 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                    {isDetecting ? 'Tracking Active' : 'Ready'}
                  </div>
                </div>
                
                {pose && (
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-white text-sm">
                      <span className="font-bold">{pose.keypointsCount}</span> points
                    </div>
                    <div className="text-white text-sm">
                      <span className="font-bold">{Math.round(pose.score * 100)}%</span> confidence
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-colors"
                >
                  {showSkeleton ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-colors"
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Selection Overlay */}
        {!selectedOutfit && isCameraReady === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-white/10">
              <Sparkles size={32} className="text-white/60" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Select an Outfit</h3>
            <p className="text-white/60 text-center px-8">
              Choose an outfit below to start AR try-on
            </p>
          </div>
        )}
      </div>

      {/* Outfit Selection Section */}
      <div className="px-4 py-4">
        {wardrobeLoading ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-white/70">Loading outfits...</p>
          </div>
        ) : availableOutfits.current.length > 0 ? (
          <div className="text-center mt-4">
            <h4 className="font-bold text-lg text-white">{availableOutfits.current[currentOutfitIndex].name}</h4>
            <p className="text-white/70 text-sm">{availableOutfits.current[currentOutfitIndex].description || availableOutfits.current[currentOutfitIndex].category}</p>
            <div className="flex justify-center gap-4 mt-4">
              {availableOutfits.current[currentOutfitIndex].items.map((item, index) => (
                <div key={index} className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="text-2xl">
                      {item.type === 'top' && '👕'}
                      {item.type === 'bottom' && '👖'}
                      {item.type === 'dress' && '👗'}
                      {item.type === 'shoes' && '👟'}
                      {item.type === 'outerwear' && '🧥'}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={handlePrevOutfit}
                disabled={availableOutfits.current.length === 0}
                className="p-2 bg-indigo-800 rounded-lg disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextOutfit}
                disabled={availableOutfits.current.length === 0}
                className="p-2 bg-indigo-800 rounded-lg disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center mt-4">
            <div className="w-16 h-16 mx-auto bg-indigo-800 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-white/70" />
            </div>
            <p className="text-white/70 mb-2">No outfits available</p>
            <a 
              href="/wardrobe" 
              className="text-purple-400 hover:text-purple-300 font-medium text-sm"
            >
              Add items to wardrobe →
            </a>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 mt-8 px-4">
          <button
            onClick={() => {
              if (availableOutfits.current.length > 0) {
                setSelectedOutfit(availableOutfits.current[currentOutfitIndex]);
                handleStartAR();
              }
            }}
            disabled={availableOutfits.current.length === 0}
            className="flex-1 py-3 bg-white text-black rounded-full font-semibold disabled:opacity-50"
          >
            AI Generate
          </button>
          <button
            onClick={handleSaveSnapshot}
            className="flex-1 py-3 bg-purple-500 text-white rounded-full font-semibold"
          >
            Manual Photo
          </button>
        </div>
      </div>

      <div className="fixed bottom-28 right-4 z-30 space-y-3">
        <button
          onClick={() => toast('Coming soon!')}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Grid3x3 size={20} />
        </button>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Settings size={20} />
        </button>
      </div>

      {showDebug && (
        <div className="fixed bottom-32 left-4 right-4 z-50">
          <div className="bg-gray-900/90 backdrop-blur-sm text-white rounded-2xl p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <ScanLine size={18} />
                <span className="font-bold">Debug Panel</span>
              </div>
              <button
                onClick={() => setShowDebug(false)}
                className="p-1 hover:bg-gray-800 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${showSkeleton ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  Skeleton: {showSkeleton ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setShowKeypoints(!showKeypoints)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${showKeypoints ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  Keypoints: {showKeypoints ? 'ON' : 'OFF'}
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="text-gray-400">Camera</div>
                  <div className="font-mono">{videoDimensions.width}x{videoDimensions.height}</div>
                  <div className="text-gray-400 text-xs">State: {isCameraReady}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="text-gray-400">Pose</div>
                  <div className="font-mono">{pose ? 'Detected' : 'None'}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <div className="text-gray-400">FPS</div>
                  <div className="font-mono">{debugInfo.fps || 0}</div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  console.log('=== DEBUG ===');
                  console.log('Camera state:', isCameraReady);
                  console.log('Needs interaction:', needsUserInteraction);
                  console.log('Video element:', videoRef.current);
                  console.log('Video paused:', videoRef.current?.paused);
                  console.log('Video readyState:', videoRef.current?.readyState);
                  console.log('Stream:', cameraStream);
                }}
                className="w-full py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Log Debug Info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}