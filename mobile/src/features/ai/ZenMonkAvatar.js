import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Ellipse,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { cssInterop } from 'nativewind';

export default function ZenMonkAvatar({ size = 56, animated = true }) {
  const reduceMotion = useReducedMotion();
  const floatY = useSharedValue(0);
  const breathScale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion || !animated) return undefined;

    // Smooth Inhale/Exhale Sine Wave Loop
    floatY.value = withRepeat(
      withSequence(
        withTiming(-3.5, { duration: 2200, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(0, { duration: 2200, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    );

    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 2200, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(1, { duration: 2200, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    );

    return () => {
      floatY.value = 0;
      breathScale.value = 1;
    };
  }, [floatY, breathScale, reduceMotion, animated]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: breathScale.value },
    ],
  }));

  return (
    <Animated.View
      style={floatStyle}
      className="items-center justify-center relative"
      accessibilityLabel="Zen Monk, your mindful companion"
      accessibilityRole="image"
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* Subtle Robe Gradient */}
          <LinearGradient id="zenRobeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#31463C" />
            <Stop offset="100%" stopColor="#26362E" />
          </LinearGradient>

          {/* Gentle Halo Gradient */}
          <LinearGradient id="zenAuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E5EDE8" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#D2E1D7" stopOpacity="0.5" />
          </LinearGradient>
        </Defs>

        {/* 1. Outer Concentric Halo Rings */}
        <Circle cx="50" cy="50" r="48" fill="url(#zenAuraGrad)" />
        <Circle cx="50" cy="50" r="46.5" stroke="#C9DDD1" strokeWidth="1" fill="none" opacity={0.6} />
        <Circle cx="50" cy="50" r="40" fill="#FAF8F5" opacity={0.85} />

        {/* 2. Head Halo Arc (Quiet Glow) */}
        <Circle
          cx="50"
          cy="40"
          r="23"
          stroke="#8FA89B"
          strokeWidth="1.6"
          strokeDasharray="4 2"
          fill="none"
          opacity={0.65}
        />

        {/* 3. Mindful Robe / Body (Deep Forest Green) */}
        <Path
          d="M24 94 Q50 54 76 94 Z"
          fill="url(#zenRobeGrad)"
        />

        {/* Robe Fold Trim (Warm Sand) */}
        <Path
          d="M44 70 L50 78 L56 70"
          stroke="#F3EDE2"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.9}
        />

        {/* 4. Head & Face */}
        <Circle cx="50" cy="40" r="17.5" fill="#F4DECD" />

        {/* Mindful Closed Peaceful Eyes (Gentle Arcs) */}
        <Path
          d="M42 40.5 Q44.5 43 47 40.5"
          stroke="#26362E"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M53 40.5 Q55.5 43 58 40.5"
          stroke="#26362E"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Serene Smile */}
        <Path
          d="M46.5 47.5 Q50 50.5 53.5 47.5"
          stroke="#26362E"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Soft Terracotta Blush Cheeks */}
        <Ellipse cx="39.5" cy="46" rx="2.8" ry="1.8" fill="#E8A598" opacity={0.55} />
        <Ellipse cx="60.5" cy="46" rx="2.8" ry="1.8" fill="#E8A598" opacity={0.55} />

        {/* 5. Brow Mindfulness Dot / Bindi */}
        <Circle cx="50" cy="33.5" r="1.1" fill="#8FA89B" />
      </Svg>
    </Animated.View>
  );
}