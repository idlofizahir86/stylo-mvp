import React, { useRef, useEffect } from 'react';

const CanvasPoseVisualizer = ({ pose, videoDimensions, videoRef }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Konfigurasi koneksi tubuh (diambil dari tracker.js GitHub)
  const BODY_CONNECTIONS = {
    'movenet_posenet': [
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
      ['right_knee', 'right_ankle'],
      ['nose', 'left_eye'],
      ['nose', 'right_eye'],
      ['left_eye', 'left_ear'],
      ['right_eye', 'right_ear']
    ],
    'blaze_pose': [
      // ... tambahkan koneksi BlazePose jika perlu
    ]
  };

  // Warna untuk setiap keypoint (diambil dari contoh GitHub)
  const KEYPOINT_COLORS = {
    nose: [255, 0, 0],
    left_eye: [0, 255, 0],
    right_eye: [0, 255, 0],
    left_ear: [197, 217, 15],
    right_ear: [197, 217, 15],
    left_shoulder: [255, 0, 255],
    right_shoulder: [255, 0, 255],
    left_elbow: [0, 255, 255],
    right_elbow: [0, 255, 255],
    left_wrist: [255, 255, 255],
    right_wrist: [255, 255, 255],
    left_hip: [255, 136, 0],
    right_hip: [255, 136, 0],
    left_knee: [136, 255, 0],
    right_knee: [136, 255, 0],
    left_ankle: [0, 136, 255],
    right_ankle: [0, 136, 255]
  };

  // Fungsi untuk menggambar pose (diadaptasi dari tracker.js)
  const drawPose = () => {
    if (!canvasRef.current || !pose || !pose.keypoints) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size sesuai video
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth || videoDimensions.width;
      canvas.height = videoRef.current.videoHeight || videoDimensions.height;
    } else {
      canvas.width = videoDimensions.width;
      canvas.height = videoDimensions.height;
    }
    
    // Mirror untuk kamera depan
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    
    // Gambar video frame (opsional)
    if (videoRef.current && videoRef.current.readyState >= 2) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    const keypoints = pose.keypoints;
    const connections = BODY_CONNECTIONS['movenet_posenet'];
    
    // Gambar koneksi (garis)
    connections.forEach(([start, end]) => {
      const startPoint = keypoints[start];
      const endPoint = keypoints[end];
      
      if (startPoint && endPoint && startPoint.score > 0.2 && endPoint.score > 0.2) {
        // Ambil warna dari konfigurasi atau gunakan default
        const color = KEYPOINT_COLORS[start] || [0, 255, 0];
        const alpha = Math.min(startPoint.score, endPoint.score);
        
        // Gambar garis
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        ctx.stroke();
        ctx.closePath();
      }
    });
    
    // Gambar titik keypoints
    Object.entries(keypoints).forEach(([name, point]) => {
      if (point.score > 0.2) {
        const color = KEYPOINT_COLORS[name] || [255, 255, 255];
        const radius = 6 + (point.score * 4); // Radius berdasarkan confidence
        
        // Gambar lingkaran luar
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${point.score * 0.5})`;
        ctx.fill();
        ctx.closePath();
        
        // Gambar titik utama
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${point.score})`;
        ctx.fill();
        ctx.closePath();
        
        // Gambar label (opsional)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${name.replace('_', ' ')} (${Math.round(point.score * 100)}%)`,
          point.x,
          point.y - radius - 5
        );
      }
    });
    
    ctx.restore(); // Restore transformasi
    
    // Gambar bounding box jika ada
    if (pose.box) {
      const { x, y, width, height } = pose.box;
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Label bounding box
      ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`Body Box`, x + 5, y - 5);
      
      ctx.restore();
    }
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawPose();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    if (pose) {
      animate();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [pose, videoDimensions]);

  if (!pose) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5
      }}
    />
  );
};

export default CanvasPoseVisualizer;