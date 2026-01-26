// TensorFlow.js loader utility
class TensorFlowLoader {
  constructor() {
    this.loaded = false;
    this.loading = false;
    this.error = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async load() {
    if (this.loaded) return true;
    if (this.loading) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.loaded || this.error) {
            clearInterval(checkInterval);
            resolve(!this.error);
          }
        }, 100);
      });
    }

    this.loading = true;
    
    try {
      await this.loadScripts();
      this.loaded = true;
      console.log('✅ TensorFlow.js and Pose Detection loaded successfully');
      return true;
    } catch (error) {
      this.error = error.message;
      console.error('❌ TensorFlow.js loading failed:', error);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = this.retryCount * 3000;
        console.log(`🔄 Retrying in ${delay/1000}s (attempt ${this.retryCount}/${this.maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.load();
      }
      
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async loadScripts() {
    // Load TensorFlow.js core
    await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
    
    // Load Pose Detection
    await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js');
    
    // Setup TensorFlow
    if (!window.tf) {
      throw new Error('TensorFlow.js not loaded');
    }
    
    if (!window.poseDetection && !window.PoseDetection) {
      throw new Error('Pose Detection not loaded');
    }
    
    // Standardize naming
    if (window.poseDetection && !window.PoseDetection) {
      window.PoseDetection = window.poseDetection;
    }
    
    // Set backend
    try {
      await window.tf.setBackend('webgl');
    } catch (webglError) {
      console.warn('WebGL not available, falling back to CPU:', webglError);
      await window.tf.setBackend('cpu');
    }
    
    await window.tf.ready();
    
    console.log('TensorFlow backend:', window.tf.getBackend());
    console.log('PoseDetection available:', !!window.PoseDetection);
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        console.log(`Script already loaded: ${src}`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log(`✅ Script loaded: ${src.split('/').pop()}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`❌ Failed to load script: ${src}`, error);
        reject(new Error(`Failed to load ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  isReady() {
    return this.loaded && window.tf && window.PoseDetection;
  }

  getStatus() {
    return {
      loaded: this.loaded,
      loading: this.loading,
      error: this.error,
      tfAvailable: !!window.tf,
      poseDetectionAvailable: !!(window.PoseDetection || window.poseDetection)
    };
  }
}

export const tensorFlowLoader = new TensorFlowLoader();