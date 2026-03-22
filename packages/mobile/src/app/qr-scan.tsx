import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QRScannerOverlay } from '../features/scan/components/QRScannerOverlay';
import { useQRScanner } from '../features/scan/hooks/useQRScanner';

/**
 * QR-Code / Barcode Scanner Screen
 * Unterstützt EAN, UPC, QR-Codes und weitere Formate
 */
export default function QRScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const { scanned, handleScan, reset } = useQRScanner();

  const onBarcodeScanned = useCallback(
    (event: { type: string; data: string }) => {
      const result = handleScan(event);
      if (!result) return;

      // Kurz warten, damit der User die Scan-Bestätigung sehen kann
      setTimeout(() => {
        router.replace({
          pathname: '/analyze',
          params: {
            searchQuery: encodeURIComponent(result.searchQuery),
            gtin: result.gtin ?? '',
            scanLabel: encodeURIComponent(result.label),
          },
        });
      }, 300);
    },
    [handleScan]
  );

  // Berechtigungen noch nicht geladen
  if (!permission) {
    return <View style={styles.container} />;
  }

  // Keine Kamera-Berechtigung
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Kamera-Zugriff benötigt</Text>
          <Text style={styles.permissionText}>
            Um QR-Codes und Barcodes zu scannen, wird die Kamera benötigt.
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Berechtigung erteilen</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Abbrechen</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Kamera-View mit Barcode-Scanner */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashEnabled}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'qr',
            'code128',
            'code39',
            'itf14',
            'datamatrix',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
      />

      {/* Scanner-Overlay (Rahmen + Steuerung) */}
      <QRScannerOverlay
        onClose={() => router.back()}
        flashEnabled={flashEnabled}
        onToggleFlash={() => setFlashEnabled((prev) => !prev)}
        hint={
          scanned
            ? 'Produkt wird gesucht…'
            : 'Halte die Kamera auf einen QR-Code oder Barcode'
        }
      />

      {/* "Erneut scannen" Button – erscheint nach einem Scan */}
      {scanned && (
        <View style={styles.rescanContainer}>
          <Pressable style={styles.rescanButton} onPress={reset}>
            <Text style={styles.rescanText}>Erneut scannen</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  permissionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
  rescanContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rescanButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  rescanText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
});
