export const processImage = async (file, options = {}) => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Draw and process image
        ctx.drawImage(img, 0, 0, width, height);

        // Apply image enhancements if needed
        if (options.enhance) {
          await enhanceImage(ctx, canvas);
        }

        // Convert to desired format
        const processedUrl = canvas.toDataURL(`image/${format}`, quality);

        resolve({
          url: processedUrl,
          width,
          height,
          format,
          size: processedUrl.length * 0.75, // Approximate size in bytes
          originalSize: file.size
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const enhanceImage = async (ctx, canvas) => {
  try {
    // Simple image enhancement (contrast and brightness)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Adjust contrast and brightness
    const contrast = 1.2;
    const brightness = 10;
    
    for (let i = 0; i < data.length; i += 4) {
      // Brightness
      data[i] = Math.min(255, data[i] + brightness);
      data[i + 1] = Math.min(255, data[i + 1] + brightness);
      data[i + 2] = Math.min(255, data[i + 2] + brightness);
      
      // Contrast
      data[i] = ((data[i] / 255 - 0.5) * contrast + 0.5) * 255;
      data[i + 1] = ((data[i + 1] / 255 - 0.5) * contrast + 0.5) * 255;
      data[i + 2] = ((data[i + 2] / 255 - 0.5) * contrast + 0.5) * 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.warn('Image enhancement failed:', error);
  }
};

export const createImageThumbnail = async (imageUrl, size = 200) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate thumbnail dimensions
      const ratio = Math.min(size / img.width, size / img.height);
      const width = Math.floor(img.width * ratio);
      const height = Math.floor(img.height * ratio);
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = imageUrl;
  });
};