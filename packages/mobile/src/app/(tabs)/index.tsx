import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Icons } from '../../shared/components/Icons';
import { useThemeColors } from '../../shared/hooks/useThemeColors';
import { useTabBarPadding } from '../../shared/hooks/useTabBarPadding';

/**
 * Scan Tab - Kamera-Scan oder Bild-Upload
 */
export default function ScanTab() {
  const colors = useThemeColors();
  const tabBarPadding = useTabBarPadding();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Berechtigung benötigt',
        'Bitte erlaube den Zugriff auf deine Fotos in den Einstellungen.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/analyze',
        params: { imageUri: encodeURIComponent(result.assets[0].uri) },
      });
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Berechtigung benötigt',
        'Bitte erlaube den Zugriff auf die Kamera in den Einstellungen.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/analyze',
        params: { imageUri: encodeURIComponent(result.assets[0].uri) },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-8" style={{ paddingBottom: tabBarPadding }}>
        <View className="gap-4">
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

          <Pressable
            onPress={pickImage}
            className="bg-background-card rounded-2xl p-6 border border-border active:bg-background-elevated"
          >
            <View className="items-center">
              <View className="mb-4">
                <Icons.Image size={48} color={colors.textSecondary} />
              </View>
              <Text className="text-foreground text-xl font-semibold mb-1">
                Galerie
              </Text>
              <Text className="text-foreground-secondary text-center">
                Wähle ein vorhandenes Bild
              </Text>
            </View>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}
