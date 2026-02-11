import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Icons } from '@/shared/components/Icons';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AuthLayout, AuthInput, AuthButton } from '@/features/auth/components';

const MIN_PASSWORD_LENGTH = 6;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim() || undefined;

    if (!trimmedEmail || !password) {
      Alert.alert('Fehler', 'Bitte E-Mail und Passwort eingeben');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Fehler', 'Bitte eine gültige E-Mail-Adresse eingeben');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Fehler', `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein`);
      return;
    }

    setIsLoading(true);
    try {
      await register(trimmedEmail, password, trimmedName);
    } catch (error) {
      Alert.alert('Registrierung fehlgeschlagen', error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const header = (
    <View className="mb-8">
      <Pressable 
        onPress={() => router.replace('/login')} 
        className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mb-6"
      >
        <Icons.ArrowLeft size={24} color="white" />
      </Pressable>
      
      <Text className="text-4xl font-bold text-white mb-2">
        Account erstellen
      </Text>
      <Text className="text-foreground-secondary text-lg">
        Starte deine Sammlung.
      </Text>
    </View>
  );

  const footer = (
    <View className="flex-row justify-center mt-6">
      <Text className="text-foreground-secondary">Bereits registriert? </Text>
      <Pressable onPress={() => router.replace('/login')} disabled={isLoading}>
        <Text className="text-primary-400 font-bold border-b border-primary-500/50">
          Anmelden
        </Text>
      </Pressable>
    </View>
  );

  return (
    <AuthLayout header={header} footer={footer}>
      <AuthInput
        label="NAME (OPTIONAL)"
        icon="user"
        placeholder="Dein Name"
        value={name}
        onChangeText={setName}
        disabled={isLoading}
      />

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
        placeholder={`Mind. ${MIN_PASSWORD_LENGTH} Zeichen`}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        disabled={isLoading}
      />

      <AuthButton
        title="REGISTRIEREN"
        onPress={handleRegister}
        loading={isLoading}
      />
    </AuthLayout>
  );
}
