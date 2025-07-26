import React from 'react';

interface AdNoticeProps {
  show?: boolean;
}

export const AdNotice: React.FC<AdNoticeProps> = ({ show = false }) => {
  if (!show || import.meta.env.PROD) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        padding: '1rem',
        maxWidth: '300px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        color: '#374151',
        zIndex: 50
      }}
    >
      <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Ad Display Notice</h4>
      <p style={{ margin: 0, lineHeight: 1.5 }}>
        Journey by Mediavine automatically places ads on blog posts. 
        Ads may take a moment to load and will only appear on article pages with sufficient content.
      </p>
    </div>
  );
};