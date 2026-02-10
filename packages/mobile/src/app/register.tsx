import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Icons } from '../shared/components/Icons';
import { useAuthStore } from '../features/auth/store/authStore';
import { AuthLayout, AuthInput, AuthButton } from '../features/auth/components';

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
    } catch (error) {
      Alert.alert('Registrierung fehlgeschlagen', error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
      setIsLoading(false);
    }
  };

  const header = (
    <View className="mb-8">
      <Pressable 
        onPress={() => router.back()} 
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
      <Pressable onPress={() => router.back()} disabled={isLoading}>
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
        placeholder="Mind. 6 Zeichen"
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
