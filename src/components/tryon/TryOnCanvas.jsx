import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image as ThreeImage } from '@react-three/drei';
import * as THREE from 'three';

export default function TryOnCanvas({ 
  pose, 
  clothingItems = [], 
  videoDimensions,
  isDetecting 
}) {
  const { camera, size } = useThree();
  const [textures, setTextures] = useState({});
  const clothingRefs = useRef({});

  // Load textures for clothing items
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const newTextures = {};

    clothingItems.forEach(item => {
      if (!textures[item.id]) {
        loader.load(item.imageUrl, (texture) => {
          newTextures[item.id] = texture;
          setTextures(prev => ({ ...prev, [item.id]: texture }));
        });
      }
    });

    return () => {
      Object.values(newTextures).forEach(texture => texture?.dispose());
    };
  }, [clothingItems]);

  // Calculate clothing positions based on pose
  const getClothingPosition = (clothingType, pose) => {
    if (!pose || !pose.keypoints) return null;

    const keypoints = pose.keypoints;
    const screenToWorld = (x, y) => {
      const xPercent = x / videoDimensions.width;
      const yPercent = y / videoDimensions.height;
      return {
        x: (xPercent - 0.5) * 10,
        y: -(yPercent - 0.5) * 10,
      };
    };

    switch (clothingType) {
      case 'top':
        const leftShoulder = keypoints.left_shoulder;
        const rightShoulder = keypoints.right_shoulder;
        if (leftShoulder && rightShoulder) {
          const centerX = (leftShoulder.x + rightShoulder.x) / 2;
          const centerY = (leftShoulder.y + rightShoulder.y) / 2;
          const width = Math.abs(leftShoulder.x - rightShoulder.x) * 1.5;
          const height = width * 1.2;
          
          return {
            position: screenToWorld(centerX, centerY - height * 0.2),
            size: { width: width * 0.01, height: height * 0.01 }
          };
        }
        break;

      case 'bottom':
        const leftHip = keypoints.left_hip;
        const rightHip = keypoints.right_hip;
        if (leftHip && rightHip) {
          const centerX = (leftHip.x + rightHip.x) / 2;
          const centerY = (leftHip.y + rightHip.y) / 2;
          const width = Math.abs(leftHip.x - rightHip.x) * 1.8;
          const height = width * 1.5;
          
          return {
            position: screenToWorld(centerX, centerY + height * 0.1),
            size: { width: width * 0.01, height: height * 0.01 }
          };
        }
        break;

      case 'dress':
        const nose = keypoints.nose;
        const leftAnkle = keypoints.left_ankle;
        if (nose && leftAnkle) {
          const centerX = nose.x;
          const centerY = (nose.y + leftAnkle.y) / 2;
          const width = Math.abs(keypoints.left_shoulder?.x - keypoints.right_shoulder?.x) * 1.5 || 200;
          const height = Math.abs(nose.y - leftAnkle.y) * 0.8;
          
          return {
            position: screenToWorld(centerX, centerY),
            size: { width: width * 0.01, height: height * 0.01 }
          };
        }
        break;
    }

    return null;
  };

  // Animate clothing items
  useFrame(() => {
    if (!isDetecting || !pose) return;

    clothingItems.forEach(item => {
      const ref = clothingRefs.current[item.id];
      if (ref) {
        const pos = getClothingPosition(item.type, pose);
        if (pos) {
          // Smooth movement
          ref.position.x += (pos.position.x - ref.position.x) * 0.1;
          ref.position.y += (pos.position.y - ref.position.y) * 0.1;
          
          // Update scale
          ref.scale.x = pos.size.width;
          ref.scale.y = pos.size.height;
        }
      }
    });
  });

  return (
    <>
      {clothingItems.map(item => {
        const texture = textures[item.id];
        const initialPos = getClothingPosition(item.type, pose) || {
          position: { x: 0, y: 0 },
          size: { width: 2, height: 3 }
        };

        return (
          <mesh
            key={item.id}
            ref={el => clothingRefs.current[item.id] = el}
            position={[initialPos.position.x, initialPos.position.y, 0.1]}
            scale={[initialPos.size.width, initialPos.size.height, 1]}
          >
            <planeGeometry />
            <meshBasicMaterial 
              map={texture}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
              depthTest={false}
            />
          </mesh>
        );
      })}
      
      {/* Body outline for debugging */}
      {pose && process.env.NODE_ENV === 'development' && (
        <BodyOutline pose={pose} videoDimensions={videoDimensions} />
      )}
    </>
  );
}

function BodyOutline({ pose, videoDimensions }) {
  const points = useRef([]);
  const lineRef = useRef();

  useEffect(() => {
    if (!pose || !pose.keypoints) return;

    const newPoints = [];
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle'],
    ];

    connections.forEach(([start, end]) => {
      const startPoint = pose.keypoints[start];
      const endPoint = pose.keypoints[end];
      
      if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
        const x1 = (startPoint.x / videoDimensions.width - 0.5) * 10;
        const y1 = -(startPoint.y / videoDimensions.height - 0.5) * 10;
        const x2 = (endPoint.x / videoDimensions.width - 0.5) * 10;
        const y2 = -(endPoint.y / videoDimensions.height - 0.5) * 10;
        
        newPoints.push(new THREE.Vector3(x1, y1, 0.2));
        newPoints.push(new THREE.Vector3(x2, y2, 0.2));
      }
    });

    points.current = newPoints;
    if (lineRef.current) {
      lineRef.current.geometry.setFromPoints(points.current);
    }
  }, [pose, videoDimensions]);

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#00ff00" linewidth={2} />
    </lineSegments>
  );
}