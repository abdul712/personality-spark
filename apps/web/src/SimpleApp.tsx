import React from 'react';

const SimpleApp: React.FC = () => {
  console.log('SimpleApp component rendering');
  
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#6B46C1' }}>React is Working! 🎉</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Personality Spark App - Simple Test Component
      </p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => alert('Button clicked!')}
          style={{
            backgroundColor: '#6B46C1',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SimpleApp;