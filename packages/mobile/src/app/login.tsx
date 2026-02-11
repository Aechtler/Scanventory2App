import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AuthLayout, AuthInput, AuthButton } from '@/features/auth/components';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const colors = useThemeColors();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben');
      return;
    }

    setIsLoading(true);
    try {
      await login(trimmedEmail, password);
    } catch (error) {
      Alert.alert('Login fehlgeschlagen', error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const header = (
    <View className="items-center mb-12">
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 300 }}
        className="w-24 h-24 bg-primary-500/20 rounded-3xl items-center justify-center mb-6 border border-primary-500/30"
      >
        <Icons.Search size={48} color={colors.primaryLight} />
      </MotiView>
      
      <Text className="text-5xl font-bold text-foreground mb-2 tracking-tight">
        Scan<Text className="text-primary-400">App</Text>
      </Text>
      <Text className="text-foreground-secondary text-lg font-light tracking-wide">
        DEIN WERT. DEIN WISSEN.
      </Text>
    </View>
  );

  const footer = (
    <MotiView 
      from={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ delay: 600 }}
      className="flex-row justify-center mt-8"
    >
      <Text className="text-foreground-secondary">Neu hier? </Text>
      <Pressable onPress={() => router.push('/register')} disabled={isLoading}>
        <Text className="text-primary-400 font-bold border-b border-primary-500/50">
          Account erstellen
        </Text>
      </Pressable>
    </MotiView>
  );

  return (
    <AuthLayout header={header} footer={footer}>
      <AuthInput
        label="E-MAIL"
        icon="mail"
        placeholder="name@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={isLoading}
      />

      <AuthInput
        label="PASSWORT"
        icon="lock"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        disabled={isLoading}
      />

      <AuthButton
        title="ANMELDEN"
        onPress={handleLogin}
        loading={isLoading}
      />
    </AuthLayout>
  );
}
