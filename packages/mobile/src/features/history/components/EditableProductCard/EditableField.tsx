/**
 * EditableField - Inline-Edit: Text → TextInput mit Pencil-Icon
 * Tap auf Text/Icon → wird zu TextInput, blur/submit → onSave
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { EditableFieldProps } from './types';

export function EditableField({
  value,
  onSave,
  label,
  placeholder,
  textClassName = 'text-foreground text-xl font-bold',
  multiline = false,
}: EditableFieldProps) {
  const colors = useThemeColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<TextInput>(null);

  const handleStartEdit = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSave = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
  };

  if (editing) {
    return (
      <MotiView
        from={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 150 }}
      >
        {label && (
          <Text className="text-foreground-secondary text-xs mb-1">{label}</Text>
        )}
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline}
          className={`${textClassName} border-b border-primary-500 pb-1`}
          returnKeyType="done"
          blurOnSubmit
        />
      </MotiView>
    );
  }

  return (
    <Pressable onPress={handleStartEdit}>
      <MotiView
        from={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 150 }}
      >
        {label && (
          <Text className="text-foreground-secondary text-xs mb-1">{label}</Text>
        )}
        <View className="flex-row items-center gap-2">
          <Text className={`${textClassName} flex-1`}>
            {value || placeholder}
          </Text>
          <Icons.Pencil size={14} color={colors.textSecondary} />
        </View>
      </MotiView>
    </Pressable>
  );
}
