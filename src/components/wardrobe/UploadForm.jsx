import { useState } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { removeBackground } from '../../services/ai/backgroundRemover';

export default function UploadForm({ isOpen, onClose, onUpload }) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [itemData, setItemData] = useState({
    name: '',
    type: 'top',
    color: '#3B82F6',
    category: 'casual',
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    
    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.message);
        setLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          
          // Show processing status
          setProcessingStep('Removing background...');
          
          // Process image with multiple fallbacks
          const processedImage = await removeBackground(base64Image);
          
          if (!processedImage) {
            throw new Error('Background removal failed');
          }
          
          setImageUrl(processedImage);
          setProcessingStep(null);
          showMessage('Background removed successfully!', 'success');
          
        } catch (error) {
          console.error('Background removal error:', error);
          
          // Fallback to original image with warning
          setImageUrl(reader.result);
          setError('Background removal unavailable. Using original image.');
          showMessage('Using original image (background removal service unavailable)', 'warning');
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read image file');
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to process image');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) return;

    const newItem = {
      id: Date.now().toString(),
      imageUrl,
      ...itemData,
      createdAt: new Date().toISOString(),
    };

    onUpload(newItem);
    resetForm();
  };

  const resetForm = () => {
    setImageUrl('');
    setItemData({
      name: '',
      type: 'top',
      color: '#3B82F6',
      category: 'casual',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Clothing Item</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>
                
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <span className="text-gray-600">
                          Click to upload or drag and drop
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </label>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        placeholder="Paste image URL from Pinterest, Google, etc."
                        className="flex-1 border rounded-lg px-3 py-2"
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="mt-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <p className="text-sm text-gray-600 mt-2">Removing background...</p>
                  </div>
                )}
              </div>

              {/* Item Details Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemData.name}
                    onChange={(e) => setItemData({...itemData, name: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., Blue Denim Jacket"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clothing Type
                  </label>
                  <select
                    value={itemData.type}
                    onChange={(e) => setItemData({...itemData, type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="dress">Dress</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={itemData.color}
                      onChange={(e) => setItemData({...itemData, color: e.target.value})}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <span className="text-gray-600">{itemData.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={itemData.category}
                    onChange={(e) => setItemData({...itemData, category: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="sport">Sport</option>
                    <option value="party">Party</option>
                    <option value="work">Work</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!imageUrl || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Add to Wardrobe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}