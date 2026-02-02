// src/pages/Wardrobe.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid3x3, List, Sparkles } from 'lucide-react';
import WardrobeGrid from '../components/wardrobe/WardrobeGrid';
import UploadModal from '../components/wardrobe/UploadModal';
import WardrobeCTA from '../components/wardrobe/WardrobeCTA'; // Adjust path as needed
import DressMeIcon from '../assets/icons/wardrobe_cta/dress_me.svg?react';
import CanvasIcon from '../assets/icons/wardrobe_cta/canvas.svg?react';
import MoodboardIcon from '../assets/icons/wardrobe_cta/moodboard.svg?react';
import { wardrobeService } from '../services/firebase/firestore';
import { CloudinaryService } from '../services/storage/cloudinary';
import { BackgroundRemover } from '../services/ai/backgroundRemover';
import { ImageProcessor } from '../services/utils/imageProcessor';
import toast from 'react-hot-toast';

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const categories = ['all', 'tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'dresses'];

  useEffect(() => {
    loadWardrobeItems();
  }, []);

  const loadWardrobeItems = async () => {
    try {
      setLoading(true);
      const fetchedItems = await wardrobeService.getItems();
      setItems(fetchedItems);
      if (fetchedItems.length > 0) {
        toast.success(`Loaded ${fetchedItems.length} items`);
      }
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      // Fallback ke localStorage
      const localItems = JSON.parse(localStorage.getItem('stylo-wardrobe') || '[]');
      setItems(localItems);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (imageFile, itemData) => {
    try {
      // Step 1: Compress image
      toast.loading('Compressing image...');
      const compressedFile = await ImageProcessor.compressImage(imageFile, 800);
      
      // Step 2: Remove background (opsional)
      let processedFile = compressedFile;
      let hasBackgroundRemoved = false;
      
      // Cek jika ada API key untuk background removal
      if (import.meta.env.VITE_REMOVE_BG_API_KEY || import.meta.env.VITE_CLIPDROP_API_KEY) {
        try {
          toast.loading('Removing background...');
          const processedUrl = await BackgroundRemover.removeBackground(compressedFile);
          
          // Convert URL back to File
          const response = await fetch(processedUrl);
          const blob = await response.blob();
          processedFile = new File([blob], 'processed-' + compressedFile.name, { 
            type: 'image/png' 
          });
          hasBackgroundRemoved = true;
          console.log('✅ Background removed');
        } catch (bgError) {
          console.warn('Background removal failed:', bgError);
        }
      }
      
      // Step 3: Upload to Cloudinary
      toast.loading('Uploading to Cloudinary...');
      const cloudinaryResult = await CloudinaryService.uploadImage(
        processedFile, 
        `stylo-wardrobe/${itemData.category}`
      );
      
      console.log('☁️ Cloudinary result:', cloudinaryResult);
      
      // Step 4: Prepare data for Firestore
      const firestoreData = {
        name: itemData.name.trim(),
        category: itemData.category,
        color: itemData.color || '',
        
        // Gunakan URL yang sudah di-transform
        imageUrl: cloudinaryResult.transformedUrl || cloudinaryResult.url,
        thumbUrl: cloudinaryResult.thumbUrl,
        mediumUrl: CloudinaryService.createMediumUrl(cloudinaryResult.url),
        
        // Metadata
        cloudinaryPublicId: cloudinaryResult.publicId,
        imageFormat: cloudinaryResult.format,
        imageWidth: cloudinaryResult.width,
        imageHeight: cloudinaryResult.height,
        imageSize: cloudinaryResult.bytes,
        
        // Additional data
        season: itemData.season || '',
        brand: itemData.brand || '',
        price: parseFloat(itemData.price) || 0,
        notes: itemData.notes || '',
        tags: itemData.tags || [],
        material: itemData.material || '',
        size: itemData.size || '',
        condition: itemData.condition || 'new',
        
        // Flags
        hasBackgroundRemoved,
        storageProvider: 'cloudinary',
        favorite: false,
        wornCount: 0,
        type: itemData.category === 'shoes' ? 'shoes' : 
              itemData.category === 'accessories' ? 'accessory' : 'clothing'
      };
      
      // Step 5: Save to Firestore
      toast.loading('Saving to wardrobe...');
      const savedItem = await wardrobeService.addItem(firestoreData);
      
      // Step 6: Update UI
      setItems(prev => [savedItem, ...prev]);
      
      // Step 7: Backup to localStorage
      const localItems = JSON.parse(localStorage.getItem('stylo-wardrobe') || '[]');
      localItems.unshift(savedItem);
      localStorage.setItem('stylo-wardrobe', JSON.stringify(localItems));
      
      // Success!
      toast.success(`${itemData.name} added successfully! 🎉`);
      setShowUploadModal(false);
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.dismiss();
      
      // Error handling yang lebih spesifik
      if (error.message.includes('400')) {
        toast.error('Cloudinary upload failed. Please check your upload preset settings.');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(`Upload failed: ${error.message}`);
      }
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeFilter === 'all' || 
      item.category?.toLowerCase() === activeFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (item) => {
    toast.success(`Selected ${item.name}`);
  };

  const handleAddNew = () => {
    setShowUploadModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Wardrobe</h1>
          <div className="animate-pulse bg-gray-200 w-10 h-10 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-2xl mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">My Style</h1>
      <div className="flex gap-3 mb-6">
        <WardrobeCTA Icon={DressMeIcon} Label="Dress Me" onClick={() => {}} />
        <WardrobeCTA Icon={CanvasIcon} Label="Canvas" onClick={() => {}} />
        <WardrobeCTA Icon={MoodboardIcon} Label="Moodboard" onClick={() => {}} />
      </div>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wardrobe</h1>
            <p className="text-gray-600">{items.length} items in your collection</p>
          </div>
          {/* <button 
            onClick={handleAddNew}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus size={20} />
          </button> */}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your wardrobe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        
      </div>

      {/* Wardrobe Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try a different search term' : 'Add your first item to get started'}
          </p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            Add First Item
          </button>
        </div>
      ) : (
        <WardrobeGrid items={filteredItems} onItemClick={handleItemClick} onItemAdd={handleAddNew} />
      )}


      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}