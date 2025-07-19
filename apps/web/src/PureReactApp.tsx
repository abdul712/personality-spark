import React, { useState } from 'react';

const PureReactApp: React.FC = () => {
  const [count, setCount] = useState(0);
  console.log('PureReactApp rendering, count:', count);
  
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAFAFA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ 
          color: '#6B46C1',
          marginBottom: '20px',
          fontSize: '32px'
        }}>
          🎉 React is Working!
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#666',
          marginBottom: '30px'
        }}>
          Personality Spark - Pure React Test
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '24px', color: '#333' }}>
            Count: {count}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              backgroundColor: '#6B46C1',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#553C9A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6B46C1';
            }}
          >
            Increment
          </button>
          
          <button 
            onClick={() => setCount(0)}
            style={{
              backgroundColor: '#E5E7EB',
              color: '#374151',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E7EB';
            }}
          >
            Reset
          </button>
        </div>
        
        <div style={{ 
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #E5E7EB'
        }}>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
            If you can see this and interact with the buttons,<br />
            React is mounting and working correctly!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PureReactApp;