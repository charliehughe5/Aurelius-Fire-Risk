import React from 'react';

interface AureliusLogoProps {
  className?: string;
  size?: number;
  hideText?: boolean;
  light?: boolean;
}

export default function AureliusLogo({ className = '', size = 32, hideText = false, light = false }: AureliusLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Pristine Vector SVG rendering of the Aurelius Spartan Helmet logo */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Helmet Crest/Plume */}
        <path 
          d="M38 12C58 12 73 24 73 40C73 43 72.5 46 71.5 49C70.5 50.5 72 52 74 51.5C80 50 83 45.5 83 38C83 23 68.5 10 43 10C35 10 28.5 11.5 24 13.5C22 14.5 22.5 16.5 24.5 16.5C28.5 16.5 33 14.5 38 12Z" 
          fill={light ? '#F59E0B' : '#B45309'} 
        />
        {/* Main Corinthian Helmet Body */}
        <path 
          d="M25 43C25 30 35 20 48 20C61 20 71 30 71 43C71 52 66 59 62 61.5C61 62 60 63.5 60.5 64.5L62 70.5C62.5 71.5 61 72.5 60 72C50 67 43 65.5 35 70C34.5 70.3 34 70 33.8 69.5L30 55C29.5 53 28 51.5 26 51L22 50C20.5 49.5 20.5 48.5 22 48C24 47.5 25 45.5 25 43Z" 
          fill={light ? '#E2E8F0' : '#1E293B'} 
        />
        {/* Eye Slot Cutout Accent */}
        <path 
          d="M48 40H58C60 40 61 41 60 42.5L52 50C51 51 49.5 50.5 49 49L47.5 43C47 41.5 47.5 40 48 40Z" 
          fill={light ? '#0F172A' : '#FFFFFF'} 
        />
        {/* Cheek Guard Accent lines */}
        <path 
          d="M34 50C33.5 46.5 35 44 38 44.5" 
          stroke={light ? '#475569' : '#94A3B8'} 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
      </svg>
      
      {!hideText && (
        <div className="text-left">
          <span className={`font-extrabold text-xs tracking-tight block uppercase leading-none ${light ? 'text-white' : 'text-slate-900'}`}>
            Aurelius
          </span>
          <span className={`text-[8.5px] font-mono tracking-widest block uppercase font-bold mt-0.5 ${light ? 'text-amber-400' : 'text-amber-600'}`}>
            Fire Risk Systems
          </span>
        </div>
      )}
    </div>
  );
}
