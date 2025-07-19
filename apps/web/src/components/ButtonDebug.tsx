import React from 'react';
import { View, Text, TouchableOpacity, Pressable, Platform } from 'react-native';

export const ButtonDebug: React.FC = () => {
  const [clickCounts, setClickCounts] = React.useState({
    touchable: 0,
    pressable: 0,
    native: 0,
  });

  const handleClick = (type: keyof typeof clickCounts) => {
    setClickCounts(prev => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    console.log(`${type} button clicked!`);
  };

  return (
    <View style={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: 'white', padding: 20, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, zIndex: 9999 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Button Debug Panel</Text>
      <Text style={{ fontSize: 12, marginBottom: 10 }}>Platform: {Platform.OS}</Text>
      
      <TouchableOpacity
        onPress={() => handleClick('touchable')}
        style={{ backgroundColor: '#3b82f6', padding: 10, borderRadius: 4, marginBottom: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          TouchableOpacity ({clickCounts.touchable})
        </Text>
      </TouchableOpacity>

      <Pressable
        onPress={() => handleClick('pressable')}
        style={{ backgroundColor: '#10b981', padding: 10, borderRadius: 4, marginBottom: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Pressable ({clickCounts.pressable})
        </Text>
      </Pressable>

      {Platform.OS === 'web' && (
        <button
          onClick={() => handleClick('native')}
          style={{ backgroundColor: '#f59e0b', padding: 10, borderRadius: 4, border: 'none', color: 'white', cursor: 'pointer', width: '100%' }}
        >
          Native Button ({clickCounts.native})
        </button>
      )}
    </View>
  );
};