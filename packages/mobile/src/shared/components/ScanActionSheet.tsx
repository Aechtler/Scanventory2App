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
import { useUIStore } from '../store/uiStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useResolvedColorScheme } from '../store/themeStore';
import { useScanActions } from '../hooks/useScanActions';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Premium Bottom Sheet for Scan Actions
 * Replaces the direct navigation of the Camera tab
 */
export function ScanActionSheet() {
  const isVisible = useUIStore((s) => s.scanMenuVisible);
  const setVisible = useUIStore((s) => s.setScanMenuVisible);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const scheme = useResolvedColorScheme();
  const { openCamera, pickImage, openQRScanner, importItem } = useScanActions();

  // Handle Android back button
  useEffect(() => {
    if (isVisible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        setVisible(false);
        return true;
      });
      return () => backHandler.remove();
    }
  }, [isVisible]);

  const handleClose = () => setVisible(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Backdrop */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          </MotiView>

          {/* Sheet */}
          <MotiView
            from={{ translateY: SCREEN_HEIGHT }}
            animate={{ translateY: 0 }}
            exit={{ translateY: SCREEN_HEIGHT }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
              mass: 0.8,
            }}
            style={[
              styles.sheet,
              {
                paddingBottom: insets.bottom + 24,
                backgroundColor: scheme === 'dark' ? 'rgba(28, 28, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              },
            ]}
          >
            <BlurView intensity={80} tint={scheme} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
              <View style={[styles.handle, { backgroundColor: scheme === 'dark' ? '#3a3a3c' : '#d1d1d6' }]} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>Was möchtest du tun?</Text>
            </View>

            <View style={styles.grid}>
              <MenuButton
                icon={<Icons.Camera size={26} color="#ffffff" />}
                label="Kamera"
                description="Produkt direkt scannen"
                onPress={openCamera}
                primary
                color={colors.primary}
                scheme={scheme}
              />

              <MenuButton
                icon={<Icons.Image size={22} color={colors.textSecondary} />}
                label="Galerie"
                description="Foto aus Album wählen"
                onPress={pickImage}
                scheme={scheme}
              />

              <MenuButton
                icon={<Icons.QrCode size={22} color={colors.textSecondary} />}
                label="QR / Barcode"
                description="Code direkt erfassen"
                onPress={openQRScanner}
                scheme={scheme}
              />

              <MenuButton
                icon={<Icons.Package size={22} color={colors.textSecondary} />}
                label="Manuell hinzufügen"
                description="Demnächst verfügbar"
                onPress={importItem}
                scheme={scheme}
                disabled
              />
            </View>
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
}

function MenuButton({
  icon,
  label,
  description,
  onPress,
  primary = false,
  color,
  scheme,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onPress: () => void;
  primary?: boolean;
  color?: string;
  scheme?: 'light' | 'dark';
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary
            ? color
            : scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)',
          borderColor: primary
            ? 'rgba(255,255,255,0.1)'
            : scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          borderWidth: 1,
        },
        pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        disabled && { opacity: 0.4 },
      ]}
    >
      <View style={styles.buttonContent}>
        <View style={[
          styles.iconContainer,
          primary && { backgroundColor: 'rgba(255,255,255,0.2)' }
        ]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.label,
            { color: primary ? '#fff' : (scheme === 'dark' ? '#fff' : '#1c1c1e') }
          ]}>
            {label}
          </Text>
          {description && (
            <Text style={[
              styles.description,
              { color: primary ? 'rgba(255,255,255,0.7)' : '#8e8e93' }
            ]}>
              {description}
            </Text>
          )}
        </View>
        <Icons.ChevronRight size={18} color={primary ? 'rgba(255,255,255,0.4)' : '#c7c7cc'} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
      android: {
        elevation: 20,
      },
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
    backgroundColor: 'rgba(0,0,0,0.02)',
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
