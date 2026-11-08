import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Bot } from 'lucide-react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

cssInterop(Bot, { className: 'style' });

const SINE_EASE = Easing.bezier(0.42, 0, 0.28, 1);

function BreathingDot({ delay, reduceMotion }) {
  const opacity = useSharedValue(reduceMotion ? 0.75 : 0.35);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.85);

  useEffect(() => {
    if (reduceMotion) return undefined;

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: SINE_EASE }),
          withTiming(0.35, { duration: 460, easing: SINE_EASE })
        ),
        -1,
        true
      )
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 420, easing: SINE_EASE }),
          withTiming(0, { duration: 460, easing: SINE_EASE })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.22, { duration: 420, easing: SINE_EASE }),
          withTiming(0.85, { duration: 460, easing: SINE_EASE })
        ),
        -1,
        true
      )
    );

    return () => {
      opacity.value = 0.35;
      translateY.value = 0;
      scale.value = 0.85;
    };
  }, [delay, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 6.5,
          height: 6.5,
          borderRadius: 999,
          backgroundColor: '#26362E',
        },
        animatedStyle,
      ]}
    />
  );
}

export default function TypingIndicator() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(240)}
      exiting={reduceMotion ? undefined : FadeOut.duration(180)}
      accessibilityLabel="Zen Monk is reflecting"
      accessibilityRole="progressbar"
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        marginVertical: 4,
      }}
    >
      {/* 1. Zen Monk Avatar Anchor */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#E5EDE8',
          borderColor: '#D1E0D6',
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
          marginTop: 1,
          flexShrink: 0,
          ...Platform.select({
            web: { boxShadow: '0 2px 6px rgba(38, 54, 46, 0.06)' },
            default: {
              shadowColor: '#26362E',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 2,
              elevation: 1,
            },
          }),
        }}
      >
        <Bot size={15} color="#26362E" strokeWidth={2.2} />
      </View>

      {/* 2. Dots Bubble Capsule */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderColor: '#E8E2D6',
          borderWidth: 1,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 20,
          borderTopLeftRadius: 4,
          gap: 6,
          ...Platform.select({
            web: {
              boxShadow: '0 3px 10px rgba(38, 54, 46, 0.06)',
            },
            default: {
              shadowColor: '#26362E',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            },
          }),
        }}
      >
        <BreathingDot delay={0} reduceMotion={reduceMotion} />
        <BreathingDot delay={160} reduceMotion={reduceMotion} />
        <BreathingDot delay={320} reduceMotion={reduceMotion} />
      </View>
    </Animated.View>
  );
}