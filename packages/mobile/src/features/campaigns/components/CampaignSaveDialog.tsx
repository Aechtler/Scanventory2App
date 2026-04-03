import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface CampaignSaveDialogProps {
  visible: boolean;
  selectedCount: number;
  onSave: (name: string, startsAt: string | null, endsAt: string | null) => void;
  onSelectMore: () => void;
  onCancel: () => void;
}

function parseDate(value: string): string | null {
  // Accept DD.MM.YYYY → convert to ISO date string
  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}`);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function CampaignSaveDialog({
  visible,
  selectedCount,
  onSave,
  onSelectMore,
  onCancel,
}: CampaignSaveDialogProps) {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [nameError, setNameError] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSave(
      name.trim(),
      startsAt ? parseDate(startsAt) : null,
      endsAt ? parseDate(endsAt) : null,
    );
    setName('');
    setStartsAt('');
    setEndsAt('');
    setNameError(false);
  };

  const handleSelectMore = () => {
    onSelectMore();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.sheet, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          {/* Handle */}
          <View className="w-10 h-1 rounded-full bg-border self-center mt-3 mb-4" />

          <Text className="text-foreground text-xl font-bold px-6 mb-1">
            Kampagne speichern
          </Text>
          <Text className="text-foreground-secondary text-sm px-6 mb-5">
            {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'} ausgewählt
          </Text>

          {/* Name */}
          <View className="px-6 mb-4">
            <Text className="text-foreground-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
              Name *
            </Text>
            <TextInput
              className={`bg-background-elevated/60 rounded-xl px-4 h-12 text-foreground text-[15px] border ${
                nameError ? 'border-red-500' : 'border-border'
              }`}
              placeholder="z.B. Comic-Con 2026"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={(t) => { setName(t); setNameError(false); }}
              autoFocus
              returnKeyType="next"
            />
            {nameError && (
              <Text className="text-red-400 text-xs mt-1">Bitte einen Namen eingeben</Text>
            )}
          </View>

          {/* Datum */}
          <View className="px-6 mb-6 flex-row gap-4">
            <View className="flex-1">
              <Text className="text-foreground-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                Von
              </Text>
              <TextInput
                className="bg-background-elevated/60 rounded-xl px-4 h-12 text-foreground text-[15px] border border-border"
                placeholder="TT.MM.JJJJ"
                placeholderTextColor={colors.textSecondary}
                value={startsAt}
                onChangeText={setStartsAt}
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
                maxLength={10}
              />
            </View>
            <View className="flex-1">
              <Text className="text-foreground-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                Bis
              </Text>
              <TextInput
                className="bg-background-elevated/60 rounded-xl px-4 h-12 text-foreground text-[15px] border border-border"
                placeholder="TT.MM.JJJJ"
                placeholderTextColor={colors.textSecondary}
                value={endsAt}
                onChangeText={setEndsAt}
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
                maxLength={10}
              />
            </View>
          </View>

          {/* Buttons */}
          <View className="px-6 pb-8 gap-3">
            <Pressable
              onPress={handleSave}
              className="h-12 rounded-xl bg-primary-500 items-center justify-center active:opacity-80"
            >
              <Text className="text-white font-semibold text-[16px]">Speichern</Text>
            </Pressable>
            <Pressable
              onPress={handleSelectMore}
              className="h-12 rounded-xl bg-background-elevated/60 border border-border items-center justify-center active:opacity-60"
            >
              <Text className="text-foreground font-medium text-[15px]">Weitere auswählen</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
});
