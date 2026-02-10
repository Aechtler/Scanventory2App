import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Button - Wiederverwendbare Button-Komponente
 *
 * @example
 * <Button title="Scannen" onPress={handleScan} />
 * <Button title="Abbrechen" variant="outline" onPress={handleCancel} />
 */
export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyles = 'rounded-xl items-center justify-center flex-row';

  const variantStyles = {
    primary: 'bg-primary-500 active:bg-primary-600',
    secondary: 'bg-background-card active:bg-background-elevated',
    outline: 'bg-transparent border border-border active:bg-background-elevated',
    danger: 'bg-red-500/15 border border-red-500/30 active:bg-red-500/25',
  };

  const disabledStyles = 'opacity-50';

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const textColorStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-foreground-secondary',
    danger: 'text-red-400',
  };

  return (
    <Pressable
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${isDisabled ? disabledStyles : ''}`}
      disabled={isDisabled}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text className={`font-semibold ${textSizeStyles[size]} ${textColorStyles[variant]}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
