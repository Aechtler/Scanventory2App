import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icons } from '../../shared/components/Icons';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';
import { useScanActions } from '../../shared/hooks/useScanActions';

/**
 * Scan Tab - Kamera-Scan, Bild-Upload oder QR/Barcode-Scan
 */
export default function ScanTab() {
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();
  const { openCamera, pickImage, openQRScanner } = useScanActions();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-8" style={{ paddingBottom: tabBarPadding }}>
        <View className="gap-4">
          {/* Kamera – primäre Aktion */}
          <Pressable
            onPress={openCamera}
            className="bg-primary-500 rounded-2xl p-6 active:bg-primary-600"
          >
            <View className="items-center">
              <View className="mb-4">
                <Icons.Camera size={48} color="#ffffff" />
              </View>
              <Text className="text-white text-xl font-semibold mb-1">
                Kamera
              </Text>
              <Text className="text-primary-200 text-center">
                Fotografiere den Gegenstand direkt
              </Text>
            </View>
          </Pressable>

          {/* Zweite Reihe: Galerie + QR nebeneinander */}
          <View className="flex-row gap-4">
            <Pressable
              onPress={pickImage}
              className="flex-1 bg-background-card rounded-2xl p-5 border border-border active:bg-background-elevated"
            >
              <View className="items-center">
                <View className="mb-3">
                  <Icons.Image size={36} color={colors.textSecondary} />
                </View>
                <Text className="text-foreground text-base font-semibold mb-1">
                  Galerie
                </Text>
                <Text className="text-foreground-secondary text-xs text-center">
                  Vorhandenes Bild wählen
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={openQRScanner}
              className="flex-1 bg-background-card rounded-2xl p-5 border border-border active:bg-background-elevated"
            >
              <View className="items-center">
                <View className="mb-3">
                  <Icons.QrCode size={36} color={colors.textSecondary} />
                </View>
                <Text className="text-foreground text-base font-semibold mb-1">
                  QR / Barcode
                </Text>
                <Text className="text-foreground-secondary text-xs text-center">
                  EAN, QR-Code scannen
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
