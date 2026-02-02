import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar,
  TrendingUp, 
  Zap, 
  Plus, 
  Shirt, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

import WardrobeCTA from '../components/wardrobe/WardrobeCTA';
import CloudIcon from '../assets/icons/common/cloud-sunny.svg?react';
import TreeIcon from '../assets/icons/common/tree.svg?react';

import AddItemIcon from '../assets/icons/common/message-add.svg?react';
import CalendarIcon from '../assets/icons/common/calendar.svg?react';
import ChatbotIcon from '../assets/icons/common/chatbot.svg?react';


import { useAuth } from '../contexts/AuthContext';
import { useAIChat } from '../contexts/AIChatContext';

const WARDROBE_ITEMS = [
  { id: 1, name: 'Denim Jacket', category: 'Outerwear', color: 'Blue', wornCount: 12, favorite: true },
  { id: 2, name: 'Cargo Pants', category: 'Bottoms', color: 'Beige', wornCount: 5, favorite: false },
  { id: 3, name: 'White Sneakers', category: 'Shoes', color: 'White', wornCount: 20, favorite: true },
  { id: 4, name: 'Graphic Tee', category: 'Tops', color: 'Black', wornCount: 2, favorite: false },
];

const OUTFIT_SUGGESTIONS = [
  { id: 1, name: 'Casual Day Out', items: ['👕', '👖', '👟'], tags: ['Casual', 'Comfortable'] },
  { id: 2, name: 'Smart Casual', items: ['🧥', '👔', '👖'], tags: ['Office', 'Formal'] },
  { id: 3, name: 'Weekend Vibes', items: ['👕', '🩳', '🩴'], tags: ['Relaxed', 'Summer'] },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('today');
  const { user } = useAuth();
  const { setShowAIChat } = useAIChat();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-medium text-[#8A8A8A]">Hello,</p>
            <h1 className="text-2xl font-bold text-gray-900">{user?.displayName || 'User'}</h1>
          </div>
          {user && (
              <Link to="/profile" className="ml-2">
                {user?.photoURL ? (
                  // Jika ada photoURL, tampilkan gambar asli
                  <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm">
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback jika gambar error
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-medium text-sm">
                            ${user.displayName?.charAt(0) || 'U'}
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  // Jika tidak ada photoURL, tampilkan initial
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </Link>
            )}
          {/* <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
            <Cloud size={20} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-700">32°C • Jakarta</span>
          </div> */}
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Wardrobe</p>
              <p className="text-2xl font-bold text-blue-900">24</p>
              <p className="text-xs text-blue-600">Items</p>
            </div>
            <Shirt size={24} className="text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Last Worn</p>
              <p className="text-2xl font-bold text-purple-900">5</p>
              <p className="text-xs text-purple-600">Days ago</p>
            </div>
            <Calendar size={24} className="text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium">Impact</p>
              <p className="text-2xl font-bold text-emerald-900">-12%</p>
              <p className="text-xs text-emerald-600">CO₂ Saved</p>
            </div>
            <TrendingUp size={24} className="text-emerald-500" />
          </div>
        </div>
      </div> */}

      {/* Today's Outfit Suggestion */}
      <div className="bg-gradient-to-br from-[#2762EB] to-[#9133EA] text-white rounded-2xl p-5 shadow-[0_15px_30px_rgba(39,98,235,0.2)]">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="w-fit flex items-center gap-2 px-3 py-2 bg-[#FFFFFF40] rounded-[100px]">
              <CloudIcon size={20} className="text-blue-500" />
              <span className="text-sm font-medium text-white-700">Jakarta, 32°C</span>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-300" />
              <h3 className="text-[20px] font-bold text-white">Today's Pick</h3>
            </div>
            <p className="text-[12px] font-medium text-white">Light fabrics for the heat. Use your unworn beige cargos.</p>
          </div>
        </div>
        {/* <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl">
            👕
          </div>
          <div className="text-xl">+</div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-2xl">
            👖
          </div>
          <div className="text-xl">+</div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-400 flex items-center justify-center text-2xl">
            👟
          </div>
        </div> */}
        <div className="flex gap-2">
          <Link 
            to="/try-on" 
            className="flex-1 py-3 bg-white rounded-xl font-semibold text-center hover:bg-gray-100 transition-colors"
          >
            <span className="bg-gradient-to-br from-[#2762EB] to-[#9133EA] bg-clip-text text-transparent">
              Try On
            </span>
          </Link>
          <button className="flex-1 py-3 bg-white/10 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/20 transition-colors">
            View Look
          </button>
        </div>
      </div>

      <div className="bg-[#353535] rounded-[20px] p-5 w-full max-w-md">
        <div className="flex items-center mb-4">
          {/* Tree Icon */}
          <TreeIcon className="w-[35px] h-[35px] text-white" />
          
          
          {/* CO2 Text Section */}
          <div className="text-left">
            <h3 className="text-white text-[20px] font-bold">1.5 Kg</h3>
            <p className="text-white text-[12px] font-medium">
              co2 saved this month by reusing
            </p>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="relative w-full h-[5px] bg-white/20 rounded-[20px] overflow-hidden">
          {/* Progress Fill */}
          <div 
            className="absolute left-0 top-0 h-full rounded-[20px] bg-gradient-to-r from-[#7BA2FF] to-[#1BF6AD] shadow-[0_15px_15px_rgba(39,98,235,0.2)]"
            style={{ width: '28px' }} // Atau gunakan % progress
          />
        </div>
        
        {/* Progress Label (Opsional) */}
        {/* <div className="flex justify-between text-white/60 text-[10px] mt-2">
          <span>Progress</span>
          <span>28/293</span> 
        </div> */}
      </div>


      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Quick Access</h3>
        <div className="flex gap-3 mb-6">
          <Link to="/wardrobe">
            <WardrobeCTA 
              Icon={AddItemIcon} 
              Label="Add Item" 
              onClick={(e) => {
                e.stopPropagation(); // ⬅️ Mencegah event bubbling ke Link
                console.log('Logika tambahan di sini');
              }}
            />
          </Link>
          <Link to="/wardrobe">
            <WardrobeCTA Icon={CalendarIcon} Label="Plan Week" onClick={() => {}} />
          </Link>
          <WardrobeCTA Icon={ChatbotIcon} Label="Chatbot" onClick={() => setShowAIChat(true)} />
        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Your Wardrobe</h3>
          <Link
            to="/wardrobe"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Unworn', 'Favorites', 'Tops', 'Bottoms'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeTab === tab.toLowerCase()
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Wardrobe Items Grid */}
        <div className="grid grid-cols-2 gap-3">
          {WARDROBE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl">
                  {item.category === 'Outerwear' && '🧥'}
                  {item.category === 'Bottoms' && '👖'}
                  {item.category === 'Shoes' && '👟'}
                  {item.category === 'Tops' && '👕'}
                </div>
                {item.favorite && (
                  <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">{item.category}</span>
                <span className="text-xs font-medium text-gray-500">Worn {item.wornCount}x</span>
              </div>
            </div>
          ))}
          
          {/* Add New Item */}
          <Link
            to="/wardrobe"
            className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-medium">Add New</span>
            <span className="text-xs mt-1">Digitize clothing</span>
          </Link>
        </div>
      </div>

      {/* Outfit Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Outfit Ideas</h3>
          <button className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
            Generate More <Sparkles size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {OUTFIT_SUGGESTIONS.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{outfit.name}</h4>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                {outfit.items.map((emoji, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-lg"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                {outfit.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}