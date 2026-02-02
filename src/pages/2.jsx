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
  EyeOff
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
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [showDebug, setShowDebug] = useState(false);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState('stopped');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
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
          name: 'Casual Combo',
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

  // Track container dimensions for proper scaling
  useEffect(() => {
    const updateContainerDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    // Initial update
    updateContainerDimensions();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateContainerDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Camera effect
  useEffect(() => {
    console.log('🎬 Page loaded - initializing camera...');
    
    let mounted = true;
    let stream = null;
    
    const initCamera = async () => {
      try {
        if (!mounted) return;
        
        setMode('camera');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
        
        if (videoRef.current?.srcObject) {
          console.log('✅ Camera already active');
          return;
        }
        
        console.log('📡 Requesting camera access...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 24 }
          }
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        setCameraStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          await new Promise((resolve) => {
            if (videoRef.current.readyState >= 2) {
              resolve();
            } else {
              videoRef.current.onloadeddata = resolve;
              setTimeout(resolve, 1000);
            }
          });
          
          if (videoRef.current.videoWidth > 2) {
            const dimensions = {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            };
            setVideoDimensions(dimensions);
            setIsCameraReady('ready');
            console.log(`🎥 Camera ready: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          }
        }
        
      } catch (error) {
        if (mounted) {
          console.error('❌ Camera init failed:', error);
          setIsCameraReady('error');
          toast.error(`Camera error: ${error.message}`);
        }
      }
    };
    
    initCamera();
    
    return () => {
      console.log('🧼 Component cleanup');
      mounted = false;
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject = null;
      }
      
      if (isDetecting) {
        stopPoseDetection();
      }
    };
  }, []);

  // Draw pose on canvas when pose updates
  useEffect(() => {
    if (pose && poseCanvasRef.current && videoRef.current && showSkeleton) {
      drawPoseOnCanvas();
    }
  }, [pose, showSkeleton, showKeypoints, containerDimensions, videoDimensions]);

  // Calculate video display area for object-fit: contain
  const getVideoDisplayRect = () => {
    if (!videoRef.current || !containerRef.current) {
      return { x: 0, y: 0, width: 0, height: 0, scale: 1 };
    }

    const containerWidth = containerDimensions.width;
    const containerHeight = containerDimensions.height;
    const videoWidth = videoDimensions.width;
    const videoHeight = videoDimensions.height;

    // Calculate aspect ratios
    const videoAspect = videoWidth / videoHeight;
    const containerAspect = containerWidth / containerHeight;

    let displayWidth, displayHeight, offsetX, offsetY, scale;

    if (videoAspect > containerAspect) {
      // Video is wider than container - fit to width
      displayWidth = containerWidth;
      displayHeight = containerWidth / videoAspect;
      offsetX = 0;
      offsetY = (containerHeight - displayHeight) / 2;
      scale = containerWidth / videoWidth;
    } else {
      // Video is taller than container - fit to height
      displayHeight = containerHeight;
      displayWidth = containerHeight * videoAspect;
      offsetX = (containerWidth - displayWidth) / 2;
      offsetY = 0;
      scale = containerHeight / videoHeight;
    }

    return {
      x: offsetX,
      y: offsetY,
      width: displayWidth,
      height: displayHeight,
      scale: scale
    };
  };

  const drawPoseOnCanvas = () => {
    const canvas = poseCanvasRef.current;
    if (!canvas || !pose || !pose.keypoints || !videoRef.current) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get video display rectangle
    const displayRect = getVideoDisplayRect();
    const { scale, x: offsetX, y: offsetY } = displayRect;
    
    // Mirror canvas to match video
    ctx.save();
    
    // Apply mirror transformation
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    
    // Apply offset and scaling for object-fit: contain
    ctx.translate(-offsetX, offsetY);
    ctx.scale(scale, scale);
    
    const keypoints = Object.values(pose.keypoints);
    
    // Adjust keypoint radius and line width based on scale
    const adjustedLineWidth = Math.max(2, 3 / scale);
    const adjustedRadius = Math.max(4, 8 / scale);
    const adjustedInnerRadius = Math.max(2, 4 / scale);
    
    // Draw skeleton connections
    if (showSkeleton) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = adjustedLineWidth;
      ctx.lineCap = 'round';
      
      const connections = [
        // Body
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        // Arms
        ['left_shoulder', 'left_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'],
        ['right_elbow', 'right_wrist'],
        // Legs
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
          // Draw outer circle
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(point.x, point.y, adjustedRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw inner circle
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(point.x, point.y, adjustedInnerRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw score text (adjusted size)
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(8, 10 / scale)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.round(point.score * 100)}%`, point.x, point.y + 20 / scale);
        }
      });
    }
    
    ctx.restore();
  };

  const startCamera = useCallback(async () => {
    if (videoRef.current?.srcObject) {
      console.log('📹 Camera already has stream, skipping...');
      return;
    }
    
    try {
      console.log('🚀 Starting camera...');
      
      setIsCameraReady('starting');
      
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 24 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 2) {
            resolve();
          } else {
            videoRef.current.onloadeddata = resolve;
          }
        });
        
        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;
        
        console.log(`📹 Camera ready: ${width}x${height}`);
        setVideoDimensions({ width, height });
        setIsCameraReady('ready');
        
        toast.success('Camera ready!');
      }
      
    } catch (error) {
      console.error('❌ Camera error:', error);
      setIsCameraReady('error');
      toast.error(`Camera failed: ${error.message}`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
      setCameraStream(null);
    }
    
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraReady('stopped');
    console.log('✅ Camera stopped');
  }, [cameraStream]);

  const handleStartAR = async () => {
    if (!selectedOutfit || selectedOutfit.items.length === 0) {
      toast.error('Please select an outfit first!');
      return;
    }

    if (!isInitialized) {
      toast.loading('Initializing AI...');
      return;
    }

    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      toast.error('Camera not ready. Please wait...');
      return;
    }

    setIsDetecting(true);
    setCalibrationComplete(false);
    
    toast.success('Starting body tracking...');

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
        const displayRect = getVideoDisplayRect();
        ctx.save();
        
        // Apply the same transformations as in drawPoseOnCanvas
        ctx.scale(-1, 1);
        ctx.translate(-snapshotCanvas.width, 0);
        ctx.translate(-displayRect.x / displayRect.scale, displayRect.y / displayRect.scale);
        ctx.scale(displayRect.scale, displayRect.scale);
        
        ctx.drawImage(poseCanvasRef.current, 0, 0);
        ctx.restore();
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
    handleStopAR();
    stopCamera();
    calibrateBody();
    
    setTimeout(() => {
      startCamera();
    }, 500);
    
    toast('Reset complete');
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
    <div className="pb-24">
      {/* AR Preview Section - Takes 70% of screen */}
      <div className="relative bg-black" style={{ height: '70vh' }}>
        <div 
          ref={containerRef}
          className="relative w-full h-full overflow-hidden"
          onMouseEnter={() => !isFullscreen && setShowControls(true)}
          onMouseLeave={() => !isFullscreen && setShowControls(false)}
        >
          {/* Video Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full"
            style={{ 
              transform: 'scaleX(-1)',
              backgroundColor: '#000',
              objectFit: 'contain'
            }}
          />

          {/* Pose Overlay Canvas - Sync with video dimensions */}
          <canvas
            ref={poseCanvasRef}
            width={containerDimensions.width}
            height={containerDimensions.height}
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

          {/* Camera Status Overlay */}
          {isCameraReady !== 'ready' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
              <div className="text-center space-y-4 p-6 max-w-sm">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  isCameraReady === 'starting' ? 'animate-pulse bg-blue-500/20' :
                  isCameraReady === 'error' ? 'bg-red-500/20' : 'bg-gray-500/20'
                }`}>
                  {isCameraReady === 'starting' && (
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      <Camera className="absolute inset-0 m-auto h-8 w-8 text-white" />
                    </div>
                  )}
                  {isCameraReady === 'error' && (
                    <AlertCircle className="h-12 w-12 text-red-400" />
                  )}
                  {isCameraReady === 'stopped' && (
                    <Camera className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    {isCameraReady === 'starting' && 'Starting Camera...'}
                    {isCameraReady === 'error' && 'Camera Error'}
                    {isCameraReady === 'stopped' && 'Camera Not Started'}
                  </h3>
                  
                  <p className="text-gray-300">
                    {isCameraReady === 'starting' && 'Please wait while we access your camera...'}
                    {isCameraReady === 'error' && 'Unable to access camera. Please check permissions.'}
                    {isCameraReady === 'stopped' && 'Camera needs to be started'}
                  </p>
                </div>
                
                <div className="space-y-3 pt-4">
                  {(isCameraReady === 'error' || isCameraReady === 'stopped') && (
                    <button
                      onClick={startCamera}
                      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                      Start Camera
                    </button>
                  )}
                </div>
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

          {/* Bottom Controls */}
          {showControls && isCameraReady === 'ready' && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleSaveSnapshot}
                  className="px-6 py-3 bg-white text-black rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Download size={20} />
                  Capture
                </button>
                
                <button
                  onClick={isDetecting ? handleStopAR : handleStartAR}
                  disabled={!selectedOutfit}
                  className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
                    isDetecting
                      ? 'bg-gradient-to-r from-red-500 to-orange-400 text-white hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl disabled:opacity-50'
                  }`}
                >
                  {isDetecting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Stop AR
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      Start AR
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center">
                  <div className="text-white text-xl font-bold">{pose?.keypointsCount || 0}</div>
                  <div className="text-gray-300 text-xs">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-xl font-bold">{pose ? Math.round(pose.score * 100) : 0}%</div>
                  <div className="text-gray-300 text-xs">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-xl font-bold">{debugInfo.fps || 0}</div>
                  <div className="text-gray-300 text-xs">FPS</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-xl font-bold">{isDetecting ? '🟢' : '🔴'}</div>
                  <div className="text-gray-300 text-xs">Status</div>
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
      </div>

      {/* Outfit Selection Section */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Select Outfit</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevOutfit}
              disabled={availableOutfits.current.length === 0}
              className="p-2 bg-gray-100 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextOutfit}
              disabled={availableOutfits.current.length === 0}
              className="p-2 bg-gray-100 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {wardrobeLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-32">
                <div className="w-32 h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
            ))
          ) : availableOutfits.current.length > 0 ? (
            availableOutfits.current.map((outfit, index) => (
              <button
                key={outfit.id}
                onClick={() => {
                  setSelectedOutfit(outfit);
                  setCurrentOutfitIndex(index);
                }}
                className={`flex-shrink-0 w-32 transition-all duration-300 ${
                  selectedOutfit?.id === outfit.id ? 'scale-95' : ''
                }`}
              >
                <div className={`relative w-32 h-40 rounded-2xl overflow-hidden border-2 ${
                  selectedOutfit?.id === outfit.id 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${outfit.color}`} />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    {outfit.emoji}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h4 className="font-bold text-sm truncate">{outfit.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-75">{outfit.category}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                        {outfit.items.length} items
                      </span>
                    </div>
                  </div>
                  {selectedOutfit?.id === outfit.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="w-full py-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No outfits available</p>
              <a 
                href="/wardrobe" 
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Add items to wardrobe →
              </a>
            </div>
          )}
        </div>

        {selectedOutfit && (
          <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900">{selectedOutfit.name}</h4>
                <p className="text-sm text-gray-600">{selectedOutfit.category}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white rounded-xl transition-colors">
                  <Heart size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-white rounded-xl transition-colors">
                  <Share2 size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2">
              {selectedOutfit.items.map((item, index) => (
                <div key={index} className="flex-shrink-0 w-20">
                  <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {item.type === 'top' && '👕'}
                        {item.type === 'bottom' && '👖'}
                        {item.type === 'dress' && '👗'}
                        {item.type === 'shoes' && '👟'}
                        {item.type === 'outerwear' && '🧥'}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-900 font-medium truncate mt-1 text-center">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
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
                  className={`px-3 py-1.5 rounded-lg text-sm ${showSkeleton ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-gray-800 border border-gray-700 text-gray-300'}`}
                >
                  {showSkeleton ? 'Skeleton: ON' : 'Skeleton: OFF'}
                </button>
                <button
                  onClick={() => setShowKeypoints(!showKeypoints)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${showKeypoints ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' : 'bg-gray-800 border border-gray-700 text-gray-300'}`}
                >
                  {showKeypoints ? 'Keypoints: ON' : 'Keypoints: OFF'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 p-2 rounded-lg">
                  <div className="text-xs text-gray-400">Camera State</div>
                  <div className={`font-medium ${isCameraReady === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isCameraReady.toUpperCase()}
                  </div>
                </div>
                <div className="bg-gray-800/50 p-2 rounded-lg">
                  <div className="text-xs text-gray-400">Pose Detection</div>
                  <div className={`font-medium ${isDetecting ? 'text-green-400' : 'text-gray-300'}`}>
                    {isDetecting ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-400">MediaPipe Status</div>
                  <div className={`px-2 py-1 rounded text-xs ${isInitialized ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isInitialized ? 'LOADED' : 'NOT LOADED'}
                  </div>
                </div>
                <div className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Keypoints detected:</span>
                    <span className="font-medium">{pose?.keypointsCount || 0}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Confidence:</span>
                    <span className="font-medium">{pose ? Math.round(pose.score * 100) : 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FPS:</span>
                    <span className="font-medium">{debugInfo.fps || 0}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Scale Factor:</span>
                    <span className="font-medium">{getVideoDisplayRect().scale.toFixed(3)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  console.log('🎬 Camera stream:', cameraStream);
                  console.log('🦴 Pose detection state:', isDetecting);
                  console.log('📹 Video element:', videoRef.current);
                  console.log('📍 Current pose:', pose);
                  console.log('📐 Display rect:', getVideoDisplayRect());
                  console.log('📦 Container dimensions:', containerDimensions);
                  console.log('🎥 Video dimensions:', videoDimensions);
                  toast.success('Debug info logged to console');
                }}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Log Debug Info to Console
              </button>
              
              <button
                onClick={() => {
                  setShowDebug(false);
                  setShowSkeleton(true);
                  setShowKeypoints(true);
                  handleReset();
                }}
                className="w-full py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 rounded-lg text-sm transition-all"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instruction Guide */}
      <div className="fixed top-24 right-4 z-30 hidden md:block">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200 max-w-xs">
          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            Quick Guide
          </h4>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-600 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Select an outfit from below</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-purple-100 text-purple-600 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Position yourself in frame</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-green-100 text-green-600 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Tap "Start AR" to begin try-on</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}