// Utility functions untuk pose detection dan AR

export const poseUtils = {
  // Validasi pose data
  isValidPose(pose) {
    if (!pose || !pose.keypoints) return false;
    
    const requiredKeypoints = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'];
    const hasRequired = requiredKeypoints.every(key => 
      pose.keypoints[key] && pose.keypoints[key].score > 0.3
    );
    
    return hasRequired && pose.score > 0.4;
  },

  // Hitung body measurements
  calculateBodyMeasurements(keypoints) {
    const measurements = {
      shoulderWidth: 0,
      torsoHeight: 0,
      hipWidth: 0,
      armLength: 0,
      legLength: 0
    };

    // Shoulder width
    if (keypoints.left_shoulder && keypoints.right_shoulder) {
      measurements.shoulderWidth = Math.sqrt(
        Math.pow(keypoints.right_shoulder.x - keypoints.left_shoulder.x, 2) +
        Math.pow(keypoints.right_shoulder.y - keypoints.left_shoulder.y, 2)
      );
    }

    // Torso height (shoulder to hip)
    if (keypoints.left_shoulder && keypoints.left_hip) {
      measurements.torsoHeight = Math.abs(
        keypoints.left_hip.y - keypoints.left_shoulder.y
      );
    }

    // Hip width
    if (keypoints.left_hip && keypoints.right_hip) {
      measurements.hipWidth = Math.abs(
        keypoints.right_hip.x - keypoints.left_hip.x
      );
    }

    // Arm length (shoulder to wrist)
    if (keypoints.left_shoulder && keypoints.left_wrist) {
      measurements.armLength = Math.sqrt(
        Math.pow(keypoints.left_wrist.x - keypoints.left_shoulder.x, 2) +
        Math.pow(keypoints.left_wrist.y - keypoints.left_shoulder.y, 2)
      );
    }

    return measurements;
  },

  // Estimate clothing position
  estimateClothingPosition(keypoints, clothingType, imageAspectRatio = 1.5) {
    const position = {
      x: 0,
      y: 0,
      width: 1,
      height: imageAspectRatio,
      rotation: 0
    };

    switch (clothingType) {
      case 'top':
        if (keypoints.left_shoulder && keypoints.right_shoulder) {
          const shoulderWidth = Math.abs(
            keypoints.right_shoulder.x - keypoints.left_shoulder.x
          );
          const centerX = (keypoints.left_shoulder.x + keypoints.right_shoulder.x) / 2;
          const centerY = (keypoints.left_shoulder.y + keypoints.right_shoulder.y) / 2;
          
          // Calculate rotation from shoulder line
          const dy = keypoints.right_shoulder.y - keypoints.left_shoulder.y;
          const dx = keypoints.right_shoulder.x - keypoints.left_shoulder.x;
          const rotation = Math.atan2(dy, dx);
          
          position.x = centerX;
          position.y = centerY;
          position.width = shoulderWidth * 1.2; // Add padding
          position.height = shoulderWidth * imageAspectRatio;
          position.rotation = rotation;
        }
        break;

      case 'bottom':
        if (keypoints.left_hip && keypoints.right_hip) {
          const hipWidth = Math.abs(
            keypoints.right_hip.x - keypoints.left_hip.x
          );
          const centerX = (keypoints.left_hip.x + keypoints.right_hip.x) / 2;
          const centerY = keypoints.left_hip.y;
          
          position.x = centerX;
          position.y = centerY;
          position.width = hipWidth * 1.3;
          position.height = hipWidth * imageAspectRatio;
        }
        break;

      case 'dress':
        if (keypoints.left_shoulder && keypoints.left_hip) {
          const shoulderWidth = Math.abs(
            keypoints.right_shoulder?.x - keypoints.left_shoulder.x || 100
          );
          const torsoHeight = Math.abs(
            keypoints.left_hip.y - keypoints.left_shoulder.y
          );
          const centerX = keypoints.left_shoulder.x;
          const centerY = (keypoints.left_shoulder.y + keypoints.left_hip.y) / 2;
          
          position.x = centerX;
          position.y = centerY;
          position.width = shoulderWidth * 1.1;
          position.height = torsoHeight * 1.8;
        }
        break;
    }

    return position;
  },

  // Convert pixel coordinates to Three.js coordinates
  pixelToThree(x, y, videoWidth, videoHeight) {
    return {
      x: (x / videoWidth - 0.5) * 10,
      y: -(y / videoHeight - 0.5) * 10
    };
  },

  // Smooth pose transitions
  smoothPose(currentPose, previousPose, smoothingFactor = 0.3) {
    if (!previousPose || !currentPose) return currentPose;
    
    const smoothedKeypoints = {};
    
    Object.keys(currentPose.keypoints).forEach(key => {
      const current = currentPose.keypoints[key];
      const previous = previousPose.keypoints[key];
      
      if (previous) {
        smoothedKeypoints[key] = {
          x: previous.x + (current.x - previous.x) * smoothingFactor,
          y: previous.y + (current.y - previous.y) * smoothingFactor,
          score: current.score
        };
      } else {
        smoothedKeypoints[key] = current;
      }
    });
    
    return {
      ...currentPose,
      keypoints: smoothedKeypoints
    };
  }
};