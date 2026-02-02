import React from 'react';
import { MoreVertical, Heart } from 'lucide-react';

export default function WardrobeItem({ item, onClick }) {
  const categoryIcons = {
    tops: '👕',
    bottoms: '👖',
    shoes: '👟',
    outerwear: '🧥',
    accessories: '🧢',
  };

  return (
    <div 
      onClick={onClick} 
      className="bg-white rounded-2xl shadow-md p-4 cursor-pointer w-[160px] h-[196px]"
    >
      <div className="relative w-full h-[130px] rounded-2xl overflow-hidden bg-gray-100 mb-4">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center text-6xl">
            {categoryIcons[item.category] || '👕'}
          </div>
        )}
        <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow">
          <Heart size={16} className="text-gray-600" />
        </button>
        {/* Category Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
          {item.category}
        </div>
      </div>
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-gray-900 truncate text-sm">{item.name}</h3>
        <MoreVertical size={16} className="text-gray-500" />
      </div>
      <div className="flex items-center justify-between">
      </div>
    </div>
  );
}