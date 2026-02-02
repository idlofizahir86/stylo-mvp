import React from 'react';

export default function WardrobeCTA({ Icon, Label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="w-[120px] h-[120px] bg-white rounded-2xl shadow-md cursor-pointer flex flex-col items-center justify-center font-poppins"
    >
      <div className="w-[55px] h-[55px] rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-gray-800" />
      </div>
      <span className="text-gray-800 font-medium text-sm">{Label}</span>
    </div>
  );
}