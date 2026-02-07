/**
 * AuthInput Component
 * 
 * Styled input field for auth forms with icon support
 */

import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Icons } from '@/shared/components/Icons';

type IconName = 'mail' | 'lock' | 'user';

interface AuthInputProps extends Omit<TextInputProps, 'className'> {
  label: string;
  icon: IconName;
  disabled?: boolean;
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
  ...textInputProps 
}: AuthInputProps) {
  const IconComponent = Icons[iconMap[icon]];
  
  return (
    <View>
      <Text className="text-gray-300 mb-2 ml-1 text-sm font-medium">{label}</Text>
      <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-4 h-14">
        <IconComponent size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 text-white text-base h-full ml-3"
          placeholderTextColor="#6b7280"
          editable={!disabled}
          {...textInputProps}
        />
      </View>
    </View>
  );
}
