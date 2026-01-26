export default function WardrobeItem({ item, onClick }) {
  const getTypeIcon = (type) => {
    const icons = {
      top: '👕',
      bottom: '👖',
      dress: '👗',
      outerwear: '🧥',
      shoes: '👟',
      accessories: '👒',
    };
    return icons[type] || '👕';
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="aspect-square relative bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-contain p-4"
        />
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
          <span className="text-lg">{getTypeIcon(item.type)}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600 capitalize">{item.type}</span>
          <div 
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: item.color }}
            title={item.color}
          />
        </div>
      </div>
    </div>
  );
}