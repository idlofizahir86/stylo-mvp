// src/services/utils/imageProcessor.js
export class ImageProcessor {
  static async compressImage(file, maxSizeKB = 500) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with quality adjustment
          let quality = 0.9;
          const compress = () => {
            canvas.toBlob((blob) => {
              if (blob.size / 1024 > maxSizeKB && quality > 0.1) {
                quality -= 0.1;
                compress();
              } else {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              }
            }, 'image/jpeg', quality);
          };
          
          compress();
        };
        
        img.onerror = reject;
      };
      
      reader.onerror = reject;
    });
  }

  static async getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  static async validateImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image (JPEG, PNG, WebP)');
    }
    
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }
    
    return true;
  }

  static async captureFromCamera() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          resolve(file);
        } else {
          reject(new Error('No image selected'));
        }
      };
      
      input.click();
    });
  }
}