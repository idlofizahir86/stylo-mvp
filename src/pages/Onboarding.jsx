import React, { useState } from 'react';
import { ArrowRight, Sparkles, Shirt, Camera, Users, Zap } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Sparkles className="text-blue-500" size={48} />,
      title: "Welcome to Stylo",
      subtitle: "Your AI-powered personal stylist for sustainable fashion",
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: <Shirt className="text-purple-500" size={48} />,
      title: "Digital Wardrobe",
      subtitle: "Upload, organize, and mix-match your clothes digitally",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: <Camera className="text-emerald-500" size={48} />,
      title: "Virtual Try-On",
      subtitle: "See how clothes look on you with AR technology",
      color: "from-emerald-400 to-teal-400"
    },
    {
      icon: <Users className="text-amber-500" size={48} />,
      title: "Style Community",
      subtitle: "Share outfits, get inspiration, and discover new styles",
      color: "from-amber-400 to-orange-400"
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onComplete}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-64 h-64 rounded-full opacity-5"
              style={{
                background: `radial-gradient(circle, ${slides[step].color.split(' ')[1]} 0%, transparent 70%)`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `scale(${0.5 + Math.random() * 1.5})`
              }}
            />
          ))}
        </div>

        {/* Icon Container */}
        <div className="relative mb-12">
          <div className={`w-40 h-40 rounded-3xl bg-gradient-to-br ${slides[step].color} p-1 shadow-2xl shadow-slate-300/50`}>
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
              {slides[step].icon}
            </div>
          </div>
          
          {/* Floating Dots */}
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 animate-pulse" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-purple-500 animate-pulse delay-300" />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {slides[step].title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {slides[step].subtitle}
          </p>
        </div>
      </div>

      {/* Progress & Button */}
      <div className="px-6 pb-12 space-y-8">
        {/* Progress Dots */}
        <div className="flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`transition-all duration-500 ${index === step ? 'w-10' : 'w-3'} h-3 rounded-full ${index === step ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 px-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-gray-900/30 hover:shadow-gray-900/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {step === slides.length - 1 ? (
            <>
              Get Started
              <Zap size={20} />
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}