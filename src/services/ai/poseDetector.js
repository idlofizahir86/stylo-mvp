// Enhanced Pose Detector dengan validasi dan fallback
export class PoseDetector {
  constructor() {
    this.detector = null;
    this.initialized = false;
    this.modelType = null;
    this.isModelLoading = false;
    this.maxRetries = 3;
    this.retryCount = 0;
  }

  async waitForTensorFlow(timeout = 30000) {
    console.log('⏳ Waiting for TensorFlow.js...');
    
    // Jika sudah loaded
    if (window.tensorflowState && window.tensorflowState.loaded) {
      console.log('✅ TensorFlow.js already loaded');
      return true;
    }
    
    // Jika sedang loading, tunggu
    if (window.tensorflowState && window.tensorflowState.loading) {
      console.log('⏳ TensorFlow.js is loading, waiting...');
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (window.tensorflowState.loaded) {
            clearInterval(checkInterval);
            resolve(true);
          }
          if (window.tensorflowState.error) {
            clearInterval(checkInterval);
            reject(new Error(window.tensorflowState.error));
          }
        }, 500);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Timeout waiting for TensorFlow.js'));
        }, timeout);
      });
    }
    
    // Jika belum mulai loading, mulai sekarang
    return new Promise((resolve, reject) => {
      window.addEventListener('tensorflow-loaded', () => {
        console.log('✅ TensorFlow.js loaded via event');
        resolve(true);
      }, { once: true });
      
      window.addEventListener('tensorflow-error', (e) => {
        console.error('❌ TensorFlow.js loading error via event');
        reject(new Error(e.detail.message));
      }, { once: true });
      
      // Start loading jika belum
      if (!window.tensorflowState || !window.tensorflowState.loading) {
        const loadScript = document.createElement('script');
        loadScript.innerHTML = `
          (async function() {
            try {
              await loadTensorFlow();
            } catch (err) {
              console.error('Auto-load failed:', err);
            }
          })();
        `;
        document.head.appendChild(loadScript);
      }
    });
  }

  async validateLibraries() {
    console.log('🔍 Validating libraries...');
    
    // Check TensorFlow
    if (!window.tf) {
      console.error('❌ window.tf not found');
      return false;
    }
    
    // Check PoseDetection
    if (!window.PoseDetection) {
      console.error('❌ window.PoseDetection not found');
      
      // Coba alternatif
      if (window.poseDetection) {
        console.log('⚠️ Found poseDetection (lowercase), using it');
        window.PoseDetection = window.poseDetection;
      } else if (window.tensorflowState && window.tensorflowState.poseDetection) {
        console.log('⚠️ Found poseDetection in tensorflowState, using it');
        window.PoseDetection = window.tensorflowState.poseDetection;
      } else {
        return false;
      }
    }
    
    console.log('✅ Libraries validated');
    console.log('tf:', typeof window.tf);
    console.log('PoseDetection:', typeof window.PoseDetection);
    console.log('createDetector available:', typeof window.PoseDetection.createDetector);
    
    return true;
  }

  async initialize() {
    if (this.initialized) {
      console.log('✅ Detector already initialized');
      return true;
    }
    
    if (this.isModelLoading) {
      console.log('⏳ Model is loading, please wait...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.initialize();
    }
    
    this.isModelLoading = true;
    this.retryCount++;
    
    try {
      console.log(`🚀 Initializing pose detector (attempt ${this.retryCount}/${this.maxRetries})...`);
      
      // 1. Tunggu TensorFlow.js
      await this.waitForTensorFlow();
      
      // 2. Validasi libraries
      if (!(await this.validateLibraries())) {
        throw new Error('Required libraries not available');
      }
      
      // 3. Coba model yang berbeda secara berurutan
      const modelAttempts = [
        {
          name: 'MoveNet',
          config: {
            modelType: window.PoseDetection.movenet && window.PoseDetection.movenet.modelType 
              ? window.PoseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING 
              : 'lightning',
            enableSmoothing: true,
            minPoseScore: 0.25
          }
        },
        {
          name: 'BlazePose',
          config: {
            runtime: 'tfjs',
            modelType: 'lite',
            enableSmoothing: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          }
        }
      ];
      
      let detectorCreated = false;
      
      for (const modelAttempt of modelAttempts) {
        try {
          console.log(`🔄 Trying ${modelAttempt.name}...`);
          
          this.detector = await window.PoseDetection.createDetector(
            window.PoseDetection.SupportedModels 
              ? window.PoseDetection.SupportedModels[modelAttempt.name] 
              : modelAttempt.name,
            modelAttempt.config
          );
          
          this.modelType = modelAttempt.name;
          detectorCreated = true;
          console.log(`✅ ${modelAttempt.name} detector created successfully`);
          break;
          
        } catch (modelError) {
          console.warn(`❌ ${modelAttempt.name} failed:`, modelError.message);
          continue;
        }
      }
      
      if (!detectorCreated) {
        throw new Error('All pose detector models failed');
      }
      
      // 4. Test detector
      if (!this.detector || typeof this.detector.estimatePoses !== 'function') {
        throw new Error('Detector missing estimatePoses method');
      }
      
      this.initialized = true;
      this.isModelLoading = false;
      console.log('🎉 Pose detector FULLY INITIALIZED!');
      console.log('Model type:', this.modelType);
      
      return true;
      
    } catch (error) {
      this.isModelLoading = false;
      console.error(`❌ Initialization attempt ${this.retryCount} failed:`, error.message);
      
      if (this.retryCount < this.maxRetries) {
        const delay = this.retryCount * 2000;
        console.log(`🔄 Retrying in ${delay/1000}s...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.initialize();
      }
      
      throw new Error(`Pose detection failed after ${this.maxRetries} attempts: ${error.message}`);
    }
  }

  // Di useMediaPipe.js, update fungsi detectPose di poseDetector:
async detectPose(videoElement) {
  if (!this.initialized || !this.detector) {
    console.log('🔄 Detector not ready, initializing...');
    try {
      await this.initialize();
    } catch (initError) {
      console.error('Cannot initialize detector:', initError);
      return null;
    }
  }

  try {
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn('Video element not ready');
      return null;
    }

    // Pastikan video sudah siap
    if (videoElement.readyState < 2) {
      await new Promise(resolve => {
        videoElement.onloadeddata = resolve;
        setTimeout(resolve, 100);
      });
    }

    // Gunakan konfigurasi yang lebih akurat
    const detectionConfig = {
      flipHorizontal: true, // IMPORTANT: Mirror untuk kamera depan
      maxPoses: 1,
      scoreThreshold: 0.25, // Threshold lebih rendah untuk deteksi lebih sensitif
      nmsRadius: 20,
    };

    console.log('🎯 Detecting pose on video:', {
      width: videoElement.videoWidth,
      height: videoElement.videoHeight,
      flipped: detectionConfig.flipHorizontal
    });

    const startTime = performance.now();
    const poses = await this.detector.estimatePoses(videoElement, detectionConfig);
    const endTime = performance.now();
    
    console.log(`⏱️ Detection took ${Math.round(endTime - startTime)}ms`);

    if (poses.length > 0) {
      const pose = poses[0];
      console.log(`🎯 Pose detected with score: ${pose.score.toFixed(3)}`);
      
      // Validasi: pastikan kita memiliki cukup keypoints
      const validKeypoints = pose.keypoints.filter(kp => kp.score > 0.3);
      if (validKeypoints.length < 8) { // Minimal 8 keypoints
        console.warn(`⚠️ Too few valid keypoints: ${validKeypoints.length}`);
        return null;
      }
      
      return this.formatPoseData(pose);
    } else {
      console.log('❌ No pose detected');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Pose detection error:', error);
    return null;
  }
}

  formatPoseData(pose) {
    const keypoints = {};
    
    if (pose.keypoints && Array.isArray(pose.keypoints)) {
      pose.keypoints.forEach(kp => {
        if (kp.score > 0.2) {
          keypoints[kp.name] = {
            x: kp.x,
            y: kp.y,
            z: kp.z || 0,
            score: kp.score
          };
        }
      });
    }
    
    const box = this.calculateBodyBox(pose.keypoints);
    const measurements = this.estimateBodyMeasurements(keypoints);
    
    return {
      keypoints,
      box,
      measurements,
      score: pose.score || 0,
      timestamp: Date.now(),
      keypointsCount: Object.keys(keypoints).length,
      model: this.modelType
    };
  }

  calculateBodyBox(keypointsArray) {
    if (!keypointsArray || !Array.isArray(keypointsArray)) {
      return { x: 0, y: 0, width: 200, height: 400 };
    }

    const validPoints = keypointsArray.filter(kp => kp && kp.score > 0.2);
    
    if (validPoints.length === 0) {
      return { x: 0, y: 0, width: 200, height: 400 };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = 0, maxY = 0;
    
    validPoints.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    const padding = 60;
    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: Math.max(100, maxX - minX + padding * 2),
      height: Math.max(200, maxY - minY + padding * 2),
    };
  }

  estimateBodyMeasurements(keypoints) {
    const measurements = {
      shoulderWidth: 0,
      torsoHeight: 0,
      hipWidth: 0,
    };

    if (keypoints.left_shoulder && keypoints.right_shoulder) {
      measurements.shoulderWidth = Math.abs(
        keypoints.right_shoulder.x - keypoints.left_shoulder.x
      );
    }

    if (keypoints.left_shoulder && keypoints.left_hip) {
      measurements.torsoHeight = Math.abs(
        keypoints.left_hip.y - keypoints.left_shoulder.y
      );
    }

    if (keypoints.left_hip && keypoints.right_hip) {
      measurements.hipWidth = Math.abs(
        keypoints.right_hip.x - keypoints.left_hip.x
      );
    }

    return measurements;
  }
}

export const poseDetector = new PoseDetector();