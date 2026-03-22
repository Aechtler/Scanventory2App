/**
 * StatusBanner – Wiederverwendbare Inline-Meldung für Warnungen, Fehler, Info & Erfolg.
 *
 * @example
 * <StatusBanner
 *   variant="warning"
 *   title="Perplexity API-Token abgelaufen"
 *   message="Bitte erneuere deinen Token in den Einstellungen."
 *   action={{ label: 'Einstellungen', onPress: () => router.push('/settings') }}
 *   onDismiss={() => setDismissed(true)}
 * />
 */

import { View, Text, Pressable } from 'react-native';
import { Icons } from '@/shared/components/Icons';
import { BounceInView } from '@/shared/components/Animated';

export type StatusBannerVariant = 'warning' | 'error' | 'info' | 'success';

export interface StatusBannerAction {
  label: string;
  onPress: () => void;
}

export interface StatusBannerProps {
  variant?: StatusBannerVariant;
  title: string;
  message?: string;
  action?: StatusBannerAction;
  onDismiss?: () => void;
  className?: string;
}

interface VariantStyle {
  container: string;
  icon: string;
  title: string;
  message: string;
  actionBg: string;
  actionText: string;
}

const VARIANT_STYLES: Record<StatusBannerVariant, VariantStyle> = {
  warning: {
    container: 'bg-amber-500/15 border border-amber-500/40',
    icon: '#f59e0b',
    title: 'text-amber-400',
    message: 'text-amber-300/80',
    actionBg: 'bg-amber-500/25 active:bg-amber-500/40',
    actionText: 'text-amber-300',
  },
  error: {
    container: 'bg-red-500/15 border border-red-500/40',
    icon: '#f87171',
    title: 'text-red-400',
    message: 'text-red-300/80',
    actionBg: 'bg-red-500/25 active:bg-red-500/40',
    actionText: 'text-red-300',
  },
  info: {
    container: 'bg-blue-500/15 border border-blue-500/40',
    icon: '#60a5fa',
    title: 'text-blue-400',
    message: 'text-blue-300/80',
    actionBg: 'bg-blue-500/25 active:bg-blue-500/40',
    actionText: 'text-blue-300',
  },
  success: {
    container: 'bg-green-500/15 border border-green-500/40',
    icon: '#4ade80',
    title: 'text-green-400',
    message: 'text-green-300/80',
    actionBg: 'bg-green-500/25 active:bg-green-500/40',
    actionText: 'text-green-300',
  },
};

const VARIANT_ICONS: Record<StatusBannerVariant, (color: string) => JSX.Element> = {
  warning: (color) => <Icons.Warning size={18} color={color} />,
  error:   (color) => <Icons.Warning size={18} color={color} />,
  info:    (color) => <Icons.Info    size={18} color={color} />,
  success: (color) => <Icons.Check   size={18} color={color} />,
};

export function StatusBanner({
  variant = 'warning',
  title,
  message,
  action,
  onDismiss,
  className = '',
}: StatusBannerProps) {
  const s = VARIANT_STYLES[variant];

  return (
    <BounceInView>
      <View className={`rounded-xl p-4 ${s.container} ${className}`}>
        {/* Header-Zeile: Icon + Titel + Dismiss */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 gap-2">
            {VARIANT_ICONS[variant](s.icon)}
            <Text className={`font-semibold text-sm flex-1 ${s.title}`} numberOfLines={2}>
              {title}
            </Text>
          </View>
          {onDismiss && (
            <Pressable onPress={onDismiss} hitSlop={8} className="ml-2">
              <Icons.Close size={16} color={s.icon} />
            </Pressable>
          )}
        </View>

        {/* Optionale Beschreibung */}
        {message ? (
          <Text className={`mt-1 text-xs leading-5 ${s.message}`}>{message}</Text>
        ) : null}

        {/* Optionaler Action-Button */}
        {action ? (
          <Pressable
            onPress={action.onPress}
            className={`mt-3 self-start rounded-lg px-3 py-1.5 ${s.actionBg}`}
          >
            <Text className={`text-xs font-semibold ${s.actionText}`}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </BounceInView>
  );
}
