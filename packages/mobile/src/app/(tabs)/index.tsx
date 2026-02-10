import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Icons } from '../../shared/components/Icons';

/**
 * Scan Tab - Kamera-Scan oder Bild-Upload
 */
export default function ScanTab() {
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
      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold text-white mb-2">Scannen</Text>
        <Text className="text-gray-400 mb-8">
          Wähle eine Option um einen Gegenstand zu scannen
        </Text>

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
            className="bg-background-card rounded-2xl p-6 border border-gray-700 active:bg-background-elevated"
          >
            <View className="items-center">
              <View className="mb-4">
                <Icons.Image size={48} color="#9ca3af" />
              </View>
              <Text className="text-white text-xl font-semibold mb-1">
                Galerie
              </Text>
              <Text className="text-gray-400 text-center">
                Wähle ein vorhandenes Bild
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="mt-auto mb-24 bg-background-card rounded-xl p-4 border border-gray-800">
          <View className="flex-row items-center mb-2">
            <Icons.Lightbulb size={20} color="#fbbf24" strokeWidth={2.5} />
            <Text className="text-white font-semibold ml-2">Tipps für beste Ergebnisse:</Text>
          </View>
          <Text className="text-gray-400">• Gute Beleuchtung verwenden</Text>
          <Text className="text-gray-400">• Gegenstand mittig platzieren</Text>
          <Text className="text-gray-400">• Hintergrund sollte einfarbig sein</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
