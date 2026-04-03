import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface CampaignActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  onViewAll: () => void;
}

export function CampaignActionSheet({
  visible,
  onClose,
  onCreateNew,
  onViewAll,
}: CampaignActionSheetProps) {
  const colors = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <View className="px-1 pb-1">
            <Text className="text-foreground-secondary text-xs font-medium uppercase tracking-widest px-4 pt-3 pb-2">
              Kampagnen
            </Text>

            <Pressable
              onPress={() => { onClose(); onCreateNew(); }}
              className="flex-row items-center gap-3 px-4 py-3.5 rounded-xl active:opacity-60"
            >
              <View className="w-9 h-9 rounded-full bg-primary-500/15 items-center justify-center">
                <Icons.Plus size={18} color={colors.primary} />
              </View>
              <View>
                <Text className="text-foreground font-semibold text-[15px]">Neue Kampagne</Text>
                <Text className="text-foreground-secondary text-[12px] mt-0.5">Items auswählen & speichern</Text>
              </View>
            </Pressable>

            <View className="h-px bg-border mx-4" />

            <Pressable
              onPress={() => { onClose(); onViewAll(); }}
              className="flex-row items-center gap-3 px-4 py-3.5 rounded-xl active:opacity-60"
            >
              <View className="w-9 h-9 rounded-full bg-background-elevated/80 items-center justify-center">
                <Icons.Flag size={18} color={colors.textSecondary} />
              </View>
              <View>
                <Text className="text-foreground font-semibold text-[15px]">Kampagnen ansehen</Text>
                <Text className="text-foreground-secondary text-[12px] mt-0.5">Alle gespeicherten Kampagnen</Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
});
