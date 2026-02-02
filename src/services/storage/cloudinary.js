// src/services/storage/cloudinary.js - PERBAIKI
export class CloudinaryService {
  static async uploadImage(file, folder = 'stylo-wardrobe') {
    try {
      console.log('=== CLOUDINARY UPLOAD START ===');
      
      // 1. Get config
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      console.log('Config:', { cloudName, uploadPreset });
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration missing in .env file');
      }
      
      // 2. Buat FormData - HANYA parameter yang diizinkan untuk unsigned upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset); // WAJIB
      
      // Parameter opsional yang diizinkan:
      if (folder) {
        formData.append('folder', folder);
      }
      
      // 🚫 JANGAN tambah parameter "transformation" untuk unsigned upload!
      // formData.append('transformation', 'f_auto,q_auto'); // ← HAPUS BARIS INI
      
      console.log('FormData parameters:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
      
      // 3. Upload ke Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log('Uploading to:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      
      // 4. Handle response
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error:', errorData);
        throw new Error(`Cloudinary: ${errorData.error?.message || 'Upload failed'}`);
      }
      
      const data = await response.json();
      console.log('✅ Cloudinary success!');
      
      // 5. Return data dengan URL yang sudah di-transform
      return {
        url: data.secure_url, // URL asli
        transformedUrl: this.applyTransformations(data.secure_url), // Dengan transformasi
        thumbUrl: this.createThumbnailUrl(data.secure_url), // Thumbnail
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes
      };
      
    } catch (error) {
      console.error('❌ Cloudinary error:', error);
      throw error;
    }
  }
  
  // Helper untuk apply transformations SETELAH upload
  static applyTransformations(originalUrl) {
    // Tambah transformasi di URL (bukan di parameter upload)
    // f_auto = format otomatis, q_auto = quality otomatis
    return originalUrl.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  
  // Helper untuk buat thumbnail URL
  static createThumbnailUrl(originalUrl) {
    // w_300,h_300,c_fill = crop dan resize ke 300x300
    return originalUrl.replace('/upload/', '/upload/w_300,h_300,c_fill/');
  }
  
  // Helper untuk buat medium size URL
  static createMediumUrl(originalUrl) {
    return originalUrl.replace('/upload/', '/upload/w_600,h_600,c_fill/');
  }
}