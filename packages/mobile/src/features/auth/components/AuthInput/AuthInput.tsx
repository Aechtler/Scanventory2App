/**
 * AuthInput Component
 *
 * Styled input field for auth forms with icon support and inline error display
 */

import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

type IconName = 'mail' | 'lock' | 'user';

interface AuthInputProps extends Omit<TextInputProps, 'className'> {
  label: string;
  icon: IconName;
  disabled?: boolean;
  error?: string;
}

const iconMap: Record<IconName, keyof typeof Icons> = {
  mail: 'Mail',
  lock: 'Lock',
  user: 'User',
};

export function AuthInput({
  label,
  icon,
  disabled = false,
  error,
  ...textInputProps
}: AuthInputProps) {
  const IconComponent = Icons[iconMap[icon]];
  const colors = useThemeColors();
  const hasError = !!error;

  return (
    <View>
      <Text className="text-foreground-secondary mb-2 ml-1 text-sm font-medium">{label}</Text>
      <View className={`flex-row items-center bg-black/40 border rounded-2xl px-4 h-14 ${hasError ? 'border-red-500/70' : 'border-white/10'}`}>
        <IconComponent size={20} color={hasError ? '#ef4444' : colors.textSecondary} />
        <TextInput
          className="flex-1 text-foreground text-base h-full ml-3"
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          {...textInputProps}
        />
      </View>
      {hasError && (
        <Text className="text-red-400 text-xs mt-1.5 ml-1">{error}</Text>
      )}
    </View>
  );
}
