import { useState, useEffect, useRef, useCallback } from 'react';
import { poseDetector } from '../services/ai/poseDetector';

export const useMediaPipe = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pose, setPose] = useState(null);
  const [error, setError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Loading AI model...');
  
  // Refs untuk kontrol loop
  const animationFrameRef = useRef(null);
  const detectionActiveRef = useRef(false);
  const lastPoseRef = useRef(null);
  const frameCountRef = useRef(0);

  // Initialize detector
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingStep('Initializing TensorFlow.js...');
      
      await poseDetector.initialize();
      
      setIsInitialized(true);
      console.log('✅ Pose detector initialized');
      
    } catch (err) {
      console.error('Failed to initialize pose detector:', err);
      setError(`AI Model failed to load: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // FIXED: Start pose detection dengan loop yang stabil
  const startPoseDetection = useCallback(async (videoElement, onPoseUpdate = null) => {
    if (!videoElement || videoElement.videoWidth === 0) {
      console.log('⏳ Video not ready yet, waiting...');
      setTimeout(() => startPoseDetection(videoElement, onPoseUpdate), 500);
      return;
    }

    if (!isInitialized) {
      console.log('🔄 Detector not initialized, initializing...');
      await initialize();
    }

    console.log('🚀 Starting CONTINUOUS pose detection...');
    setIsDetecting(true);
    detectionActiveRef.current = true;
    setError(null);
    frameCountRef.current = 0;

    const detectLoop = async () => {
      if (!detectionActiveRef.current) {
        console.log('🛑 Detection loop stopped');
        return;
      }

      try {
        frameCountRef.current++;
        
        // Skip frame untuk performance (setiap 2 frame untuk 30fps)
        if (frameCountRef.current % 2 === 0) {
          const detectedPose = await poseDetector.detectPose(videoElement);
          
          if (detectedPose) {
            // Simpan pose terakhir untuk smoothing
            lastPoseRef.current = detectedPose;
            
            // Format pose untuk Three.js
            const formattedPose = {
              keypoints: detectedPose.keypoints || {},
              score: detectedPose.score || 0,
              timestamp: Date.now(),
              keypointsCount: Object.keys(detectedPose.keypoints || {}).length,
              model: detectedPose.model || 'MoveNet',
              // Tambahkan data untuk visualisasi
              box: detectedPose.box || { x: 0, y: 0, width: 100, height: 200 },
              measurements: detectedPose.measurements || {}
            };
            
            setPose(formattedPose);
            
            if (onPoseUpdate) {
              onPoseUpdate(formattedPose);
            }
            
            console.log(`✅ Pose detected: ${formattedPose.keypointsCount} points, score: ${formattedPose.score.toFixed(2)}`);
          } else {
            // Jika tidak ada pose, tetap update state kosong
            setPose(null);
          }
        }
      } catch (err) {
        console.warn('⚠️ Frame detection error:', err);
        // Jangan stop loop hanya karena 1 frame error
      }

      // Lanjutkan loop jika masih aktif
      if (detectionActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectLoop);
      }
    };

    // Start loop
    animationFrameRef.current = requestAnimationFrame(detectLoop);

    // Return cleanup function
    return () => {
      console.log('🛑 Cleaning up detection loop');
      detectionActiveRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isInitialized, initialize]);

  // Stop detection
  const stopPoseDetection = useCallback(() => {
    console.log('🛑 Stopping pose detection');
    setIsDetecting(false);
    detectionActiveRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setPose(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
    
    return () => {
      stopPoseDetection();
    };
  }, [initialize, stopPoseDetection]);

  return {
    isInitialized,
    isLoading,
    loadingStep,
    loadingProgress: isLoading ? 50 : 100,
    isDetecting,
    pose,
    error,
    startPoseDetection,
    stopPoseDetection,
    calibrateBody: () => {
      setPose(null);
      lastPoseRef.current = null;
    },
    retryInitialization: initialize
  };
};