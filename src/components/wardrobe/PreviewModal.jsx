import { X, Tag, Palette, Calendar, Type, Edit2 } from 'lucide-react';

export default function PreviewModal({ item, onClose }) {
  if (!item) return null;

  const getTypeLabel = (type) => {
    const labels = {
      top: 'Top',
      bottom: 'Bottom',
      dress: 'Dress',
      outerwear: 'Outerwear',
      shoes: 'Shoes',
      accessories: 'Accessories',
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      casual: 'Casual',
      formal: 'Formal',
      sport: 'Sport',
      party: 'Party',
      work: 'Work',
    };
    return labels[category] || category;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Item Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Preview */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-xl p-8">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-auto object-contain max-h-[300px] mx-auto"
                />
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 btn-primary flex items-center justify-center space-x-2">
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Item</span>
                </button>
                <button className="flex-1 btn-secondary">
                  Use in Outfit
                </button>
              </div>
            </div>

            {/* Item Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600">Detailed information about this clothing item</p>
              </div>

              <div className="space-y-4">
                {/* Type */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Type className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-900">{getTypeLabel(item.type)}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Tag className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium text-gray-900">{getCategoryLabel(item.category)}</p>
                  </div>
                </div>

                {/* Color */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Palette className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-900">{item.color.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Added</p>
                    <p className="font-medium text-gray-900">
                      {item.createdAt 
                        ? new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {item.type}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {item.category}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    No Background
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
            <button
            onClick={() => {
                if (onDelete) {
                onDelete(item.id);
                onClose();
                }
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
            Delete Item
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Handle try this item action
                onClose();
              }}
              className="btn-primary"
            >
              Try This Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}