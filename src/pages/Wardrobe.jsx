import { useState, useEffect } from 'react';
import WardrobeGrid from '../components/wardrobe/WardrobeGrid';
import UploadForm from '../components/wardrobe/UploadForm';
import PreviewModal from '../components/wardrobe/PreviewModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, RefreshCw } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';

export default function Wardrobe() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  
  const { items, loading, error, addItem, deleteItem, refreshItems } = useFirestore();

  const handleUpload = async (newItem) => {
    try {
      await addItem(newItem);
      setIsUploadOpen(false);
    } catch (err) {
      console.error('Failed to save item:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(itemId);
        if (previewItem?.id === itemId) {
          setPreviewItem(null);
        }
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner text="Loading your wardrobe..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Wardrobe</h1>
          <p className="text-gray-600 mt-2">
            {items.length} item{items.length !== 1 ? 's' : ''} in your wardrobe
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshItems}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <WardrobeGrid 
        items={items} 
        onItemClick={setPreviewItem}
      />

      <UploadForm
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />

      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
}