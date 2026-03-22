import { useState } from 'react';
import { View, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface AvatarPickerProps {
  currentAvatarUrl?: string | null;
  onUploaded: (uri: string) => void;
  size?: number;
}

/**
 * Avatar-Picker — öffnet Kamera oder Galerie und gibt den lokalen URI zurück.
 * Der Upload zum Server erfolgt beim Speichern des Profil-Formulars.
 */
export function AvatarPicker({ currentAvatarUrl, onUploaded, size = 80 }: AvatarPickerProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);

  async function pickImage(source: 'camera' | 'gallery') {
    const permResult =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      Alert.alert(
        'Berechtigung benötigt',
        `Bitte erlaube den Zugriff auf ${source === 'camera' ? 'die Kamera' : 'deine Fotos'}.`
      );
      return;
    }

    setLoading(true);
    try {
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

      if (!result.canceled && result.assets[0]) {
        onUploaded(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Fehler', 'Bild konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  function handlePress() {
    Alert.alert('Avatar ändern', 'Wähle eine Quelle', [
      { text: 'Kamera', onPress: () => pickImage('camera') },
      { text: 'Galerie', onPress: () => pickImage('gallery') },
      { text: 'Abbrechen', style: 'cancel' },
    ]);
  }

  return (
    <Pressable onPress={handlePress} disabled={loading} className="items-center">
      <View
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="bg-primary/20 border-2 border-primary/40 items-center justify-center overflow-hidden"
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : currentAvatarUrl ? (
          <Image
            source={{ uri: currentAvatarUrl }}
            style={{ width: size, height: size }}
            resizeMode="cover"
          />
        ) : (
          <Icons.User size={size * 0.45} color={colors.primary} />
        )}
      </View>
      {/* Kamera-Icon Overlay */}
      <View
        className="absolute bottom-0 right-0 bg-primary rounded-full items-center justify-center"
        style={{ width: size * 0.32, height: size * 0.32 }}
      >
        <Icons.Camera size={size * 0.16} color="#fff" />
      </View>
    </Pressable>
  );
}
