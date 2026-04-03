import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  BackHandler,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView, AnimatePresence } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from './Icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useResolvedColorScheme } from '../store/themeStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ActionSheetItem {
  label: string;
  description?: string;
  icon: React.ReactNode;
  onPress: () => void;
  primary?: boolean;
}

interface AppActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: ActionSheetItem[];
}

export function AppActionSheet({ visible, onClose, title, items }: AppActionSheetProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const scheme = useResolvedColorScheme();

  useEffect(() => {
    if (visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });
      return () => backHandler.remove();
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.backdrop}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </MotiView>

          <MotiView
            from={{ translateY: SCREEN_HEIGHT }}
            animate={{ translateY: 0 }}
            exit={{ translateY: SCREEN_HEIGHT }}
            transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.8 }}
            style={[
              styles.sheet,
              {
                paddingBottom: insets.bottom + 24,
                backgroundColor:
                  scheme === 'dark' ? 'rgba(28, 28, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              },
            ]}
          >
            <BlurView intensity={80} tint={scheme} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: scheme === 'dark' ? '#3a3a3c' : '#d1d1d6' },
                ]}
              />
              <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            </View>

            <View style={styles.grid}>
              {items.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => { onClose(); item.onPress(); }}
                  style={({ pressed }) => [
                    styles.button,
                    item.primary
                      ? {
                          backgroundColor: colors.primary,
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderWidth: 1,
                        }
                      : {
                          backgroundColor:
                            scheme === 'dark'
                              ? 'rgba(255,255,255,0.06)'
                              : 'rgba(0,0,0,0.035)',
                          borderColor:
                            scheme === 'dark'
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(0,0,0,0.05)',
                          borderWidth: 1,
                        },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
                  ]}
                >
                  <View style={styles.buttonContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        item.primary
                          ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                          : { backgroundColor: 'rgba(0,0,0,0.02)' },
                      ]}
                    >
                      {item.icon}
                    </View>
                    <View style={styles.textContainer}>
                      <Text
                        style={[
                          styles.label,
                          {
                            color: item.primary
                              ? '#fff'
                              : scheme === 'dark'
                              ? '#fff'
                              : '#1c1c1e',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text
                          style={[
                            styles.description,
                            {
                              color: item.primary ? 'rgba(255,255,255,0.7)' : '#8e8e93',
                            },
                          ]}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <Icons.ChevronRight
                      size={18}
                      color={item.primary ? 'rgba(255,255,255,0.4)' : '#c7c7cc'}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    zIndex: 1001,
    paddingTop: 12,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: { elevation: 20 },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  grid: {
    gap: 12,
  },
  button: {
    borderRadius: 18,
    padding: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    marginTop: 1,
    fontWeight: '400',
  },
});
