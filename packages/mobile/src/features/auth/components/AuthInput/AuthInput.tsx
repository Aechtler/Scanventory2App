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
    <View className="mb-4">
      <View className={`flex-row items-center bg-white/5 border rounded-2xl px-5 h-14 ${hasError ? 'border-red-500/50' : 'border-white/10'}`}>
        <IconComponent size={18} color={hasError ? '#ef4444' : colors.textSecondary} />
        <TextInput
          className="flex-1 text-white text-base h-full ml-4"
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          placeholder={label}
          {...textInputProps}
        />
      </View>
      {hasError && (
        <Text className="text-red-400 text-[10px] mt-1 ml-4 uppercase tracking-tighter">{error}</Text>
      )}
    </View>
  );
}
