/**
 * AuthButton Component
 * 
 * Gradient button for auth forms
 */

import React, { useState } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AuthButton({ title, onPress, loading = false, disabled = false }: AuthButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View className="mt-4 px-1">
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={disabled || loading}
      >
        <MotiView
          animate={{
            scale: isPressed ? 0.96 : 1,
            opacity: disabled ? 0.5 : 1,
          }}
          transition={{ type: 'timing', duration: 150 }}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, styles.shadow]}
          >
            {/* Glossy top edge highlight for depth */}
            <View className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 rounded-t-2xl" />
            
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold tracking-tight">
                {title}
              </Text>
            )}
          </LinearGradient>
        </MotiView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  shadow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  }
});
