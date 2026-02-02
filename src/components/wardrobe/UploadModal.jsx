// src/components/wardrobe/UploadModal.jsx
import React, { useState, useRef } from 'react';
import { 
  Camera, Image as ImageIcon, Link as LinkIcon, Upload, 
  X, Loader2, Check, Globe, Smartphone, Folder, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadModal({ isOpen, onClose, onUploadComplete }) {
  const [activeTab, setActiveTab] = useState('camera');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [itemData, setItemData] = useState({
    name: '',
    category: '',
    color: '',
    tags: [],
    season: '',
    brand: '',
    price: '',
    notes: ''
  });
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const modalContentRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const processImageFile = (file) => {
    // Validate image
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      
      // Validate URL
      const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif))/i;
      if (!urlRegex.test(urlInput)) {
        throw new Error('Please enter a valid image URL (PNG, JPG, WebP, GIF)');
      }

      // Fetch image from URL
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error('Failed to fetch image from URL');
      
      const blob = await response.blob();
      const file = new File([blob], 'url-image.jpg', { type: blob.type });
      
      processImageFile(file);
    } catch (error) {
      toast.error(error.message || 'Failed to load image from URL');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    if (!itemData.name.trim() || !itemData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await onUploadComplete(imageFile, itemData);
      resetForm();
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setImageFile(null);
    setUrlInput('');
    setItemData({
      name: '',
      category: '',
      color: '',
      tags: [],
      season: '',
      brand: '',
      price: '',
      notes: ''
    });
    setShowAdvanced(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full h-[80vh] md:h-auto md:max-w-md md:max-h-[80vh] md:rounded-3xl animate-slide-up flex flex-col" style={{
        marginBottom: '80px'
      }}>
        {/* Header - Fixed */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Add New Item</h3>
              <p className="text-sm text-gray-600">Digitize clothing to your wardrobe</p>
            </div>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>

          {/* Upload Tabs - Only show when no image preview */}
          {!imagePreview && (
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mt-4">
              {[
                { id: 'camera', label: 'Camera', icon: Camera },
                { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                { id: 'link', label: 'Link', icon: LinkIcon },
                { id: 'file', label: 'File', icon: Folder },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  disabled={loading}
                >
                  <tab.icon size={18} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div 
          ref={modalContentRef}
          className="flex-1 overflow-y-auto px-4 py-2"
        >
          {imagePreview ? (
            // Image Preview with Form - Scrollable
            <div className="space-y-6 pb-4">
              {/* Image Preview */}
              <div className="sticky top-0 bg-white pt-2 z-10">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Required Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Item Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Denim Jacket"
                    value={itemData.name}
                    onChange={(e) => setItemData({...itemData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select 
                    value={itemData.category}
                    onChange={(e) => setItemData({...itemData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select category</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="shoes">Shoes</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="accessories">Accessories</option>
                    <option value="dresses">Dresses</option>
                    <option value="activewear">Activewear</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Blue, Black, Red"
                    value={itemData.color}
                    onChange={(e) => setItemData({...itemData, color: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Advanced Options - Collapsible */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-gray-900"
                >
                  <span className="font-medium">Additional Details</span>
                  {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {showAdvanced && (
                  <div className="space-y-4 mt-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Season
                        </label>
                        <select 
                          value={itemData.season}
                          onChange={(e) => setItemData({...itemData, season: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                        >
                          <option value="">Any</option>
                          <option value="spring">Spring</option>
                          <option value="summer">Summer</option>
                          <option value="fall">Fall</option>
                          <option value="winter">Winter</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <input
                          type="text"
                          placeholder="Brand name"
                          value={itemData.brand}
                          onChange={(e) => setItemData({...itemData, brand: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={itemData.price}
                          onChange={(e) => setItemData({...itemData, price: e.target.value})}
                          className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        placeholder="Additional notes about this item..."
                        value={itemData.notes}
                        onChange={(e) => setItemData({...itemData, notes: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Upload Interface - Scrollable if needed
            <div className="py-4">
              <div className="space-y-6">
                {activeTab === 'camera' && (
                  <div className="text-center space-y-6">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
                      <Camera size={64} className="text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-lg">Take Photo</h4>
                      <p className="text-gray-600">
                        Capture your clothing item with your camera. Make sure the item is well-lit and on a plain background for best results.
                      </p>
                    </div>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="space-y-3">
                      <button
                        onClick={handleCameraClick}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            <Camera size={20} />
                            Open Camera
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gray-500">
                        Tip: Take multiple angles for best digitization
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="text-center space-y-6">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl flex items-center justify-center">
                      <ImageIcon size={64} className="text-purple-500" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-lg">Choose from Gallery</h4>
                      <p className="text-gray-600">
                        Select an existing photo from your device gallery. Choose clear, well-lit photos for best background removal.
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="space-y-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            <ImageIcon size={20} />
                            Browse Gallery
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gray-500">
                        Supports: JPG, PNG, WebP • Max 5MB
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'file' && (
                  <div className="text-center space-y-6">
                    <div className="w-40 h-40 mx-auto bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl flex items-center justify-center">
                      <Folder size={64} className="text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-lg">Upload File</h4>
                      <p className="text-gray-600">
                        Upload an image file from your device storage. You can also drag and drop files directly.
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="space-y-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            <Upload size={20} />
                            Choose File
                          </>
                        )}
                      </button>
                      
                      {/* Drag & Drop Area */}
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-gray-400', 'bg-gray-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-gray-400', 'bg-gray-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-gray-400', 'bg-gray-50');
                          const file = e.dataTransfer.files[0];
                          if (file) processImageFile(file);
                        }}
                      >
                        <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 font-medium">Drag & drop files here</p>
                        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                      </div>
                      
                      <p className="text-sm text-gray-500">
                        Supported: JPG, PNG, WebP • Max 5MB
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'link' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl flex items-center justify-center">
                        <Globe size={64} className="text-orange-500" />
                      </div>
                      <div className="mt-6 space-y-2">
                        <h4 className="font-semibold text-gray-900 text-lg">Image URL</h4>
                        <p className="text-gray-600">
                          Paste a link to an image on the web. Make sure it's a direct image link.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-2 ml-1">
                          Example: https://website.com/your-image.png
                        </p>
                      </div>
                      
                      <button
                        onClick={handleUrlSubmit}
                        disabled={loading || !urlInput.trim()}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            <LinkIcon size={20} />
                            Load from URL
                          </>
                        )}
                      </button>
                      
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-sm text-blue-800 font-medium mb-1">URL Tips:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Must be a direct image link (ends with .jpg, .png, etc.)</li>
                          <li>• Avoid links that require login or have watermarks</li>
                          <li>• For best results, use high-quality images</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
         <div 
          className="p-4 border-t border-gray-100 bg-white flex-shrink-0"
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))'
          }}
        >
          {imagePreview ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleUpload}
                disabled={loading || !itemData.name.trim() || !itemData.category}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Check size={20} />
                    Add to Wardrobe
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Quick skip to test
                  if (activeTab === 'camera') handleCameraClick();
                  else if (activeTab === 'gallery' || activeTab === 'file') fileInputRef.current?.click();
                  else if (activeTab === 'link' && urlInput.trim()) handleUrlSubmit();
                }}
                disabled={loading || (activeTab === 'link' && !urlInput.trim())}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Skip & Upload Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}