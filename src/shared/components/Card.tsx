import { View, ViewProps } from 'react-native';
import { ReactNode } from 'react';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: 'default' | 'elevated';
}

/**
 * Card - Container-Komponente für Inhalte
 *
 * @example
 * <Card>
 *   <Text>Inhalt</Text>
 * </Card>
 */
export function Card({
  children,
  variant = 'default',
  className = '',
  ...viewProps
}: CardProps) {
  const baseStyles = 'rounded-xl p-4';

  const variantStyles = {
    default: 'bg-background-card',
    elevated: 'bg-background-elevated border border-gray-700',
  };

  return (
    <View
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...viewProps}
    >
      {children}
    </View>
  );
}
