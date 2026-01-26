// Simple fallback pose detector untuk development
export class SimplePoseDetector {
  constructor() {
    this.initialized = false;
    this.mockPose = {
      keypoints: {
        left_shoulder: { x: 300, y: 200, score: 0.9 },
        right_shoulder: { x: 500, y: 200, score: 0.9 },
        left_hip: { x: 320, y: 400, score: 0.8 },
        right_hip: { x: 480, y: 400, score: 0.8 },
        left_ankle: { x: 320, y: 600, score: 0.7 },
        right_ankle: { x: 480, y: 600, score: 0.7 },
      },
      score: 0.85,
      keypointsCount: 6,
      measurements: {
        shoulderWidth: 200,
        torsoHeight: 200,
        hipWidth: 160,
      }
    };
  }

  async initialize() {
    console.log('🔄 Initializing SIMPLE pose detector (mock mode)');
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.initialized = true;
    return true;
  }

  async detectPose(videoElement) {
    if (!this.initialized) await this.initialize();
    
    // Return mock pose untuk development
    return new Promise(resolve => {
      setTimeout(() => {
        // Tambahkan sedikit variasi untuk simulasi
        const pose = JSON.parse(JSON.stringify(this.mockPose));
        pose.keypoints.left_shoulder.x += Math.random() * 20 - 10;
        pose.keypoints.right_shoulder.x += Math.random() * 20 - 10;
        pose.timestamp = Date.now();
        resolve(pose);
      }, 100);
    });
  }

  getClothingPosition(pose, clothingType) {
    // Return default positions
    switch(clothingType) {
      case 'top':
        return { x: 250, y: 150, width: 300, height: 250 };
      case 'bottom':
        return { x: 300, y: 400, width: 200, height: 300 };
      case 'dress':
        return { x: 250, y: 150, width: 300, height: 500 };
      default:
        return { x: 200, y: 200, width: 200, height: 300 };
    }
  }
}

export const simplePoseDetector = new SimplePoseDetector();