import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../features/auth/store/authStore';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Router redirection handled in _layout.tsx
    } catch (error) {
      Alert.alert('Login fehlgeschlagen', error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1a1a2e]">
      <StatusBar style="light" />
      <ImageBackground 
        source={require('../../assets/auth_bg.png')} 
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
            {/* Logo Section */}
            <View className="items-center mb-12">
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 300 }}
                className="w-24 h-24 bg-primary-500/20 rounded-3xl items-center justify-center mb-6 border border-primary-500/30"
              >
                <Ionicons name="scan-outline" size={48} color="#a78bfa" />
              </MotiView>
              
              <Text className="text-5xl font-bold text-white mb-2 tracking-tight">
                Scan<Text className="text-primary-400">App</Text>
              </Text>
              <Text className="text-gray-300 text-lg font-light tracking-wide">
                DEIN WERT. DEIN WISSEN.
              </Text>
            </View>

            {/* Glassmorphism Card */}
            <BlurView intensity={30} tint="dark" className="overflow-hidden rounded-3xl border border-white/10">
              <View className="p-6 gap-5 bg-black/20">
                
                <View>
                  <Text className="text-gray-300 mb-2 ml-1 text-sm font-medium">E-MAIL</Text>
                  <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 h-14">
                    <Ionicons name="mail-outline" size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                      className="flex-1 text-white text-base h-full"
                      placeholder="name@example.com"
                      placeholderTextColor="#6b7280"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-gray-300 mb-2 ml-1 text-sm font-medium">PASSWORT</Text>
                  <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 h-14">
                    <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                      className="flex-1 text-white text-base h-full"
                      placeholder="••••••••"
                      placeholderTextColor="#6b7280"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleLogin}
                  disabled={isLoading}
                  className="mt-2"
                >
                  <LinearGradient
                    colors={['#8b5cf6', '#6d28d9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary-500/30"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-lg font-bold tracking-wide">ANMELDEN</Text>
                    )}
                  </LinearGradient>
                </Pressable>

              </View>
            </BlurView>

            {/* Footer */}
            <MotiView 
              from={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 600 }}
              className="flex-row justify-center mt-8"
            >
              <Text className="text-gray-400">Neu hier? </Text>
              <Pressable onPress={() => router.push('/register')} disabled={isLoading}>
                <Text className="text-primary-400 font-bold border-b border-primary-500/50">
                  Account erstellen
                </Text>
              </Pressable>
            </MotiView>

          </MotiView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
