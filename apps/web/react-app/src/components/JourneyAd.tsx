import React, { useEffect, useRef } from 'react';

interface JourneyAdProps {
  slotId: string;
  format?: 'display' | 'native' | 'video';
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    Journey: any;
    journey: (...args: any[]) => void;
  }
}

export const JourneyAd: React.FC<JourneyAdProps> = ({ 
  slotId, 
  format = 'display',
  className = '',
  style = {}
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Only load ad once per component instance
    if (!isAdLoaded.current && adRef.current) {
      isAdLoaded.current = true;
      
      // Wait for Journey to be available
      const loadAd = () => {
        if (window.journey) {
          // Create ad placement
          window.journey('createPlacement', {
            placementId: slotId,
            element: adRef.current,
            type: format,
            // Additional options
            responsive: true,
            refresh: 30 // Refresh ad every 30 seconds
          });
        } else {
          // If Journey isn't loaded yet, try again
          setTimeout(loadAd, 100);
        }
      };
      
      loadAd();
    }
    
    // Cleanup function
    return () => {
      if (window.journey && isAdLoaded.current) {
        window.journey('destroyPlacement', slotId);
      }
    };
  }, [slotId, format]);

  return (
    <div 
      ref={adRef}
      id={`journey-ad-${slotId}`}
      className={`journey-ad-container ${className}`}
      style={{
        margin: '20px 0',
        minHeight: format === 'display' ? '250px' : '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        ...style
      }}
      data-journey-placement-id={slotId}
    >
      {/* Ad will be loaded here by Journey */}
    </div>
  );
};

// Convenience components for common ad formats
export const LeaderboardAd: React.FC<{ slotId: string; className?: string }> = ({ slotId, className }) => (
  <JourneyAd 
    slotId={slotId} 
    format="display"
    className={className}
    style={{ minHeight: '90px', maxWidth: '728px', margin: '20px auto' }}
  />
);

export const MediumRectangleAd: React.FC<{ slotId: string; className?: string }> = ({ slotId, className }) => (
  <JourneyAd 
    slotId={slotId} 
    format="display"
    className={className}
    style={{ minHeight: '250px', maxWidth: '300px', margin: '20px auto' }}
  />
);

export const InArticleAd: React.FC<{ slotId: string; className?: string }> = ({ slotId, className }) => (
  <JourneyAd 
    slotId={slotId} 
    format="native"
    className={className}
    style={{ margin: '30px 0' }}
  />
);