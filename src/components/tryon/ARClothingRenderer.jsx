import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image as ThreeImage } from '@react-three/drei';
import * as THREE from 'three';

// Komponen baru khusus untuk visualisasi 3D keypoints
function Keypoints3DVisualizer({ pose, videoDimensions }) {
  const { scene } = useThree();
  const pointsRef = useRef([]);
  const linesRef = useRef([]);

  // Create sphere geometry and material sekali saja
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.05, 8, 8), []);
  const sphereMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00ff88',
    transparent: true,
    opacity: 0.8 
  }), []);

  // Create line material
  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ 
    color: '#ff4444',
    linewidth: 2 
  }), []);

  useEffect(() => {
    if (!pose || !pose.keypoints || !videoDimensions) {
      // Clear semua keypoints
      pointsRef.current.forEach(point => scene.remove(point));
      linesRef.current.forEach(line => scene.remove(line));
      pointsRef.current = [];
      linesRef.current = [];
      return;
    }

    const keypointColors = {
      'nose': '#ff0000',
      'left_eye': '#00ff00',
      'right_eye': '#00ff00',
      'left_ear': '#ff9900',
      'right_ear': '#ff9900',
      'left_shoulder': '#0099ff',
      'right_shoulder': '#0099ff',
      'left_elbow': '#ff00ff',
      'right_elbow': '#ff00ff',
      'left_wrist': '#ffff00',
      'right_wrist': '#ffff00',
      'left_hip': '#00ffff',
      'right_hip': '#00ffff',
      'left_knee': '#ff6600',
      'right_knee': '#ff6600',
      'left_ankle': '#9900ff',
      'right_ankle': '#9900ff'
    };

    // Hapus keypoints lama
    pointsRef.current.forEach(point => scene.remove(point));
    linesRef.current.forEach(line => scene.remove(line));
    pointsRef.current = [];
    linesRef.current = [];

    // Valid keypoints
    const validKeypoints = Object.entries(pose.keypoints).filter(([name, point]) => {
      return point && point.score > 0.3;
    });

    // Buat spheres untuk setiap keypoint
    validKeypoints.forEach(([name, point]) => {
      // Convert video coordinates to 3D space
      const x = (point.x / videoDimensions.width - 0.5) * 12;
      const y = -(point.y / videoDimensions.height - 0.5) * 12;
      const z = point.z ? point.z * 0.01 : 0.5; // Gunakan z jika ada

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
      sphere.material.color.set(keypointColors[name] || '#ffffff');
      sphere.position.set(x, y, z);
      sphere.scale.setScalar(1.5); // Lebih besar agar jelas terlihat
      
      scene.add(sphere);
      pointsRef.current.push(sphere);

      // Tambah label text (opsional)
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 32;
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 14px Arial';
      context.fillStyle = '#ffffff';
      context.fillText(name, 10, 22);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x + 0.15, y + 0.15, z);
      sprite.scale.set(0.5, 0.125, 1);
      
      scene.add(sprite);
      pointsRef.current.push(sprite);
    });

    // Buat garis skeleton
    const connections = [
      // Wajah
      ['left_ear', 'left_eye'],
      ['left_eye', 'nose'],
      ['nose', 'right_eye'],
      ['right_eye', 'right_ear'],
      
      // Torso
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      
      // Lengan kiri
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      
      // Lengan kanan
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      
      // Kaki kiri
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      
      // Kaki kanan
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle'],
      
      // Cross torso (membuat bentuk X)
      ['left_shoulder', 'right_hip'],
      ['right_shoulder', 'left_hip'],
    ];

    connections.forEach(([startName, endName]) => {
      const startPoint = pose.keypoints[startName];
      const endPoint = pose.keypoints[endName];
      
      if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
        const x1 = (startPoint.x / videoDimensions.width - 0.5) * 12;
        const y1 = -(startPoint.y / videoDimensions.height - 0.5) * 12;
        const z1 = startPoint.z ? startPoint.z * 0.01 : 0.5;
        
        const x2 = (endPoint.x / videoDimensions.width - 0.5) * 12;
        const y2 = -(endPoint.y / videoDimensions.height - 0.5) * 12;
        const z2 = endPoint.z ? endPoint.z * 0.01 : 0.5;

        const points = [
          new THREE.Vector3(x1, y1, z1),
          new THREE.Vector3(x2, y2, z2)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        
        scene.add(line);
        linesRef.current.push(line);
      }
    });

    return () => {
      // Cleanup
      pointsRef.current.forEach(point => scene.remove(point));
      linesRef.current.forEach(line => scene.remove(line));
    };
  }, [pose, videoDimensions, scene, sphereGeometry, sphereMaterial, lineMaterial]);

  return null; // Komponen ini hanya mengubah scene
}

function ClothingItem({ 
  item, 
  pose, 
  videoDimensions,
  isDetecting,
  index 
}) {
  const meshRef = useRef();
  const textureRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0, width: 1, height: 1 });
  const [rotation, setRotation] = useState(0);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const lastUpdateRef = useRef(0);
  const smoothingFactor = 0.2;

  // Load texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(item.imageUrl, (texture) => {
      textureRef.current = texture;
      texture.flipY = false; // Important for correct orientation
      setTextureLoaded(true);
    }, undefined, (error) => {
      console.error('Failed to load texture:', error);
    });

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [item.imageUrl]);

  // Calculate clothing position based on pose
  useEffect(() => {
    if (!pose || !pose.keypoints || !videoDimensions) return;

    const calculatePosition = () => {
      const keypoints = pose.keypoints;
      let newPosition = { x: 0, y: 0, width: 1, height: 1 };
      let newRotation = 0;

      switch (item.type) {
        case 'top':
        case 'shirt':
        case 'tshirt':
        case 'blouse':
          if (keypoints.left_shoulder && keypoints.right_shoulder) {
            const left = keypoints.left_shoulder;
            const right = keypoints.right_shoulder;

            const centerX = (left.x + right.x) / 2;
            const centerY = (left.y + right.y) / 2 - 50; // offset ke leher (naikkan 50px)

            const shoulderWidth = Math.abs(right.x - left.x);

            const x = (centerX / videoDimensions.width - 0.5) * 12;
            const y = -(centerY / videoDimensions.height - 0.5) * 12;

            const aspect = textureRef.current 
              ? textureRef.current.image.height / textureRef.current.image.width 
              : 1.4;

            const width = (shoulderWidth / videoDimensions.width) * 15; // lebih lebar
            const height = width * aspect;

            const dx = right.x - left.x;
            const dy = right.y - left.y;
            newRotation = Math.atan2(dy, dx);

            newPosition = { x, y, width, height };
          }
          break;

        case 'bottom':
        case 'pants':
        case 'jeans':
        case 'skirt':
          if (keypoints.left_hip && keypoints.right_hip) {
            const left = keypoints.left_hip;
            const right = keypoints.right_hip;

            const centerX = (left.x + right.x) / 2;
            const centerY = (left.y + right.y) / 2 + 20; // sedikit turun

            const hipWidth = Math.abs(right.x - left.x);

            const x = (centerX / videoDimensions.width - 0.5) * 12;
            const y = -(centerY / videoDimensions.height - 0.5) * 12;

            const aspect = textureRef.current 
              ? textureRef.current.image.height / textureRef.current.image.width 
              : 1.8;

            const width = (hipWidth / videoDimensions.width) * 14;
            const height = width * aspect;

            newPosition = { x, y, width, height };
          }
          break;

        case 'dress':
          if (keypoints.left_shoulder && keypoints.right_shoulder && keypoints.left_hip) {
            const shoulderCenterX = (keypoints.left_shoulder.x + keypoints.right_shoulder.x) / 2;
            const shoulderY = (keypoints.left_shoulder.y + keypoints.right_shoulder.y) / 2;
            const hipY = keypoints.left_hip.y;

            const centerX = shoulderCenterX;
            const centerY = shoulderY - 60; // offset leher lebih tinggi

            const heightPixels = hipY - shoulderY + 100; // extend ke bawah

            const x = (centerX / videoDimensions.width - 0.5) * 12;
            const y = -(centerY / videoDimensions.height - 0.5) * 12;

            const shoulderWidth = Math.abs(keypoints.right_shoulder.x - keypoints.left_shoulder.x);
            const width = (shoulderWidth / videoDimensions.width) * 16;

            const height = (heightPixels / videoDimensions.height) * 12;

            newPosition = { x, y, width, height };
          }
          break;

        default:
          newPosition = { x: 0, y: -2 + (index * 1.5), width: 3, height: 4 };
      }

      return { position: newPosition, rotation: newRotation };
    };

    const now = Date.now();
    if (now - lastUpdateRef.current > 100) { // Update every 100ms
      const { position: newPos, rotation: newRot } = calculatePosition();
      
      // Smooth position changes
      setPosition(prev => ({
        x: prev.x + (newPos.x - prev.x) * smoothingFactor,
        y: prev.y + (newPos.y - prev.y) * smoothingFactor,
        width: prev.width + (newPos.width - prev.width) * smoothingFactor,
        height: prev.height + (newPos.height - prev.height) * smoothingFactor,
      }));
      
      setRotation(prev => prev + (newRot - prev) * smoothingFactor);
      lastUpdateRef.current = now;
    }
  }, [pose, videoDimensions, item.type, index]);

  // Animation frame for smooth movement
  useFrame((state) => {
    if (meshRef.current && isDetecting) {
      // Add subtle floating animation when pose is detected
      if (pose) {
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime + index) * 0.002;
      }
    }
  });

  if (!textureLoaded) return null;

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, 0.1 + index * 0.01]}
      scale={[position.width, position.height, 1]}
      rotation={[0, 0, rotation]}
    >
      <planeGeometry />
      <meshBasicMaterial 
        map={textureRef.current}
        transparent
        opacity={0.95}
        alphaTest={0.5}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function ARClothingRenderer({ 
  pose, 
  clothingItems = [], 
  videoDimensions,
  isDetecting,
  showDebug = false 
}) {
  const { gl } = useThree();

  // Debug info
  useEffect(() => {
    if (pose && process.env.NODE_ENV === 'development') {
      console.log('🎯 Pose detected:', {
        keypointsCount: pose.keypointsCount,
        score: pose.score,
        model: pose.model,
        hasClothingItems: clothingItems.length
      });
      
      // Log semua keypoints yang terdeteksi
      Object.entries(pose.keypoints).forEach(([name, point]) => {
        if (point.score > 0.3) {
          console.log(`  ${name}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) - score: ${point.score.toFixed(2)}`);
        }
      });
    }
  }, [pose, clothingItems]);

  // Clear depth buffer to ensure clothing renders on top
  useEffect(() => {
    if (isDetecting) {
      gl.autoClearDepth = false;
      gl.clearDepth(0);
    }

    return () => {
      gl.autoClearDepth = true;
    };
  }, [gl, isDetecting]);

  return (
    <>
      {/* 3D Keypoints Visualizer - Selalu tampilkan jika pose ada */}
      {pose && (
        <Keypoints3DVisualizer 
          pose={pose} 
          videoDimensions={videoDimensions} 
        />
      )}
      
      {/* Info overlay untuk debugging */}
      {pose && showDebug && (
        <mesh position={[0, 2, 1]}>
          <textGeometry args={[
            `Keypoints: ${pose.keypointsCount}\nScore: ${pose.score?.toFixed(2)}\nModel: ${pose.model}`,
            { size: 0.1, height: 0.02 }
          ]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      
      {/* Render clothing items */}
      {clothingItems.map((item, index) => (
        <ClothingItem
          key={`${item.id}-${index}`}
          item={item}
          pose={pose}
          videoDimensions={videoDimensions}
          isDetecting={isDetecting}
          index={index}
        />
      ))}
      
      {/* Visual guides for positioning */}
      {isDetecting && !pose && (
        <group>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[8, 12]} />
            <meshBasicMaterial 
              color="#333333" 
              transparent 
              opacity={0.1} 
              wireframe
            />
          </mesh>
          <mesh position={[0, 0, 0.5]}>
            <textGeometry args={['Waiting for pose detection...', { size: 0.2, height: 0.05 }]} />
            <meshBasicMaterial color="#ff9900" />
          </mesh>
        </group>
      )}
    </>
  );
}