import { useRef, useEffect } from 'react';
import {
  View, Text, Modal, Pressable, Animated, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { ShareTargetSearch } from './ShareTargetSearch';
import { useShareItem } from '../hooks/useShareItem';
import type { ShareTarget } from '../types/sharing.types';

interface ShareSheetProps {
  visible: boolean;
  itemId: string;
  itemName: string;
  ownUserId: string;
  onClose: () => void;
  onShared?: () => void;
}

const SHEET_HEIGHT = Dimensions.get('window').height * 0.72;

/**
 * Bottom-Sheet zum Teilen eines Items mit einem User oder einer Gruppe.
 */
export function ShareSheet({ visible, itemId, itemName, ownUserId, onClose, onShared }: ShareSheetProps) {
  const colors = useThemeColors();
  const { share, sharing, error } = useShareItem();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      damping: 20,
      stiffness: 120,
    }).start();
  }, [visible, slideAnim]);

  async function handleSelect(target: ShareTarget) {
    try {
      await share(itemId, target.type, target.id, 'VIEW');
      onShared?.();
      onClose();
    } catch {
      // error shown inline via `error` state
    }
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* Backdrop */}
        <Pressable className="flex-1 bg-black/50" onPress={onClose} />

        {/* Sheet */}
        <Animated.View
          style={[{ height: SHEET_HEIGHT, transform: [{ translateY: slideAnim }] }]}
          className="bg-background rounded-t-3xl overflow-hidden"
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center px-4 pb-3 border-b border-border">
            <View className="flex-1">
              <Text className="text-foreground font-semibold text-base">Teilen</Text>
              <Text className="text-foreground-secondary text-xs mt-0.5" numberOfLines={1}>
                {itemName}
              </Text>
            </View>
            <Pressable onPress={onClose} className="w-8 h-8 items-center justify-center rounded-full bg-background-elevated">
              <Icons.Close size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Error banner */}
          {error ? (
            <View className="mx-4 mt-3 px-3 py-2 bg-red-500/10 rounded-xl">
              <Text className="text-red-500 text-xs">{error}</Text>
            </View>
          ) : null}

          {/* Search + list */}
          <View className="flex-1">
            {sharing ? (
              <View className="flex-1 items-center justify-center">
                <Icons.Share size={24} color={colors.primary} />
                <Text className="text-foreground-secondary text-sm mt-3">Wird geteilt…</Text>
              </View>
            ) : (
              <ShareTargetSearch ownUserId={ownUserId} onSelect={handleSelect} />
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
