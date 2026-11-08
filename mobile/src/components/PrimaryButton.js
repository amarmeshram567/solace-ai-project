import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cssInterop } from 'nativewind';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BUTTON_VARIANTS = {
  primary: {
    container: 'bg-[#26362E] border border-[#202E27] shadow-lg shadow-[#26362E]/25',
    text: 'text-[#FAF8F5]',
    spinner: '#FAF8F5',
  },
  secondary: {
    container: 'bg-[#E5EDE8] border border-[#D1E0D6] active:bg-[#D9E5DC]',
    text: 'text-[#26362E]',
    spinner: '#26362E',
  },
  sand: {
    container: 'bg-[#F3EDE2] border border-[#E5DDCB] active:bg-[#EAE1D0]',
    text: 'text-[#4A3D29]',
    spinner: '#4A3D29',
  },
  outline: {
    container: 'bg-white border border-[#DCD5C5] active:bg-[#FAF8F5]',
    text: 'text-[#26362E]',
    spinner: '#26362E',
  },
  destructive: {
    container: 'bg-[#FAF4F2] border border-[#F2DDD5] active:bg-[#FBECE6]',
    text: 'text-[#A83A2E]',
    spinner: '#A83A2E',
  },
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'right',
  accessibilityHint,
  className = '',
  style,
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const selectedVariant = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isDisabled) return;
    if (!reduceMotion) {
      scale.value = withSpring(0.975, {
        damping: 18,
        stiffness: 280,
        mass: 0.8,
      });
      opacity.value = withSpring(0.94, { damping: 18, stiffness: 280 });
    }
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    if (!reduceMotion) {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 280,
        mass: 0.8,
      });
      opacity.value = withSpring(1, { damping: 18, stiffness: 280 });
    }
  };

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.selectionAsync().catch(() => { });
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style]}
      className={`h-[54px] w-full rounded-full flex-row items-center justify-center px-6 transition-all ${selectedVariant.container
        } ${isDisabled ? 'opacity-40 shadow-none' : ''
        } ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={selectedVariant.spinner} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {Icon && iconPosition === 'left' ? (
            <Icon size={16} color={variant === 'primary' ? '#FAF8F5' : '#26362E'} />
          ) : null}

          <Text
            className={`text-sm font-semibold tracking-wide text-center ${selectedVariant.text}`}
          >
            {label}
          </Text>

          {Icon && iconPosition === 'right' ? (
            <Icon size={16} color={variant === 'primary' ? '#FAF8F5' : '#26362E'} />
          ) : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

cssInterop(PrimaryButton, { className: 'style' });