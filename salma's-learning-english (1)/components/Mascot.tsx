import React from 'react';
import { MascotMood } from '../types';

interface MascotProps {
  mood: MascotMood;
  message?: string;
  compact?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({ mood, message, compact = false }) => {
  // A new, sitting black cat design
  const getExpression = () => {
    switch (mood) {
      case MascotMood.HAPPY:
        return (
          <g transform="translate(0, 2)">
            {/* Closed happy eyes */}
            <path d="M35 38 Q40 42 45 38" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
            <path d="M55 38 Q60 42 65 38" fill="none" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
            <path d="M48 48 Q50 52 52 48" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" /> {/* Mouth */}
          </g>
        );
      case MascotMood.SAD_ENCOURAGING:
        return (
          <g transform="translate(0, 2)">
            <circle cx="40" cy="40" r="3" fill="#FCD34D" />
            <circle cx="60" cy="40" r="3" fill="#FCD34D" />
            <path d="M48 50 Q50 48 52 50" fill="none" stroke="#FCD34D" strokeWidth="1.5" />
            <path d="M35 35 Q40 38 45 35" fill="none" stroke="#FCD34D" strokeWidth="1" />
            <path d="M55 35 Q60 38 65 35" fill="none" stroke="#FCD34D" strokeWidth="1" />
          </g>
        );
      case MascotMood.THINKING:
        return (
          <g transform="translate(0, 2)">
            <circle cx="40" cy="38" r="3" fill="#FCD34D" />
            <circle cx="60" cy="38" r="3" fill="#FCD34D" />
            <path d="M45 50 Q50 50 55 50" fill="none" stroke="#FCD34D" strokeWidth="1.5" />
            <path d="M65 20 L75 10" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        );
      default: // NEUTRAL / WAITING
        return (
          <g transform="translate(0, 2)">
            <circle cx="40" cy="40" r="3" fill="#FCD34D" />
            <circle cx="60" cy="40" r="3" fill="#FCD34D" />
            <path d="M48 48 Q50 51 52 48" fill="none" stroke="#FCD34D" strokeWidth="1.5" />
          </g>
        );
    }
  };

  const sizeClass = compact ? "w-20 h-20" : "w-32 h-32 md:w-40 md:h-40";

  return (
    <div className={`flex flex-col items-center justify-center ${!compact ? 'animate-float' : ''}`}>
      <div className={`relative ${sizeClass} transition-all duration-300`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          {/* Tail */}
          <path d="M80 80 Q95 70 85 50 Q80 40 70 60" fill="none" stroke="#1F2937" strokeWidth="8" strokeLinecap="round" />
          
          {/* Body */}
          <path d="M25 85 Q20 85 20 75 Q20 50 35 40 L65 40 Q80 50 80 75 Q80 85 75 85 Z" fill="#1F2937" />
          
          {/* Head */}
          <circle cx="50" cy="40" r="28" fill="#1F2937" />
          
          {/* Ears */}
          <path d="M28 25 L40 35 L25 45 Z" fill="#1F2937" />
          <path d="M72 25 L60 35 L75 45 Z" fill="#1F2937" />
          <path d="M32 28 L38 34 L30 40 Z" fill="#374151" />
          <path d="M68 28 L62 34 L70 40 Z" fill="#374151" />

          {/* Expression */}
          {getExpression()}
          
          {/* Whiskers */}
          <line x1="30" y1="45" x2="15" y2="42" stroke="#4B5563" strokeWidth="0.5" />
          <line x1="30" y1="48" x2="15" y2="52" stroke="#4B5563" strokeWidth="0.5" />
          <line x1="70" y1="45" x2="85" y2="42" stroke="#4B5563" strokeWidth="0.5" />
          <line x1="70" y1="48" x2="85" y2="52" stroke="#4B5563" strokeWidth="0.5" />
        </svg>
      </div>
      
      {/* Speech Bubble */}
      {message && (
        <div className={`
          bg-white rounded-2xl border border-indigo-100 shadow-lg text-center transform transition-all duration-300
          ${compact ? 'absolute right-full mr-4 top-0 w-48 py-2 px-3 rounded-tr-none' : 'mt-4 px-6 py-3 max-w-xs rounded-tr-none'}
        `}>
          <p className="text-gray-800 font-medium text-sm">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};
