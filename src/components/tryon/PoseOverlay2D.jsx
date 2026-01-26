// components/tryon/PoseOverlay2D.jsx
import React, { useRef, useEffect, useCallback } from 'react';

const PoseOverlay2D = ({ 
  videoRef, 
  pose, 
  isDetecting,
  showSkeleton = true,
  showPoints = true 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastPoseRef = useRef(null);
  const lastDimensionsRef = useRef({ width: 0, height: 0 });

  // Fungsi untuk update ukuran canvas
  const updateCanvasSize = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return false;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Gunakan ukuran display video, bukan videoWidth/videoHeight
    const displayWidth = video.clientWidth || video.offsetWidth;
    const displayHeight = video.clientHeight || video.offsetHeight;
    
    if (displayWidth > 0 && displayHeight > 0 && 
        (displayWidth !== lastDimensionsRef.current.width || 
         displayHeight !== lastDimensionsRef.current.height)) {
      
      // Set canvas size ke ukuran display video
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      // JANGAN set style width/height di sini, biarkan CSS yang mengatur
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      
      lastDimensionsRef.current = { width: displayWidth, height: displayHeight };
      
      console.log('📏 Canvas size updated:', { 
        display: `${displayWidth}x${displayHeight}`,
        videoNative: `${video.videoWidth}x${video.videoHeight}`
      });
      
      return true;
    }
    return false;
  }, [videoRef]);

  // Fungsi untuk menggambar pose SAJA (TANPA gambar video)
  const drawPose = useCallback((ctx, video, poseData) => {
    if (!ctx || !video || !poseData || !poseData.keypoints) return;

    const canvas = ctx.canvas;
    
    // ⛔️ JANGAN gambar video di sini! HANYA gambar skeleton
    // Bersihkan canvas dengan transparan
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Hitung scaling factor jika video asli dan display size berbeda
    const videoNativeWidth = video.videoWidth;
    const videoNativeHeight = video.videoHeight;
    const displayWidth = video.clientWidth || canvas.width;
    const displayHeight = video.clientHeight || canvas.height;
    
    const scaleX = displayWidth / videoNativeWidth;
    const scaleY = displayHeight / videoNativeHeight;
    
    // Gambar skeleton
    if (showSkeleton) {
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
        ['right_knee', 'right_ankle'],
      ];

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4; // Lebih tebal agar jelas
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.8;

      connections.forEach(([start, end]) => {
        const startPoint = poseData.keypoints[start];
        const endPoint = poseData.keypoints[end];

        if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
          // Scale coordinates from native video size to display size
          // DAN mirror untuk kamera depan
          const startX = canvas.width - (startPoint.x * scaleX);
          const startY = startPoint.y * scaleY;
          const endX = canvas.width - (endPoint.x * scaleX);
          const endY = endPoint.y * scaleY;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      });
      
      ctx.globalAlpha = 1.0;
    }

    // Gambar keypoints
    if (showPoints) {
      Object.entries(poseData.keypoints).forEach(([name, point]) => {
        if (point.score > 0.3) {
          // Scale coordinates
          const x = canvas.width - (point.x * scaleX);
          const y = point.y * scaleY;

          // Outer circle
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#ff4444';
          ctx.fill();
          
          // Inner circle
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Label untuk debugging
          if (showPoints === 'detailed' && name.includes('shoulder') || name.includes('hip')) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(name.replace('_', ' '), x + 15, y - 15);
            ctx.shadowBlur = 0;
          }
        }
      });
    }
    
    // Debug: gambar border canvas untuk melihat ukuran
    if (process.env.NODE_ENV === 'development') {
      ctx.strokeStyle = '#ff9900';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Tampilkan ukuran di corner
      ctx.fillStyle = '#ff9900';
      ctx.font = '12px Arial';
      ctx.fillText(`${canvas.width}x${canvas.height}`, 10, 20);
    }
  }, [showSkeleton, showPoints]);

  // Render loop
  useEffect(() => {
    if (!isDetecting || !videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      // Update ukuran canvas jika diperlukan
      updateCanvasSize();
      
      // Gambar pose jika ada
      if (pose) {
        drawPose(ctx, video, pose);
        lastPoseRef.current = pose;
      } else if (lastPoseRef.current) {
        // Smoothing: gunakan pose terakhir jika tidak ada deteksi baru
        drawPose(ctx, video, lastPoseRef.current);
      }
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    // Mulai render loop
    animationRef.current = requestAnimationFrame(render);
    
    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isDetecting, pose, videoRef, drawPose, updateCanvasSize]);

  // Update ukuran saat video siap
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    const handleLoadedData = () => {
      setTimeout(() => {
        updateCanvasSize();
      }, 100);
    };
    
    video.addEventListener('loadeddata', handleLoadedData);
    
    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoRef, updateCanvasSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%', // Isi penuh container
        height: '100%',
        pointerEvents: 'none',
        // ⚠️ JANGAN pakai transform: scaleX(-1) di sini!
        // Mirror sudah di-handle di drawPose()
      }}
    />
  );
};

export default PoseOverlay2D;