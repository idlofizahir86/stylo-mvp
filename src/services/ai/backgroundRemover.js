// Multiple background removal options
export const removeBackground = async (imageSrc) => {
  console.log('Starting background removal...');
  
  // Try different methods in order
  const methods = [
    tryRemoveBgAPI,    // Primary: Remove.bg API
    tryClipdropAPI,    // Alternative: Clipdrop API
    tryBrowserAI,      // Fallback: Browser-based AI
    simulateRemoval    // Last resort: Simple simulation
  ];

  for (const method of methods) {
    try {
      console.log(`Trying method: ${method.name}`);
      const result = await method(imageSrc);
      if (result) {
        console.log('✅ Background removal successful');
        return result;
      }
    } catch (error) {
      console.warn(`Method ${method.name} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All background removal methods failed');
};

// Method 1: Remove.bg API (Primary)
const tryRemoveBgAPI = async (imageSrc) => {
  const API_KEY = import.meta.env.VITE_REMOVE_BG_API_KEY;
  
  if (!API_KEY) {
    console.warn('Remove.bg API key not found in environment variables');
    return null;
  }

  try {
    // Convert base64 to blob
    const base64Response = await fetch(imageSrc);
    const blob = await base64Response.blob();
    
    const formData = new FormData();
    formData.append('image_file', blob);
    formData.append('size', 'auto');
    formData.append('format', 'png');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Remove.bg API error ${response.status}: ${errorText}`);
    }

    const resultBlob = await response.blob();
    const processedUrl = URL.createObjectURL(resultBlob);
    
    return processedUrl;
  } catch (error) {
    console.error('Remove.bg API failed:', error);
    return null;
  }
};

// Method 2: Clipdrop API (Alternative)
const tryClipdropAPI = async (imageSrc) => {
  // This requires a Clipdrop API key
  const API_KEY = import.meta.env.VITE_CLIPDROP_API_KEY;
  
  if (!API_KEY) return null;

  try {
    const base64Data = imageSrc.split(',')[1];
    const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: base64Data,
    });

    if (!response.ok) throw new Error(`Clipdrop API error: ${response.status}`);

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Clipdrop API failed:', error);
    return null;
  }
};

// Method 3: Browser-based AI using TensorFlow.js
const tryBrowserAI = async (imageSrc) => {
  try {
    // Dynamically import TensorFlow.js to reduce bundle size
    const tf = await import('@tensorflow/tfjs-core');
    await import('@tensorflow/tfjs-backend-webgl');
    const bodySegmentation = await import('@tensorflow-models/body-segmentation');
    
    await tf.setBackend('webgl');
    await tf.ready();
    
    // Load BodyPix model
    const model = await bodySegmentation.load(
      bodySegmentation.SupportedModels.BodyPix,
      { architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75 }
    );
    
    // Create image element
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageSrc;
    });
    
    // Segment person from background
    const segmentation = await model.segmentPerson(img, {
      flipHorizontal: false,
      internalResolution: 'medium',
      segmentationThreshold: 0.7,
    });
    
    // Create canvas and apply mask
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Apply mask to remove background
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const mask = segmentation.mask;
    
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 0) { // Background
        imageData.data[i * 4 + 3] = 0; // Set alpha to 0
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Cleanup
    tf.dispose(segmentation);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Browser AI segmentation failed:', error);
    return null;
  }
};

// Method 4: Simple simulation (last resort)
const simulateRemoval = async (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Improved background detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Detect and remove common background colors
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Remove white/light backgrounds
        const isLightBackground = r > 220 && g > 220 && b > 220;
        
        // Remove green screen (common in product photos)
        const isGreenScreen = g > r * 1.2 && g > b * 1.2 && g > 100;
        
        // Remove blue screen
        const isBlueScreen = b > r * 1.2 && b > g * 1.2 && b > 100;
        
        if (isLightBackground || isGreenScreen || isBlueScreen) {
          data[i + 3] = 0; // Make pixel transparent
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
  });
};

// Utility function for direct file processing
export const processImageFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const processedImage = await removeBackground(e.target.result);
        resolve(processedImage);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};