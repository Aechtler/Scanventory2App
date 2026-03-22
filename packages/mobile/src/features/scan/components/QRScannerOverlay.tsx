import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Icons } from '@/shared/components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.7;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

interface QRScannerOverlayProps {
  onClose: () => void;
  flashEnabled?: boolean;
  onToggleFlash?: () => void;
  hint?: string;
}

/**
 * Scanner-Rahmen mit Ecken-Markierungen und Steuerungsleiste
 */
export function QRScannerOverlay({
  onClose,
  flashEnabled = false,
  onToggleFlash,
  hint = 'Halte die Kamera auf einen QR-Code oder Barcode',
}: QRScannerOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Abgedunkelter Bereich */}
      <View style={styles.overlay} pointerEvents="none">
        {/* Oben */}
        <View style={styles.dimTop} />

        {/* Mitte: links, Rahmen, rechts */}
        <View style={styles.middleRow}>
          <View style={styles.dimSide} />
          {/* Transparenter Scan-Bereich */}
          <View style={styles.frame}>
            {/* Ecken */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.dimSide} />
        </View>

        {/* Unten */}
        <View style={styles.dimBottom} />
      </View>

      {/* Hinweistext */}
      <View style={styles.hintContainer} pointerEvents="none">
        <Text style={styles.hintText}>{hint}</Text>
      </View>

      {/* Steuerungsleiste oben */}
      <View style={styles.topBar} pointerEvents="box-none">
        <Pressable onPress={onClose} style={styles.iconButton} hitSlop={12}>
          <Icons.Close size={24} color="#ffffff" />
        </Pressable>

        {onToggleFlash && (
          <Pressable onPress={onToggleFlash} style={styles.iconButton} hitSlop={12}>
            <Icons.Flashlight
              size={24}
              color={flashEnabled ? '#facc15' : '#ffffff'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'column',
  },
  dimTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  dimSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  dimBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: '#ffffff',
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: '#ffffff',
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: '#ffffff',
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: '#ffffff',
    borderBottomRightRadius: 6,
  },
  hintContainer: {
    position: 'absolute',
    bottom: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.85,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
