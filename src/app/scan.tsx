import { View, Text, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

/**
 * Scan Screen - Ermöglicht Kamera-Scan oder Bild-Upload
 *
 * Phase 1: Nur Bild-Upload für Testzwecke
 * Phase 2: Kamera-Integration
 */
export default function ScanScreen() {
  // Bild aus Galerie auswählen
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
      // Navigation zum Analyse-Screen mit Bild
      router.push({
        pathname: '/analyze',
        params: { imageUri: encodeURIComponent(result.assets[0].uri) },
      });
    }
  };

  // Kamera öffnen
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
      // Navigation zum Analyse-Screen mit Bild
      router.push({
        pathname: '/analyze',
        params: { imageUri: encodeURIComponent(result.assets[0].uri) },
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Scannen',
          headerBackTitle: 'Zurück',
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        <View className="flex-1 px-6 pt-8">
          {/* Beschreibung */}
          <Text className="text-gray-400 text-center mb-8">
            Wähle eine Option um einen Gegenstand zu scannen
          </Text>

          {/* Scan Optionen */}
          <View className="gap-4">
            <Pressable
              onPress={openCamera}
              className="bg-primary-500 rounded-2xl p-6 active:bg-primary-600"
            >
              <View className="items-center">
                <Text className="text-5xl mb-4">📷</Text>
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
              className="bg-background-card rounded-2xl p-6 border border-gray-700 active:bg-background-elevated"
            >
              <View className="items-center">
                <Text className="text-5xl mb-4">🖼️</Text>
                <Text className="text-white text-xl font-semibold mb-1">
                  Galerie
                </Text>
                <Text className="text-gray-400 text-center">
                  Wähle ein vorhandenes Bild
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Tipps */}
          <View className="mt-auto mb-8 bg-background-card rounded-xl p-4">
            <Text className="text-white font-semibold mb-2">💡 Tipps für beste Ergebnisse:</Text>
            <Text className="text-gray-400">• Gute Beleuchtung verwenden</Text>
            <Text className="text-gray-400">• Gegenstand mittig platzieren</Text>
            <Text className="text-gray-400">• Hintergrund sollte einfarbig sein</Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
