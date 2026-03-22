import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useAuthStore } from '@/features/auth/store/authStore';
import { AuthLayout, AuthInput, AuthButton } from '@/features/auth/components';
import { StatusBanner } from '@/shared/components/StatusBanner';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function translateLoginError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid email or password') || lower.includes('invalid credentials')) {
    return 'E-Mail oder Passwort ist falsch.';
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
  return 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const colors = useThemeColors();

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setErrors({});
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setErrors({ general: translateLoginError(message) });
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
      {errors.general && (
        <StatusBanner
          variant="error"
          title={errors.general}
          onDismiss={() => setErrors((e) => ({ ...e, general: undefined }))}
        />
      )}

      <AuthInput
        label="E-MAIL"
        icon="mail"
        placeholder="name@example.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={isLoading}
        error={errors.email}
      />

      <AuthInput
        label="PASSWORT"
        icon="lock"
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
        }}
        secureTextEntry
        disabled={isLoading}
        error={errors.password}
      />

      <AuthButton
        title="ANMELDEN"
        onPress={handleLogin}
        loading={isLoading}
      />
    </AuthLayout>
  );
}
