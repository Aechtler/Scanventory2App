import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface CampaignSaveDialogProps {
  visible: boolean;
  selectedCount: number;
  onSave: (name: string, startsAt: string | null, endsAt: string | null) => void;
  onSelectMore: () => void;
  onCancel: () => void;
}

function toISOString(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

function formatDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getMarkedDates(
  start: string,
  end: string | null,
  color: string,
): Record<string, object> {
  if (!end || start === end) {
    return {
      [start]: { startingDay: true, endingDay: true, color, textColor: '#fff' },
    };
  }
  const marked: Record<string, object> = {};
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  let cur = startMs;
  while (cur <= endMs) {
    const ds = new Date(cur).toISOString().split('T')[0];
    marked[ds] = {
      startingDay: cur === startMs,
      endingDay: cur === endMs,
      color,
      textColor: '#fff',
    };
    cur += 86_400_000;
  }
  return marked;
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
  const [nameError, setNameError] = useState(false);
  const [unlimited, setUnlimited] = useState(true);
  const [startDate, setStartDate] = useState<string>(getToday());
  const [endDate, setEndDate] = useState<string | null>(null);

  const handleDayPress = (day: DateData) => {
    if (endDate) {
      setStartDate(day.dateString);
      setEndDate(null);
    } else if (day.dateString < startDate) {
      setEndDate(startDate);
      setStartDate(day.dateString);
    } else {
      setEndDate(day.dateString);
    }
  };

  const handleToggleUnlimited = (value: boolean) => {
    setUnlimited(value);
    if (value) {
      setStartDate(getToday());
      setEndDate(null);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSave(
      name.trim(),
      unlimited ? null : toISOString(startDate),
      unlimited ? null : (endDate ? toISOString(endDate) : null),
    );
    setName('');
    setUnlimited(true);
    setStartDate(getToday());
    setEndDate(null);
    setNameError(false);
  };

  const markedDates = getMarkedDates(startDate, endDate, colors.primary);

  const dateLabel = endDate
    ? `${formatDisplay(startDate)} – ${formatDisplay(endDate)}`
    : formatDisplay(startDate);

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

          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-foreground text-xl font-bold px-6 mb-1">
              Kampagne speichern
            </Text>
            <Text className="text-foreground-secondary text-sm px-6 mb-5">
              {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'} ausgewählt
            </Text>

            {/* Name */}
            <View className="px-6 mb-5">
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
                returnKeyType="done"
              />
              {nameError && (
                <Text className="text-red-400 text-xs mt-1">Bitte einen Namen eingeben</Text>
              )}
            </View>

            {/* Datum */}
            <View className="px-6 mb-2">
              <Text className="text-foreground-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                Zeitraum
              </Text>
              <View
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundElevated }}
                className="rounded-xl border border-border overflow-hidden"
              >
                <View style={styles.toggleRow}>
                  <Text className="text-foreground text-[15px]">
                    {unlimited ? 'Unbegrenzt' : 'Datum auswählen'}
                  </Text>
                  <Switch
                    value={unlimited}
                    onValueChange={handleToggleUnlimited}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                    style={styles.switch}
                  />
                </View>
                {!unlimited && (
                  <>
                    <View style={{ borderTopWidth: 1, borderColor: colors.border }}>
                      <View
                        style={{ backgroundColor: colors.backgroundCard }}
                        className="px-4 py-2.5 border-b border-border"
                      >
                        <Text style={{ color: colors.primary }} className="text-[15px] font-medium text-center">
                          {dateLabel}
                        </Text>
                        {!endDate && (
                          <Text className="text-foreground-secondary text-xs text-center mt-0.5">
                            Tippe einen zweiten Tag für einen Zeitraum
                          </Text>
                        )}
                      </View>
                      <Calendar
                        current={startDate}
                        markingType="period"
                        markedDates={markedDates}
                        onDayPress={handleDayPress}
                        theme={{
                          backgroundColor: colors.backgroundCard,
                          calendarBackground: colors.backgroundCard,
                          textSectionTitleColor: colors.textSecondary,
                          todayTextColor: colors.primary,
                          dayTextColor: colors.textPrimary,
                          textDisabledColor: colors.border,
                          arrowColor: colors.primary,
                          monthTextColor: colors.textPrimary,
                          textDayFontSize: 14,
                          textMonthFontSize: 15,
                          textDayHeaderFontSize: 12,
                        }}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Buttons */}
            <View className="px-6 pt-4 pb-8 gap-3">
              <Pressable
                onPress={handleSave}
                className="h-12 rounded-xl bg-primary-500 items-center justify-center active:opacity-80"
              >
                <Text className="text-white font-semibold text-[16px]">Speichern</Text>
              </Pressable>
              <Pressable
                onPress={onCancel}
                className="h-12 rounded-xl bg-background-elevated/60 border border-border items-center justify-center active:opacity-60"
              >
                <Text className="text-foreground font-medium text-[15px]">Abbrechen</Text>
              </Pressable>
            </View>
          </ScrollView>
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
    maxHeight: '90%',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
});
