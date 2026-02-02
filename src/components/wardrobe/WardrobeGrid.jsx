import WardrobeItem from './WardrobeItem';
import WardrobeItemAdd from './WardrobeItemAdd';

export default function WardrobeGrid({ items = [], onItemClick, onItemAdd }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wardrobe is empty</h3>
        <p className="text-gray-600">Add your first clothing item to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <WardrobeItemAdd onClick={() => onItemAdd()} />
      {items.map((item) => (
        <WardrobeItem
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
}