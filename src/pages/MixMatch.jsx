import { useState, useRef, useEffect } from 'react';
import { Shuffle, Download, Trash2 } from 'lucide-react';

export default function MixMatch() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [outfitHistory, setOutfitHistory] = useState([]);
  const canvasRef = useRef(null);

  // Mock data - in production, this would come from Wardrobe
  const mockItems = [
    {
      id: '1',
      name: 'White T-Shirt',
      type: 'top',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      color: '#FFFFFF'
    },
    {
      id: '2',
      name: 'Blue Jeans',
      type: 'bottom',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
      color: '#1E40AF'
    },
    {
      id: '3',
      name: 'Red Dress',
      type: 'dress',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
      color: '#DC2626'
    },
    {
      id: '4',
      name: 'Black Jacket',
      type: 'outerwear',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w-400&h=400&fit=crop',
      color: '#000000'
    }
  ];

  const handleSelectItem = (item) => {
    // Check if item type already exists in selection
    const existingIndex = selectedItems.findIndex(i => i.type === item.type);
    
    if (existingIndex >= 0) {
      // Replace existing item of same type
      const newSelection = [...selectedItems];
      newSelection[existingIndex] = item;
      setSelectedItems(newSelection);
    } else {
      // Add new item
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleSaveOutfit = () => {
    if (selectedItems.length === 0) return;
    
    const newOutfit = {
      id: Date.now().toString(),
      items: [...selectedItems],
      createdAt: new Date().toISOString(),
    };
    
    setOutfitHistory([newOutfit, ...outfitHistory]);
    setSelectedItems([]);
  };

  const handleRandomMix = () => {
    const randomItems = [];
    const types = ['top', 'bottom'];
    
    types.forEach(type => {
      const itemsOfType = mockItems.filter(item => item.type === type);
      if (itemsOfType.length > 0) {
        const randomItem = itemsOfType[Math.floor(Math.random() * itemsOfType.length)];
        randomItems.push(randomItem);
      }
    });
    
    setSelectedItems(randomItems);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mix & Match</h1>
        <p className="text-gray-600 mt-2">
          Combine clothing items to create perfect outfits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Items */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Items</h2>
            <div className="space-y-3">
              {mockItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                    selectedItems.some(selected => selected.id === item.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-md mr-3 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={handleRandomMix}
              className="w-full mt-6 btn-secondary flex items-center justify-center space-x-2"
            >
              <Shuffle className="h-5 w-5" />
              <span>Random Mix</span>
            </button>
          </div>
        </div>

        {/* Outfit Preview */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Outfit Preview</h2>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveOutfit}
                  disabled={selectedItems.length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Outfit
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  disabled={selectedItems.length === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Selected Items */}
            <div className="mb-8">
              {selectedItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2m6 0h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M12 9h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items selected</h3>
                  <p className="text-gray-600">Select items from the left to create an outfit</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-48 object-contain"
                        />
                      </div>
                      <div className="mt-2">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outfit History */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Saved Outfits</h3>
              {outfitHistory.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No saved outfits yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {outfitHistory.map((outfit) => (
                    <div key={outfit.id} className="border rounded-lg p-3">
                      <div className="flex space-x-2 mb-2">
                        {outfit.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {outfit.items.length} items • {new Date(outfit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}