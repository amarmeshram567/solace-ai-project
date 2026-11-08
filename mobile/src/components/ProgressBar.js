import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

const TONES = {
  forest: {
    track: '#E5EDE8', // Pale Sage Track
    fill: '#26362E',  // Deep Forest Green Fill
    border: '#D8E3DC',
  },
  sage: {
    track: '#F3EDE2',
    fill: '#526F60',
    border: '#E8E1D2',
  },
  sand: {
    track: '#FAF8F5',
    fill: '#715E41',
    border: '#EAE4D6',
  },
  coral: {
    track: '#FCECE8',
    fill: '#A83A2E',
    border: '#F2DDD5',
  },
  // Added for dark-background cards
  light: {
    track: 'rgba(255, 255, 255, 0.15)',
    fill: '#FAF8F5',
    border: 'rgba(255, 255, 255, 0.2)',
  },
};

export default function ProgressBar({
  progress = 0,
  tone = 'forest',
  height = 8,
  showLabel = false,
  label,
  className = '',
  style,
}) {
  const reduceMotion = useReducedMotion();

  // Normalize: handles both 0 - 1 (e.g. 0.45) and 0 - 100 (e.g. 45)
  const rawNum = Number(progress) || 0;
  const clamped = rawNum > 1 ? Math.min(1, rawNum / 100) : Math.min(1, Math.max(0, rawNum));

  const progressAnim = useSharedValue(0);
  const activeTone = TONES[tone] ?? TONES.forest;

  useEffect(() => {
    if (reduceMotion) {
      progressAnim.value = clamped;
    } else {
      progressAnim.value = withTiming(clamped, {
        duration: 850,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [clamped, reduceMotion]);

  // Smooth width percentage fill (fixed with proper multiplication)
  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  return (
    <View className={`w-full ${className}`} style={style}>
      {/* Optional Top Label & Dynamic Percentage */}
      {showLabel || label ? (
        <View className="flex-row items-center justify-between mb-1.5 px-0.5">
          {label ? (
            <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
              {label}
            </Text>
          ) : (
            <View />
          )}

          <Text className="text-[11px] font-bold text-[#26362E] font-mono">
            {Math.round(clamped * 100)}%
          </Text>
        </View>
      ) : null}

      {/* Main Progress Pill Track */}
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label || 'Progress'}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: activeTone.track,
          borderColor: activeTone.border,
          borderWidth: 1,
        }}
        className="w-full overflow-hidden relative"
      >
        {/* Animated Active Fill */}
        <Animated.View
          style={[
            fillStyle,
            {
              height: '100%',
              borderRadius: height / 2,
              backgroundColor: activeTone.fill,
            },
          ]}
          className="relative overflow-hidden"
        >
          {/* Subtle Top Glass/Gloss Sheen */}
          <View
            style={{ height: Math.max(1, height * 0.35) }}
            className="w-full bg-white/20 absolute top-0 left-0"
          />
        </Animated.View>
      </View>
    </View>
  );
}

cssInterop(ProgressBar, { className: 'style' });