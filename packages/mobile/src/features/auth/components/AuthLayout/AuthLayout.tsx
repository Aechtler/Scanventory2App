/**
 * AuthLayout Component
 * 
 * Shared layout for login and register screens with glassmorphism design.
 * Note: StatusBar is managed by the root _layout.tsx — do not add one here.
 */

import React, { ReactNode } from 'react';
import { View, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface AuthLayoutProps {
  children: ReactNode;
  /** Optional header content (logo, title, back button) */
  header?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
}

export function AuthLayout({ children, header, footer }: AuthLayoutProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Animated Background */}
      <View className="absolute inset-0 overflow-hidden">
        <LinearGradient
          colors={[colors.background, '#1a1a1a', colors.background]}
          className="absolute inset-0"
        />
        
        {/* Animated Blobs */}
        <MotiView
          from={{ translateX: -100, translateY: -100, scale: 1 }}
          animate={{ 
            translateX: 200, 
            translateY: 300,
            scale: 1.5,
          }}
          transition={{
            type: 'timing',
            duration: 15000,
            loop: true,
            repeatReverse: true,
          }}
          className="absolute w-80 h-80 rounded-full bg-primary-500/10 blur-3xl"
        />
        
        <MotiView
          from={{ translateX: 200, translateY: 500, scale: 1.2 }}
          animate={{ 
            translateX: -50, 
            translateY: 100,
            scale: 0.8,
          }}
          transition={{
            type: 'timing',
            duration: 12000,
            loop: true,
            repeatReverse: true,
          }}
          className="absolute w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
        />

        <MotiView
          from={{ opacity: 0.1 }}
          animate={{ opacity: 0.2 }}
          transition={{ type: 'timing', duration: 8000, loop: true, repeatReverse: true }}
          className="absolute bottom-0 right-0 w-[500px] h-60 bg-primary-600/5 blur-3xl rotate-45"
        />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
        >
          {/* Header Section */}
          <View className="mb-4">
            {header}
          </View>

          {/* Glassmorphism Card */}
          <BlurView 
            intensity={40} 
            tint="dark" 
            className="overflow-hidden rounded-[32px] border border-white/5"
          >
            <View className="p-8 gap-6 bg-white/[0.02]">
              {children}
            </View>
          </BlurView>

          {/* Footer Section */}
          <View>
            {footer}
          </View>
        </MotiView>
      </KeyboardAvoidingView>
    </View>
  );
}
