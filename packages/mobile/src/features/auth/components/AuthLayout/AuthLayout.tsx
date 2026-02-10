/**
 * AuthLayout Component
 * 
 * Shared layout for login and register screens with glassmorphism design
 */

import React, { ReactNode } from 'react';
import { View, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../../../../assets/auth_bg.png')}
        className="flex-1 justify-center"
        resizeMode="cover"
      >
        <LinearGradient
          colors={[`${colors.background}4D`, `${colors.background}CC`, colors.background]}
          className="absolute inset-0"
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center px-6"
        >
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
          >
            {/* Header Section */}
            {header}

            {/* Glassmorphism Card */}
            <BlurView intensity={30} tint="dark" className="overflow-hidden rounded-3xl border border-white/10">
              <View className="p-6 gap-5 bg-black/20">
                {children}
              </View>
            </BlurView>

            {/* Footer Section */}
            {footer}
          </MotiView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
