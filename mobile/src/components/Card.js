import React from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mapped Velora Serene Earthy Palette & Border Pairings
const VELORA_TONES = {
  white: {
    bg: '#FFFFFF',
    border: '#E8E2D6',
    shadow: 'rgba(38, 54, 46, 0.04)',
  },
  mint: {
    bg: '#E5EDE8', // Pale Sage
    border: '#D4E1D8',
    shadow: 'rgba(45, 70, 56, 0.06)',
  },
  sage: {
    bg: '#E5EDE8',
    border: '#D4E1D8',
    shadow: 'rgba(45, 70, 56, 0.06)',
  },
  warmYellow: {
    bg: '#F3EDE2', // Warm Sand / Oat
    border: '#E6DEC9',
    shadow: 'rgba(107, 87, 56, 0.06)',
  },
  sand: {
    bg: '#F3EDE2',
    border: '#E6DEC9',
    shadow: 'rgba(107, 87, 56, 0.06)',
  },
  lavender: {
    bg: '#EAEBF2', // Soft Muted Blue / Lavender
    border: '#D8DAE6',
    shadow: 'rgba(62, 69, 98, 0.06)',
  },
  coral: {
    bg: '#FBECE6', // Soft Terracotta Blush
    border: '#F2DDD5',
    shadow: 'rgba(122, 72, 57, 0.06)',
  },
  skyBlue: {
    bg: '#E7F0ED', // Misty Mint
    border: '#D5E3DE',
    shadow: 'rgba(40, 75, 65, 0.06)',
  },
  forest: {
    bg: '#26362E', // Deep Forest Green Hero
    border: '#33483E',
    shadow: 'rgba(38, 54, 46, 0.18)',
  },
};

export default function Card({
  tone = 'white',
  onPress,
  accessibilityLabel,
  accessibilityRole,
  children,
  style,
  className = '',
  padded = true,
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const selectedTone = VELORA_TONES[tone] ?? VELORA_TONES.white;

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const baseStyle = {
    backgroundColor: selectedTone.bg,
    borderColor: selectedTone.border,
    borderWidth: 1,
    borderRadius: 28,
    padding: padded ? 20 : 0,
    shadowColor: selectedTone.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  };

  if (!onPress) {
    return (
      <View
        style={[baseStyle, style]}
        className={`overflow-hidden ${className}`}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </View>
    );
  }

  const handlePressIn = () => {
    if (!reduceMotion) {
      scale.value = withSpring(0.982, {
        damping: 18,
        stiffness: 280,
        mass: 0.8,
      });
      opacity.value = withSpring(0.92, { damping: 18, stiffness: 280 });
    }
  };

  const handlePressOut = () => {
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
    Haptics.selectionAsync().catch(() => { });
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={accessibilityLabel}
      style={[baseStyle, pressAnimatedStyle, style]}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </AnimatedPressable>
  );
}

cssInterop(Card, { className: 'style' });