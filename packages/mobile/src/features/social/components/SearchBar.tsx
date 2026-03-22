import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Suchfeld mit Clear-Button und Loading-Spinner.
 */
export function SearchBar({
  value,
  onChangeText,
  onClear,
  loading = false,
  placeholder = 'Suchen…',
  autoFocus = false,
}: SearchBarProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center bg-background-card border border-border rounded-2xl px-4 py-2.5 mx-4">
      <Icons.Search size={18} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 text-foreground text-base ml-2.5"
      />
      {loading && (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
      )}
      {!loading && value.length > 0 && (
        <Pressable onPress={onClear} className="ml-2 p-1 active:opacity-60">
          <Icons.Close size={16} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}
