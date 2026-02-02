import React from 'react';
import CameraIcon from '../../assets/icons/common/camera.svg?react';

export default function WardrobeItemAdd({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="w-[160px] h-[196px] border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors group"
    >
        <CameraIcon className="w-10 h-10 text-gray-600" />
      {/* <div className="w-16 h-16 rounded-full border-2 border-gray-500 flex items-center justify-center mb-4">
      </div> */}
      <span className="font-medium">Digitize</span>
    </div>
  );
}