import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../features/auth/store/authStore';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Fehler', 'Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, name || undefined);
      // Router redirection handled in _layout.tsx
    } catch (error) {
      Alert.alert('Registrierung fehlgeschlagen', error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
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
          colors={['rgba(26,26,46,0.5)', 'rgba(26,26,46,0.9)', '#1a1a2e']}
          className="absolute inset-0"
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center px-6"
        >
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800 }}
          >
            
            {/* Header */}
            <View className="mb-8">
              <Pressable 
                onPress={() => router.back()} 
                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mb-6"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
              
              <Text className="text-4xl font-bold text-white mb-2">
                Account erstellen
              </Text>
              <Text className="text-gray-300 text-lg">
                Starte deine Sammlung.
              </Text>
            </View>

            {/* Glassmorphism Card */}
            <BlurView intensity={30} tint="dark" className="overflow-hidden rounded-3xl border border-white/10">
              <View className="p-6 gap-5 bg-black/20">
                
                <View>
                  <Text className="text-gray-300 mb-2 ml-1 text-sm font-medium">NAME (OPTIONAL)</Text>
                  <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 h-14">
                    <Ionicons name="person-outline" size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                      className="flex-1 text-white text-base h-full"
                      placeholder="Dein Name"
                      placeholderTextColor="#6b7280"
                      value={name}
                      onChangeText={setName}
                      editable={!isLoading}
                    />
                  </View>
                </View>

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
                      placeholder="Mind. 6 Zeichen"
                      placeholderTextColor="#6b7280"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleRegister}
                  disabled={isLoading}
                  className="mt-4"
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
                      <Text className="text-white text-lg font-bold tracking-wide">REGISTRIEREN</Text>
                    )}
                  </LinearGradient>
                </Pressable>

              </View>
            </BlurView>

            {/* Footer */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400">Bereits registriert? </Text>
              <Pressable onPress={() => router.back()} disabled={isLoading}>
                <Text className="text-primary-400 font-bold border-b border-primary-500/50">
                  Anmelden
                </Text>
              </Pressable>
            </View>

          </MotiView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
