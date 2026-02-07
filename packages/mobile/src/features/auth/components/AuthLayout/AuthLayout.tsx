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

interface AuthLayoutProps {
  children: ReactNode;
  /** Optional header content (logo, title, back button) */
  header?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
}

export function AuthLayout({ children, header, footer }: AuthLayoutProps) {
  return (
    <View className="flex-1 bg-[#1a1a2e]">
      <StatusBar style="light" />
      <ImageBackground 
        source={require('../../../../../assets/auth_bg.png')} 
        className="flex-1 justify-center"
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(26,26,46,0.3)', 'rgba(26,26,46,0.8)', '#1a1a2e']}
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
