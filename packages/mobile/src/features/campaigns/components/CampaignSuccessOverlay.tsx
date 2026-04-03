import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Icons } from '@/shared/components/Icons';

interface CampaignSuccessOverlayProps {
  visible: boolean;
  campaignName: string;
  itemCount: number;
  onDone: () => void;
}

const { width } = Dimensions.get('window');

export function CampaignSuccessOverlay({
  visible,
  campaignName,
  itemCount,
  onDone,
}: CampaignSuccessOverlayProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconRotate = useSharedValue(-20);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    // Backdrop einblenden
    backdropOpacity.value = withTiming(1, { duration: 200 });

    // Card: spring rein, kurz warten, dann wegfaden
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 150 });
    iconRotate.value = withSpring(0, { damping: 10, stiffness: 120 });

    // Nach 2s ausblenden und fertig
    scale.value = withSequence(
      withSpring(1, { damping: 14, stiffness: 180 }),
      withDelay(1800, withSpring(0.85, { damping: 14, stiffness: 200 })),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(1800, withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }, (finished) => {
        if (finished) runOnJS(onDone)();
      })),
    );
    backdropOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1800, withTiming(0, { duration: 300 })),
    );
  }, [visible]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      <View style={styles.center}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Bag-Icon mit Bounce */}
          <Animated.View style={[styles.iconWrap, iconStyle]}>
            <Icons.Flag size={40} color="#fff" />
          </Animated.View>

          {/* Konfetti-Punkte */}
          <View style={styles.dots}>
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }]}
              />
            ))}
          </View>

          <Text style={styles.title}>Kampagne gespeichert!</Text>
          <Text style={styles.name} numberOfLines={2}>{campaignName}</Text>
          <Text style={styles.sub}>
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'} gepackt
          </Text>

          <View style={styles.hint}>
            <Icons.Flag size={11} color="rgba(255,255,255,0.5)" />
            <Text style={styles.hintText}>Unter Kampagnen abrufbar</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const DOT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#a78bfa'];

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  card: {
    width: width - 80,
    backgroundColor: '#1a1a2e',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  name: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  sub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 20,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});
