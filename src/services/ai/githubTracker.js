// Adaptasi dari tracker.js GitHub untuk React
export class GitHubPoseTracker {
  constructor() {
    this.detector = null;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.currentPose = null;
  }

  async initialize(videoElement, canvasElement) {
    // Tunggu TensorFlow.js
    if (!window.tf || !window.PoseDetection) {
      throw new Error('TensorFlow.js not loaded');
    }
    
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    
    // Buat detector (gunakan MoveNet seperti contoh)
    this.detector = await window.PoseDetection.createDetector(
      window.PoseDetection.SupportedModels.MoveNet,
      {
        modelType: 'lightning',
        enableSmoothing: true,
        minPoseScore: 0.25
      }
    );
    
    return true;
  }

  start() {
    if (!this.detector || !this.video || !this.canvas) {
      throw new Error('Tracker not initialized');
    }
    
    this.isRunning = true;
    this.videoFrame();
  }

  stop() {
    this.isRunning = false;
    this.currentPose = null;
  }

  async videoFrame() {
    if (!this.isRunning) return;
    
    try {
      // Deteksi pose
      const poses = await this.detector.estimatePoses(this.video, {
        flipHorizontal: true,
        maxPoses: 1
      });
      
      if (poses.length > 0) {
        this.currentPose = poses[0];
        this.drawPose(this.currentPose);
      }
      
      // Lanjutkan loop
      requestAnimationFrame(() => this.videoFrame());
      
    } catch (error) {
      console.error('Pose detection error:', error);
      if (this.isRunning) {
        setTimeout(() => this.videoFrame(), 100);
      }
    }
  }

  // Fungsi drawPose diadaptasi dari tracker.js GitHub
  drawPose(pose) {
    if (!this.ctx || !pose) return;
    
    const { width, height } = this.canvas;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw video
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.translate(-width, 0);
    this.ctx.drawImage(this.video, 0, 0, width, height);
    
    // Draw keypoints dan connections
    this.drawKeypointsAndConnections(pose);
    
    this.ctx.restore();
  }

  drawKeypointsAndConnections(pose) {
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ];
    
    // Draw connections
    connections.forEach(([start, end]) => {
      const startKp = pose.keypoints.find(kp => kp.name === start);
      const endKp = pose.keypoints.find(kp => kp.name === end);
      
      if (startKp && endKp && startKp.score > 0.3 && endKp.score > 0.3) {
        this.ctx.beginPath();
        this.ctx.moveTo(startKp.x, startKp.y);
        this.ctx.lineTo(endKp.x, endKp.y);
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = `rgba(0, 255, 0, ${Math.min(startKp.score, endKp.score)})`;
        this.ctx.stroke();
      }
    });
    
    // Draw keypoints
    pose.keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        this.ctx.beginPath();
        this.ctx.arc(kp.x, kp.y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 0, 0, ${kp.score})`;
        this.ctx.fill();
        
        // Draw label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillText(
          `${kp.name.replace('_', ' ')} ${Math.round(kp.score * 100)}%`,
          kp.x + 8,
          kp.y - 8
        );
      }
    });
  }

  getCurrentPose() {
    return this.currentPose;
  }
}

export const githubTracker = new GitHubPoseTracker();