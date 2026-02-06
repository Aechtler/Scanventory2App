/**
 * EditableTag - Tappbare Tag-Pill mit Inline-Edit oder Preset-Chips
 * Tap → TextInput inline ODER Preset-Chips (z.B. Zustand)
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { EditableTagProps } from './types';

export function EditableTag({ value, onSave, presets }: EditableTagProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<TextInput>(null);

  const handleStartEdit = () => {
    setDraft(value);
    setEditing(true);
    if (!presets) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSave = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
  };

  const handlePresetSelect = (preset: string) => {
    setEditing(false);
    if (preset !== value) {
      onSave(preset);
    }
  };

  if (editing && presets) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 200 }}
        className="flex-row flex-wrap gap-2"
      >
        {presets.map((preset) => (
          <Pressable key={preset} onPress={() => handlePresetSelect(preset)}>
            <View
              className={`px-3 py-1.5 rounded-full border ${
                preset === value
                  ? 'bg-primary-500/30 border-primary-500'
                  : 'bg-gray-700/50 border-gray-600'
              }`}
            >
              <Text
                className={`text-sm ${
                  preset === value ? 'text-primary-400 font-semibold' : 'text-gray-200'
                }`}
              >
                {preset}
              </Text>
            </View>
          </Pressable>
        ))}
        <Pressable onPress={() => setEditing(false)}>
          <View className="px-3 py-1.5 rounded-full border border-gray-700">
            <Text className="text-gray-400 text-sm">Abbrechen</Text>
          </View>
        </Pressable>
      </MotiView>
    );
  }

  if (editing) {
    return (
      <MotiView
        from={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 150 }}
      >
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          placeholderTextColor="#6b7280"
          className="text-gray-200 text-sm bg-gray-700/50 px-3 py-1.5 rounded-full border border-primary-500"
          returnKeyType="done"
          blurOnSubmit
        />
      </MotiView>
    );
  }

  return (
    <Pressable onPress={handleStartEdit}>
      <View className="bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600">
        <Text className="text-gray-200 text-sm">{value}</Text>
      </View>
    </Pressable>
  );
}
