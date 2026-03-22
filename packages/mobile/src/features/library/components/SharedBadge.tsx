import { View } from 'react-native';
import { Icons } from '@/shared/components/Icons';

interface SharedBadgeProps {
  size?: number;
}

/**
 * Kleines Share-Icon-Badge — erscheint auf bereits geteilten Items.
 */
export function SharedBadge({ size = 14 }: SharedBadgeProps) {
  return (
    <View
      className="bg-primary/90 rounded-full items-center justify-center"
      style={{ width: size + 4, height: size + 4 }}
    >
      <Icons.Share size={size - 2} color="#fff" />
    </View>
  );
}
