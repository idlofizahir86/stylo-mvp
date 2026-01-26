import { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  Camera, 
  Image as ImageIcon, 
  RotateCw, 
  Download,
  AlertCircle,
  CheckCircle,
  User,
  Zap
} from 'lucide-react';
import ARClothingRenderer from '../components/tryon/ARClothingRenderer';
import { useMediaPipe } from '../hooks/useMediaPipe';
import { useFirestore } from '../hooks/useFirestore';
import LoadingScreen from '../components/tryon/LoadingScreen';
import PoseOverlay2D from '../components/tryon/PoseOverlay2D';
import CanvasPoseVisualizer from '../components/tryon/CanvasPoseVisualizer';

export default function TryOn() {
  // === STATE DECLARATIONS (ALL AT TOP, NO CONDITIONAL HOOKS) ===
  const [mode, setMode] = useState('camera');
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const [showDebug, setShowDebug] = useState(false);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'info' });
  const [cameraStream, setCameraStream] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState('stopped'); // 'stopped', 'starting', 'ready', 'error'

  const [debugInfo, setDebugInfo] = useState({
    poseCount: 0,
    lastPoseTime: null,
    fps: 0
    });
    
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const threeCanvasRef = useRef(null);
  
  // Custom Hooks (ALWAYS CALLED, NO CONDITIONALS)
  const { 
    pose, 
    startPoseDetection, 
    stopPoseDetection, 
    isInitialized, 
    isDetecting: poseDetecting,
    error: poseError,
    isLoading: isLoadingPose,
    loadingStep,
    loadingProgress,
    calibrateBody,
    retryInitialization 
  } = useMediaPipe();
  
  const { items: wardrobeItems, loading: wardrobeLoading } = useFirestore();

  useEffect(() => {
    if (pose) {
        console.log('🎯 POSE DATA RECEIVED:', {
        keypointsCount: pose.keypointsCount,
        score: pose.score,
        hasKeypoints: !!pose.keypoints,
        keypointsList: Object.keys(pose.keypoints || {}),
        // Log beberapa keypoints penting
        leftShoulder: pose.keypoints?.left_shoulder,
        rightShoulder: pose.keypoints?.right_shoulder,
        leftHip: pose.keypoints?.left_hip,
        rightHip: pose.keypoints?.right_hip,
        videoDimensions: videoDimensions
        });
        
        // Log semua keypoints yang score > 0.3
        Object.entries(pose.keypoints || {}).forEach(([name, point]) => {
        if (point.score > 0.3) {
            console.log(`  ${name}: x=${Math.round(point.x)}, y=${Math.round(point.y)}, score=${point.score.toFixed(2)}`);
        }
        });
    }
    }, [pose]);

  useEffect(() => {
    // Debug logging
    console.log('=== TENSORFLOW DEBUG INFO ===');
    console.log('window.tf:', window.tf);
    console.log('window.PoseDetection:', window.PoseDetection);
    console.log('window.tfLoaded:', window.tfLoaded);
    console.log('window.tfLoading:', window.tfLoading);
    console.log('window.tfLoadError:', window.tfLoadError);
    console.log('=============================');
    }, []);

    useEffect(() => {
    if (pose) {
        setDebugInfo(prev => ({
        poseCount: prev.poseCount + 1,
        lastPoseTime: new Date().toLocaleTimeString(),
        fps: Math.round(1000 / (Date.now() - (prev.lastTimestamp || Date.now())))
        }));
    }
    }, [pose]);

    {process.env.NODE_ENV === 'development' && (
  <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-50 max-w-md">
    <div className="font-bold mb-2">🔍 AR DEBUG PANEL</div>
    
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1">
        <div className="text-gray-400">Camera</div>
        <div>{videoDimensions.width}x{videoDimensions.height}</div>
        <div>{isCameraReady ? '✅ Ready' : '❌ Not Ready'}</div>
      </div>
      
      <div className="space-y-1">
        <div className="text-gray-400">Pose Detection</div>
        <div>{isDetecting ? '🟢 Active' : '🔴 Inactive'}</div>
        <div>FPS: {debugInfo.fps}</div>
      </div>
      
      <div className="space-y-1 col-span-2">
        <div className="text-gray-400">Current Pose</div>
        <div>{pose ? `✅ ${pose.keypointsCount} keypoints` : '❌ No pose'}</div>
        {pose && (
          <>
            <div>Score: {pose.score?.toFixed(2)}</div>
            <div>Shoulders: {pose.keypoints.left_shoulder ? '✅' : '❌'}</div>
            <div>Hips: {pose.keypoints.left_hip ? '✅' : '❌'}</div>
          </>
        )}
      </div>
      
      <div className="space-y-1 col-span-2">
        <div className="text-gray-400">Selected Outfit</div>
        <div>{selectedOutfit ? selectedOutfit.name : 'None'}</div>
        <div>{selectedOutfit?.items?.length || 0} items</div>
      </div>
      
      <div className="col-span-2">
        <button
          onClick={() => {
            console.log('=== FULL DEBUG INFO ===');
            console.log('Pose:', pose);
            console.log('Video Element:', videoRef.current);
            console.log('Video Stream:', videoRef.current?.srcObject);
            console.log('Selected Outfit:', selectedOutfit);
            console.log('Clothing Items:', selectedOutfit?.items);
          }}
          className="w-full mt-2 px-3 py-1 bg-blue-600 rounded text-xs"
        >
          Log Debug Info
        </button>
      </div>
    </div>
  </div>
)}

    
  
  // Memoized outfits
  const availableOutfits = useRef([]);
  useEffect(() => {
    if (wardrobeItems.length > 0) {
      availableOutfits.current = [
        {
          id: 'top-bottom',
          name: 'Top & Bottom',
          items: wardrobeItems.filter(item => item.type === 'top' || item.type === 'bottom').slice(0, 2)
        },
        {
          id: 'dress',
          name: 'Dress',
          items: wardrobeItems.filter(item => item.type === 'dress').slice(0, 1)
        },
        {
          id: 'top-only',
          name: 'Top Only',
          items: wardrobeItems.filter(item => item.type === 'top').slice(0, 1)
        },
        {
          id: 'bottom-only',
          name: 'Bottom Only',
          items: wardrobeItems.filter(item => item.type === 'bottom').slice(0, 1)
        }
      ].filter(outfit => outfit.items.length > 0);
    }
  }, [wardrobeItems]);

  // Snackbar helper
  const showMessage = useCallback((message, type = 'info') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => setSnackbar({ show: false, message: '', type: 'info' }), 3000);
  }, []);

    // Camera functions
    const startCamera = useCallback(async () => {
  if (videoRef.current?.srcObject) {
    console.log('📹 Camera already has stream, skipping...');
    return;
  }
  
  try {
    console.log('🚀 Starting camera...');
    showMessage('Starting camera...', 'info');
    
    setIsCameraReady('starting');
    
    // Gunakan resolusi yang lebih rendah untuk performa lebih baik
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
      
      // Tunggu video ready
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
      
      showMessage('Camera ready!', 'success');
    }
    
  } catch (error) {
    console.error('❌ Camera error:', error);
    setIsCameraReady('error');
    showMessage(`Camera failed: ${error.message}`, 'error');
  }
}, [showMessage]);

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');
    setIsCameraReady('stopping');
    
    // Stop stream jika ada
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
        });
        setCameraStream(null);
    }
    
    // Clear video element
    if (videoRef.current?.srcObject) {
        videoRef.current.srcObject = null;
    }
    
    setIsCameraReady('stopped');
    console.log('✅ Camera stopped');
    }, [cameraStream]); // Dependency hanya cameraStream

  // Camera effect
  useEffect(() => {
  console.log('🎬 Page loaded - initializing camera...');
  
  let mounted = true;
  let cameraStream = null;
  
  const initCamera = async () => {
    try {
      if (!mounted) return;
      
      // 1. Pastikan kita di mode camera
      setMode('camera');
      
      // 2. Tunggu render selesai
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 3. Dapatkan camera stream
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
      
      // 4. Jika sudah ada stream, skip
      if (videoRef.current?.srcObject) {
        console.log('✅ Camera already active');
        return;
      }
      
      // 5. Dapatkan camera stream dengan cara SIMPLE
      console.log('📡 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
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
      
      cameraStream = stream;
      
      // 6. Set ke video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 7. Tunggu video ready
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 2) {
            resolve();
          } else {
            videoRef.current.onloadeddata = resolve;
            setTimeout(resolve, 1000); // Fallback timeout
          }
        });
        
        // 8. Update dimensions
        if (videoRef.current.videoWidth > 2) {
          setVideoDimensions({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          });
          console.log(`🎥 Camera ready: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        }
      }
      
    } catch (error) {
      if (mounted) {
        console.error('❌ Camera init failed:', error);
        // Tampilkan pesan error di UI
        setSnackbar({
          show: true,
          message: `Camera error: ${error.message}`,
          type: 'error'
        });
      }
    }
  };
  
  // Start initialization
  initCamera();
  
  // Cleanup function
  return () => {
    console.log('🧼 Component cleanup');
    mounted = false;
    
    // Stop camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    
    // Clear video element
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    // Stop pose detection jika aktif
    if (isDetecting) {
      stopPoseDetection();
    }
  };
}, []); // ✅ HANYA jalan sekali saat komponen mount

  // AR functions
    const handleStartAR = useCallback(async () => {
    if (!selectedOutfit || selectedOutfit.items.length === 0) {
        showMessage('Please select an outfit first!', 'warning');
        return;
    }

    if (!isInitialized) {
        showMessage('Body tracking system initializing...', 'warning');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
    }

    if (!videoRef.current || videoRef.current.videoWidth === 0) {
        showMessage('Camera not ready. Please wait...', 'warning');
        return;
    }

    setIsDetecting(true);
    setCalibrationComplete(false);
    
    showMessage('Starting body tracking...', 'info');

    try {
        // Start pose detection dengan video yang sudah ada
        await startPoseDetection(videoRef.current, (detectedPose) => {
        if (detectedPose && !calibrationComplete) {
            setCalibrationComplete(true);
            // showMessage('Body tracking active! Move naturally.', 'success');
        }
        });
        
    } catch (error) {
        console.error('Failed to start pose detection:', error);
        showMessage(`Tracking error: ${error.message}`, 'error');
        setIsDetecting(false);
    }
    }, [selectedOutfit, isInitialized, startPoseDetection, calibrationComplete, showMessage]);

  const handleStopAR = useCallback(() => {
    setIsDetecting(false);
    stopPoseDetection();
    setCalibrationComplete(false);
    showMessage('AR try-on stopped', 'info');
  }, [stopPoseDetection, showMessage]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          ctx.drawImage(img, 0, 0);
          setVideoDimensions({ width: img.width, height: img.height });
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    setMode('upload');
    showMessage('Photo loaded successfully', 'success');
  }, [showMessage]);

  const handleSaveSnapshot = useCallback(() => {
    try {
      const snapshotCanvas = document.createElement('canvas');
      const ctx = snapshotCanvas.getContext('2d');
      
      if (mode === 'camera' && videoRef.current) {
        snapshotCanvas.width = videoDimensions.width;
        snapshotCanvas.height = videoDimensions.height;
        ctx.drawImage(videoRef.current, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
        
        if (threeCanvasRef.current) {
          const threeCanvas = threeCanvasRef.current;
          ctx.drawImage(threeCanvas, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
        }
      } else if (mode === 'upload' && canvasRef.current) {
        snapshotCanvas.width = canvasRef.current.width;
        snapshotCanvas.height = canvasRef.current.height;
        ctx.drawImage(canvasRef.current, 0, 0);
      } else {
        showMessage('Nothing to save', 'warning');
        return;
      }
      
      // Add watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, snapshotCanvas.height - 60, 200, 50);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Styled with Stylo', 20, snapshotCanvas.height - 40);
      ctx.font = '12px Arial';
      ctx.fillText(new Date().toLocaleDateString(), 20, snapshotCanvas.height - 20);
      
      if (selectedOutfit) {
        ctx.fillText(selectedOutfit.name, 20, snapshotCanvas.height - 55);
      }
      
      // Download
      const link = document.createElement('a');
      link.download = `stylo-tryon-${Date.now()}.png`;
      link.href = snapshotCanvas.toDataURL('image/png', 1.0);
      link.click();
      
      showMessage('Snapshot saved!', 'success');
      snapshotCanvas.remove();
    } catch (error) {
      console.error('Error saving snapshot:', error);
      showMessage('Failed to save snapshot', 'error');
    }
  }, [mode, videoDimensions, selectedOutfit, showMessage]);

  const handleReset = useCallback(() => {
    handleStopAR();
    stopCamera();
    calibrateBody();
    
    setTimeout(() => {
      if (mode === 'camera') {
        startCamera();
      }
    }, 500);
    
    showMessage('Reset complete', 'info');
  }, [handleStopAR, stopCamera, calibrateBody, mode, startCamera, showMessage]);

  // === RENDER LOGIC (NO HOOKS AFTER THIS LINE) ===
  
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

  // Show error screen if pose detection failed
  if (poseError && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Model Failed to Load
          </h2>
          <p className="text-gray-600 mb-6">{poseError}</p>
          <div className="space-y-4">
            <button
              onClick={retryInitialization}
              className="w-full btn-primary"
            >
              Retry Loading AI Model
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full btn-secondary"
            >
              Refresh Page
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>If the problem persists:</p>
            <ul className="mt-2 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Disable ad blockers for this site</li>
              <li>• Try a different browser (Chrome recommended)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Virtual Try-On</h1>
        <p className="text-gray-600 mt-2">
          Real-time body tracking with AI-powered clothing placement
        </p>
      </div>

        

      {/* Snackbar */}
      {snackbar.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          snackbar.type === 'error' ? 'bg-red-500' :
          snackbar.type === 'warning' ? 'bg-yellow-500' :
          snackbar.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        } text-white transition-transform duration-300`}>
          <div className="flex items-center space-x-2">
            {snackbar.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {snackbar.type === 'error' && <AlertCircle className="h-5 w-5" />}
            <span>{snackbar.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mode Selection */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Try-On Mode</h2>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setMode('camera')}
                className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                  mode === 'camera'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Camera className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Live AR</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                  mode === 'upload'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Photo</span>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <button
              onClick={isDetecting ? handleStopAR : handleStartAR}
              disabled={(!selectedOutfit || selectedOutfit.items.length === 0) && !isDetecting}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDetecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Stop AR</span>
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  <span>Start AR Try-On</span>
                </>
              )}
            </button>
          </div>

          {/* Outfit Selection */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select Outfit</h2>
              <button
                onClick={() => setSelectedOutfit(null)}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                disabled={!selectedOutfit}
              >
                Clear
              </button>
            </div>
            
            {wardrobeLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : availableOutfits.current.length > 0 ? (
              <div className="space-y-3">
                {availableOutfits.current.map((outfit) => (
                  <button
                    key={outfit.id}
                    onClick={() => setSelectedOutfit(outfit)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedOutfit?.id === outfit.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex space-x-1 mr-3">
                        {outfit.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{outfit.name}</h3>
                        <p className="text-sm text-gray-600">
                          {outfit.items.length} item{outfit.items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No outfits available</p>
                <a 
                  href="/wardrobe" 
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Add items to wardrobe →
                </a>
              </div>
            )}
          </div>

          {/* Selected Outfit Preview */}
          {selectedOutfit && (
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Selected Items</h3>
                <span className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">
                  {selectedOutfit.items.length} items
                </span>
              </div>
              <div className="space-y-2">
                {selectedOutfit.items.map((item, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden mr-3 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: item.color }}
                          title={item.color}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - AR Preview */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === 'camera' ? 'Live AR View' : 'Photo Try-On'}
                </h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isDetecting 
                        ? pose 
                          ? 'bg-green-500 animate-pulse' 
                          : 'bg-yellow-500' 
                        : 'bg-gray-300'
                    }`} />
                    <span className="text-sm text-gray-600">
                      {isDetecting 
                        ? pose 
                          ? `Body tracked (${pose.keypointsCount} points)` 
                          : 'Searching...' 
                        : 'Ready'
                      }
                    </span>
                  </div>
                  {pose && (
                    <div className="text-sm px-3 py-1 rounded-full bg-green-50 text-green-700">
                      {Math.round(pose.score * 100)}% confidence
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleReset}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <RotateCw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleSaveSnapshot}
                  disabled={!isDetecting}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden min-h-[500px]">
                {mode === 'camera' ? (
                    <div className="relative w-full h-full">
                    {/* Container untuk video dan overlay - SAMA UKURAN */}
                    <div className="relative w-full h-full">
                        {/* Video Element - TANPA object-cover */}
                        <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full" // ⚠️ HAPUS object-cover
                        style={{ 
                            transform: 'scaleX(-1)', // Mirror video saja
                            backgroundColor: '#000',
                            // Pastikan video mempertahankan aspect ratio asli
                            objectFit: 'contain' // GANTI dari 'cover' ke 'contain'
                        }}
                        />
                        
                        {/* 2D Pose Overlay - POSISI ABSOLUT di atas video */}
                        {isDetecting && (
                        <div className="absolute inset-0">
                            <PoseOverlay2D
                            videoRef={videoRef}
                            pose={pose}
                            isDetecting={isDetecting}
                            showSkeleton={true}
                            showPoints="detailed"
                            />
                        </div>
                        )}
                        
                        {/* Three.js Canvas (opsional, disable dulu) */}
                        {false && isDetecting && selectedOutfit && (
                        <div className="absolute inset-0 pointer-events-none">
                            <Canvas>...</Canvas>
                        </div>
                        )}
                    </div>
                    
                    {/* Status Overlay */}
                    <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg font-mono">
                        <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                            pose ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                        }`} />
                        <span>{pose ? `${pose.keypointsCount} keypoints` : 'Detecting...'}</span>
                        </div>
                        {videoRef.current && (
                        <div className="text-xs mt-1 text-gray-300">
                            Video: {videoRef.current.videoWidth}x{videoRef.current.videoHeight} | 
                            Display: {videoRef.current.clientWidth}x{videoRef.current.clientHeight}
                        </div>
                        )}
                    </div>
                    </div>
                )  : mode === 'upload' ? (
                <div className="relative w-full h-full">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-contain"
                  />
                  
                  {isDetecting && selectedOutfit && pose && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <Canvas
                        ref={threeCanvasRef}
                        style={{ width: '100%', height: '100%' }}
                        orthographic
                        camera={{ 
                            zoom: 100, 
                            position: [0, 0, 5],
                            left: -videoDimensions.width / 200,
                            right: videoDimensions.width / 200,
                            top: videoDimensions.height / 200,
                            bottom: -videoDimensions.height / 200,
                            near: 0.1,
                            far: 1000
                        }}
                        >
                        {/* TAMBAHKAN AMBIENT LIGHT */}
                        <ambientLight intensity={0.8} />
                        
                        {/* RENDER AR CLOTHING */}
                        <ARClothingRenderer
                            pose={pose}
                            clothingItems={selectedOutfit.items}
                            videoDimensions={videoDimensions}
                            isDetecting={isDetecting}
                        />
                        
                        {/* DEBUG: Visualize pose keypoints */}
                        {pose && Object.entries(pose.keypoints).map(([key, point]) => (
                            <mesh
                            key={key}
                            position={[
                                (point.x - videoDimensions.width / 2) * 0.01,
                                (-point.y + videoDimensions.height / 2) * 0.01,
                                0.5
                            ]}
                            >
                            <sphereGeometry args={[0.05, 8, 8]} />
                            <meshBasicMaterial color="#ff0000" />
                            </mesh>
                        ))}
                        </Canvas>
                    </div>
                    )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Camera className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Select a try-on mode</h3>
                  <p className="text-gray-400 text-center mb-6">
                    Choose live camera or upload a photo to start
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
            
             {/* DEBUG PANEL - Tampilkan informasi real-time */}
            // Di TryOn.jsx, tambahkan debug panel yang interaktif:
            {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-sm font-mono z-50 max-w-md border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                <div className="font-bold flex items-center">
                    <span className="mr-2">🔍</span>AR DEBUG PANEL
                </div>
                <div className="flex space-x-2">
                    <button
                    onClick={() => setShowDebug(prev => !prev)}
                    className="px-2 py-1 bg-blue-600 rounded text-xs"
                    >
                    {showDebug ? 'Hide' : 'Show'} 3D
                    </button>
                    <button
                    onClick={handleReset}
                    className="px-2 py-1 bg-red-600 rounded text-xs"
                    >
                    Reset All
                    </button>
                </div>
                </div>
                
                <div className="space-y-3">
                {/* Camera Status */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                    <div className="text-gray-400 text-xs">Camera</div>
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                        isCameraReady === 'ready' ? 'bg-green-500 animate-pulse' :
                        isCameraReady === 'starting' ? 'bg-yellow-500' :
                        isCameraReady === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span>{isCameraReady}</span>
                    </div>
                    <div className="text-xs text-gray-300">
                        {videoDimensions.width}x{videoDimensions.height}
                    </div>
                    </div>
                    
                    <div>
                    <div className="text-gray-400 text-xs">Pose Detection</div>
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                        isDetecting ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span>{isDetecting ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="text-xs text-gray-300">
                        {pose ? `${pose.keypointsCount} points` : 'No pose'}
                    </div>
                    </div>
                </div>
                
                {/* Pose Details */}
                {pose && (
                    <div className="border-t border-gray-700 pt-2">
                    <div className="text-gray-400 text-xs mb-1">Pose Details</div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="bg-gray-800 p-2 rounded">
                        <div>Score</div>
                        <div className="font-bold">{pose.score?.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded">
                        <div>Model</div>
                        <div className="font-bold">{pose.model || 'Unknown'}</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded">
                        <div>Timestamp</div>
                        <div className="font-bold">{new Date(pose.timestamp).toLocaleTimeString()}</div>
                        </div>
                    </div>
                    
                    {/* Keypoint Status */}
                    <div className="mt-2 grid grid-cols-4 gap-1 text-xs">
                        {['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'].map(key => (
                        <div key={key} className={`p-1 rounded text-center ${
                            pose.keypoints[key]?.score > 0.3 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                            <div className="font-mono">{key.split('_')[1]}</div>
                            <div>{pose.keypoints[key]?.score?.toFixed(2) || '0.00'}</div>
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                
                {/* Actions */}
                <div className="border-t border-gray-700 pt-2">
                    <div className="text-gray-400 text-xs mb-1">Quick Actions</div>
                    <div className="flex flex-wrap gap-1">
                    <button
                        onClick={() => {
                        console.log('=== FULL DEBUG ===');
                        console.log('Pose:', pose);
                        console.log('Video:', videoRef.current);
                        console.log('Video Stream:', videoRef.current?.srcObject?.getTracks());
                        console.log('Dimensions:', videoDimensions);
                        console.log('Selected Outfit:', selectedOutfit);
                        }}
                        className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                    >
                        Log Debug
                    </button>
                    <button
                        onClick={() => {
                        if (videoRef.current) {
                            const video = videoRef.current;
                            console.log('Video Element State:', {
                            width: video.videoWidth,
                            height: video.videoHeight,
                            readyState: video.readyState,
                            currentTime: video.currentTime,
                            paused: video.paused
                            });
                        }
                        }}
                        className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                    >
                        Check Video
                    </button>
                    <button
                        onClick={() => {
                        if (pose) {
                            Object.entries(pose.keypoints).forEach(([name, point]) => {
                            console.log(`${name}: x=${point.x}, y=${point.y}, score=${point.score}`);
                            });
                        }
                        }}
                        className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600"
                    >
                        Log Keypoints
                    </button>
                    </div>
                </div>
                </div>
            </div>
            )}
    </div>
  );
}