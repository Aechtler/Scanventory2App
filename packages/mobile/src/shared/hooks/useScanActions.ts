import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUIStore } from '../store/uiStore';

/**
 * Hook for shared scan and upload actions
 */
export function useScanActions() {
  const router = useRouter();
  const setScanMenuVisible = useUIStore((s) => s.setScanMenuVisible);

  const closeMenu = () => setScanMenuVisible(false);

  const pickImage = async () => {
    closeMenu();
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
    closeMenu();
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

  const openQRScanner = () => {
    closeMenu();
    router.push('/qr-scan');
  };

  const importItem = () => {
    // Coming soon
    Alert.alert('Coming Soon', 'Diese Funktion wird in Kürze verfügbar sein.');
  };

  return {
    pickImage,
    openCamera,
    openQRScanner,
    importItem,
    closeMenu,
  };
}
