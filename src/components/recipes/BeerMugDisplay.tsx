
'use client';

import React from 'react';

interface BeerMugDisplayProps {
  ebcColor?: number | null;
  className?: string;
}

const getBeerColorFromEBC = (ebc?: number | null): string => {
  if (ebc === null || typeof ebc === 'undefined' || ebc < 0) return '#F8F753'; // Default for unknown or invalid

  if (ebc < 6) return '#F8F753';   // Pale Straw
  if (ebc < 9) return '#FBEA51';   // Straw
  if (ebc < 12) return '#FDE14D';  // Pale Gold
  if (ebc < 16) return '#FDCB46';  // Deep Gold
  if (ebc < 20) return '#F0A942';  // Pale Amber
  if (ebc < 26) return '#E58C3C';  // Medium Amber
  if (ebc < 33) return '#D97C36';  // Deep Amber
  if (ebc < 39) return '#C0602B';  // Copper
  if (ebc < 47) return '#AE502C';  // Light Brown
  if (ebc < 57) return '#8B422A';  // Brown
  if (ebc < 69) return '#6A3423';  // Dark Brown
  if (ebc < 79) return '#4A2A1E';  // Very Dark Brown
  return '#2A1D1A';               // Black
};

export function BeerMugDisplay({ ebcColor, className }: BeerMugDisplayProps) {
  const beerColor = getBeerColorFromEBC(ebcColor);

  return (
    <div className={`flex justify-center items-center my-4 ${className}`}>
      <svg width="80" height="100" viewBox="0 0 80 100" aria-label="Chope de bière visualisant la couleur EBC" role="img" data-ai-hint="beer mug">
        {/* Beer Liquid */}
        <rect x="10" y="15" width="50" height="75" fill={beerColor} rx="5" ry="5" />
        
        {/* Foam */}
        <ellipse cx="35" cy="15" rx="26" ry="8" fill="#FFFDE7" />
        <ellipse cx="25" cy="12" rx="8" ry="4" fill="#FFFDE7" />
        <ellipse cx="45" cy="13" rx="10" ry="5" fill="#FFFDE7" />
        
        {/* Mug Glass Outline */}
        <path d="M10 10 V90 H60 V10" stroke="#A0A0A0" strokeWidth="3" fill="none" />
        
        {/* Handle */}
        <path d="M60 30 C 75 35, 75 55, 60 60" stroke="#A0A0A0" strokeWidth="8" fill="none" strokeLinecap="round"/>

        {/* Optional: Add subtle highlights or shadows for more realism if needed */}
        {/* <rect x="12" y="17" width="5" height="71" fill="rgba(255,255,255,0.2)" rx="2" /> */}
      </svg>
    </div>
  );
}
