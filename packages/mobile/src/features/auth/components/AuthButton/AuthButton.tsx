/**
 * AuthButton Component
 * 
 * Gradient button for auth forms
 */

import React, { ReactNode } from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AuthButton({ title, onPress, loading = false, disabled = false }: AuthButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} className="mt-2">
      <LinearGradient
        colors={['#8b5cf6', '#6d28d9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary-500/30"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-bold tracking-wide">{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
