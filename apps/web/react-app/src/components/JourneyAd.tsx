import React from 'react';

/**
 * IMPORTANT: Journey by Mediavine does NOT support manual ad placement.
 * 
 * According to their documentation:
 * - Journey automatically places ads only on blog posts/long-form content
 * - No manual or custom ad placement is available at this time
 * - The script automatically handles all ad placement and optimization
 * - Only the Universal Video Player and adhesion banner will show on homepages
 * 
 * This component serves as a placeholder/notice about Journey's limitations.
 * For actual ad display, Journey will automatically insert ads into your blog content.
 */

interface JourneyAdPlaceholderProps {
  className?: string;
  showNotice?: boolean;
}

export const JourneyAdPlaceholder: React.FC<JourneyAdPlaceholderProps> = ({ 
  className = '',
  showNotice = false
}) => {
  if (!showNotice) {
    // Return empty component - Journey will handle ad placement automatically
    return null;
  }

  // Development/debugging notice
  return (
    <div 
      className={`journey-ad-notice ${className}`}
      style={{
        margin: '20px 0',
        padding: '15px',
        backgroundColor: '#f3f4f6',
        border: '1px dashed #9ca3af',
        borderRadius: '0.375rem',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}
    >
      <p style={{ margin: 0 }}>
        <strong>Journey by Mediavine Ad Space</strong><br />
        <small>Ads will automatically appear in blog posts only. Manual placement not supported.</small>
      </p>
    </div>
  );
};

/**
 * Legacy exports for backward compatibility
 * These components won't actually display ads since Journey doesn't support manual placement
 */
export const JourneyAd = JourneyAdPlaceholder;
export const LeaderboardAd = JourneyAdPlaceholder;
export const MediumRectangleAd = JourneyAdPlaceholder;
export const InArticleAd = JourneyAdPlaceholder;