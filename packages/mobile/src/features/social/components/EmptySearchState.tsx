import { View, Text } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface EmptySearchStateProps {
  type: 'idle' | 'empty' | 'error';
  query?: string;
}

/**
 * Leerer / Fehler-State für die Suche.
 */
export function EmptySearchState({ type, query }: EmptySearchStateProps) {
  const colors = useThemeColors();

  if (type === 'idle') {
    return (
      <View className="flex-1 items-center justify-center px-8 pt-16">
        <Icons.Search size={48} color={colors.textSecondary} />
        <Text className="text-foreground text-lg font-semibold mt-4 text-center">
          Finde Freunde
        </Text>
        <Text className="text-foreground-secondary text-sm mt-2 text-center leading-5">
          Suche nach Usernamen oder Namen, um anderen zu folgen und ihre Bibliothek zu sehen.
        </Text>
      </View>
    );
  }

  if (type === 'empty') {
    return (
      <View className="flex-1 items-center justify-center px-8 pt-16">
        <Icons.User size={48} color={colors.textSecondary} />
        <Text className="text-foreground text-lg font-semibold mt-4 text-center">
          Niemanden gefunden
        </Text>
        <Text className="text-foreground-secondary text-sm mt-2 text-center">
          Kein Ergebnis für „{query}"
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8 pt-16">
      <Icons.Warning size={48} color={colors.textSecondary} />
      <Text className="text-foreground text-lg font-semibold mt-4 text-center">
        Suche fehlgeschlagen
      </Text>
      <Text className="text-foreground-secondary text-sm mt-2 text-center">
        Bitte überprüfe deine Verbindung.
      </Text>
    </View>
  );
}
