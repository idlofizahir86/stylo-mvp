// src/services/ai/backgroundRemover.js
import toast from 'react-hot-toast';

const REMOVE_BG_API_KEY = import.meta.env.VITE_REMOVE_BG_API_KEY;
const CLIPDROP_API_KEY = import.meta.env.VITE_CLIPDROP_API_KEY;

export class BackgroundRemover {
  static async removeWithRemoveBG(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image_file', imageFile);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Remove.bg API error: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Remove.bg failed:', error);
      throw error;
    }
  }

  static async removeWithClipDrop(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image_file', imageFile);

      const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
        method: 'POST',
        headers: {
          'x-api-key': CLIPDROP_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ClipDrop API error: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('ClipDrop failed:', error);
      throw error;
    }
  }

  static async removeBackground(imageFile, provider = 'removebg') {
    try {
      let result;
      
      if (provider === 'removebg' && REMOVE_BG_API_KEY) {
        result = await this.removeWithRemoveBG(imageFile);
      } else if (provider === 'clipdrop' && CLIPDROP_API_KEY) {
        result = await this.removeWithClipDrop(imageFile);
      } else {
        throw new Error('No background removal API configured');
      }

      toast.success('Background removed successfully!');
      return result;
    } catch (error) {
      console.error('Background removal failed:', error);
      
      // Fallback: Return original image
      toast.error('Background removal failed, using original image');
      return URL.createObjectURL(imageFile);
    }
  }

  static async removeBackgroundFromUrl(imageUrl, provider = 'removebg') {
    try {
      // Fetch image from URL
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      
      return await this.removeBackground(file, provider);
    } catch (error) {
      console.error('Failed to process URL:', error);
      throw error;
    }
  }
}