import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Icons } from '@/shared/components/Icons';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AuthLayout, AuthInput, AuthButton } from '@/features/auth/components';
import { StatusBanner } from '@/shared/components/StatusBanner';

const MIN_PASSWORD_LENGTH = 6;

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function translateRegisterError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('already exists')) {
    return 'Diese E-Mail-Adresse ist bereits registriert.';
  }
  if (lower.includes('too many') || lower.includes('rate limit')) {
    return 'Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut.';
  }
  if (lower.includes('timed out')) {
    return 'Der Server antwortet nicht. Bitte prüfe deine Verbindung oder versuche es später erneut.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return 'Keine Verbindung zum Server. Bitte überprüfe deine Internetverbindung.';
  }
  if (lower.includes('invalid server response')) {
    return 'Fehler beim Verbinden mit dem Server. Bitte versuche es erneut.';
  }
  return 'Registrierung fehlgeschlagen. Bitte versuche es erneut.';
}

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Bitte E-Mail eingeben';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Keine gültige E-Mail-Adresse';
    }

    if (!password) {
      newErrors.password = 'Bitte Passwort eingeben';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen erforderlich`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setErrors({});
    setIsLoading(true);
    try {
      await register(email.trim(), password, name.trim() || undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setErrors({ general: translateRegisterError(message) });
    } finally {
      setIsLoading(false);
    }
  };

  const header = (
    <View className="mb-8">
      <Pressable
        onPress={() => router.replace('/login')}
        className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10"
      >
        <Icons.ArrowLeft size={20} color="white" />
      </Pressable>

      <Text className="text-3xl font-bold text-white mb-1">
        Account erstellen
      </Text>
      <Text className="text-white/40 text-sm font-medium">
        Verwalte deine Bestände.
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
      {errors.general && (
        <StatusBanner
          variant="error"
          title={errors.general}
          onDismiss={() => setErrors((e) => ({ ...e, general: undefined }))}
        />
      )}

      <AuthInput
        label="Name"
        icon="user"
        placeholder="Dein Name (optional)"
        value={name}
        onChangeText={setName}
        disabled={isLoading}
        autoFocus
        returnKeyType="next"
      />

      <AuthInput
        label="E-Mail"
        icon="mail"
        placeholder="E-Mail Adresse"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={isLoading}
        error={errors.email}
        returnKeyType="next"
      />

      <AuthInput
        label="Passwort"
        icon="lock"
        placeholder={`Mind. ${MIN_PASSWORD_LENGTH} Zeichen`}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
        }}
        secureTextEntry
        disabled={isLoading}
        error={errors.password}
        returnKeyType="join"
        onSubmitEditing={handleRegister}
      />

      <AuthButton
        title="REGISTRIEREN"
        onPress={handleRegister}
        loading={isLoading}
      />
    </AuthLayout>
  );
}
