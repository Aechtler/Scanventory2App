import { View, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icons } from '@/shared/components/Icons';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface AvatarPickerProps {
  /** Anzeigebild — kann lokale URI oder Server-URL sein */
  currentAvatarUrl?: string | null;
  /** Aufgerufen wenn ein neues Bild gewählt wurde (lokale URI) oder Avatar entfernt wird (null) */
  onChanged: (localUri: string | null) => void;
  loading?: boolean;
  size?: number;
}

export function AvatarPicker({ currentAvatarUrl, onChanged, loading = false, size = 80 }: AvatarPickerProps) {
  const colors = useThemeColors();

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
      onChanged(result.assets[0].uri);
    }
  }

  function handlePress() {
    const options: Parameters<typeof Alert.alert>[2] = [
      { text: 'Kamera', onPress: () => pickImage('camera') },
      { text: 'Galerie', onPress: () => pickImage('gallery') },
    ];

    if (currentAvatarUrl) {
      options.push({
        text: 'Bild entfernen',
        style: 'destructive',
        onPress: () => onChanged(null),
      });
    }

    options.push({ text: 'Abbrechen', style: 'cancel' });

    Alert.alert('Profilbild ändern', 'Wähle eine Option', options);
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
      <View
        className="absolute bottom-0 right-0 bg-primary rounded-full items-center justify-center"
        style={{ width: size * 0.32, height: size * 0.32 }}
      >
        <Icons.Camera size={size * 0.16} color="#fff" />
      </View>
    </Pressable>
  );
}
