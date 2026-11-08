import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Sparkles, Wind } from 'lucide-react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { useAuth } from '../src/auth/AuthContext';
import { isOnboardingComplete } from '../src/services/onboarding';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Wind, { className: 'style' });

const SPLASH_MS = 2400;

export default function Splash() {
  const reduceMotion = useReducedMotion();
  const { status, user } = useAuth();
  const [timerDone, setTimerDone] = useState(false);

  // Entrance shared values
  const opacity = useSharedValue(0);
  const ringScale1 = useSharedValue(reduceMotion ? 1 : 0.7);
  const ringScale2 = useSharedValue(reduceMotion ? 1 : 0.65);
  const coreScale = useSharedValue(reduceMotion ? 1 : 0.8);
  const textTranslateY = useSharedValue(reduceMotion ? 0 : 20);
  const taglineOpacity = useSharedValue(0);

  // Living continuous meditative pulse values
  const breathCycle = useSharedValue(1);
  const dotPulse = useSharedValue(1);
  const rotateAura = useSharedValue(0);

  useEffect(() => {
    // 1. Entrance Fade & Spring Sequence
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });

    if (!reduceMotion) {
      coreScale.value = withSpring(1, { damping: 14, stiffness: 120 });
      ringScale1.value = withDelay(140, withSpring(1, { damping: 15, stiffness: 100 }));
      ringScale2.value = withDelay(280, withSpring(1, { damping: 16, stiffness: 85 }));
      textTranslateY.value = withDelay(220, withSpring(0, { damping: 17, stiffness: 110 }));

      // Continuous Slow Rotation for Orbital Ring
      rotateAura.value = withRepeat(
        withTiming(360, { duration: 16000, easing: Easing.linear }),
        -1,
        false
      );

      // Continuous Meditative Breath Expansion
      breathCycle.value = withDelay(
        700,
        withRepeat(
          withSequence(
            withTiming(1.08, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        )
      );

      // Living Indicator Pulse
      dotPulse.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }

    taglineOpacity.value = withDelay(520, withTiming(1, { duration: 700 }));

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(coreScale);
      cancelAnimation(ringScale1);
      cancelAnimation(ringScale2);
      cancelAnimation(textTranslateY);
      cancelAnimation(rotateAura);
      cancelAnimation(breathCycle);
      cancelAnimation(dotPulse);
    };
  }, [opacity, ringScale1, ringScale2, coreScale, textTranslateY, taglineOpacity, reduceMotion]);

  // Animated Styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const coreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value * breathCycle.value }],
  }));

  const ring1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale1.value * (1 + (breathCycle.value - 1) * 0.7) }],
    opacity: 0.65 + (breathCycle.value - 1) * 2,
  }));

  const ring2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale2.value * (1 + (breathCycle.value - 1) * 0.5) }],
    opacity: 0.45 + (breathCycle.value - 1) * 1.5,
  }));

  const orbitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAura.value}deg` }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotPulse.value }],
  }));

  // Route Synchronization Lock
  useEffect(() => {
    const t = setTimeout(() => setTimerDone(true), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!timerDone || status === 'loading') return;
    let cancelled = false;

    (async () => {
      const onboarded = await isOnboardingComplete();
      if (cancelled) return;

      if (!onboarded) {
        router.replace('/onboarding');
      } else if (status === 'signedIn') {
        router.replace(user?.profileCompleted ? '/(tabs)' : '/profile-setup');
      } else {
        router.replace('/(auth)/login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [timerDone, status, user]);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Shell Container */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[44px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col items-center justify-between p-8">

        {/* Subtle Top Anchor */}
        <View className="h-6 w-full" />

        {/* Center Stage: Organic Halo & Breathing Emblem */}
        <Animated.View style={containerAnimatedStyle} className="items-center justify-center">

          <View className="w-64 h-64 items-center justify-center relative mb-8">
            {/* Outer Pale Sage Living Aura */}
            <Animated.View
              style={ring2AnimatedStyle}
              className="w-60 h-60 rounded-full bg-[#E5EDE8] border border-[#D7E4DC] absolute"
            />

            {/* Mid Celadon Halo */}
            <Animated.View
              style={ring1AnimatedStyle}
              className="w-44 h-44 rounded-full bg-[#C9DDD1] border border-[#B8D1C2] absolute"
            />

            {/* Gentle Orbit Ring */}
            <Animated.View
              style={orbitAnimatedStyle}
              className="w-36 h-36 rounded-full border border-dashed border-[#26362E]/20 absolute"
            />

            {/* Core Botanical Emblem */}
            <Animated.View
              style={coreAnimatedStyle}
              className="w-24 h-24 rounded-full bg-[#26362E] items-center justify-center shadow-2xl shadow-[#26362E]/35 relative z-10"
            >
              <View className="w-full h-full rounded-full border border-white/10 items-center justify-center">
                <Wind size={38} color="#FAF8F5" strokeWidth={1.9} />
              </View>
            </Animated.View>
          </View>

          {/* Title & Brand Wordmark */}
          <Animated.View style={textAnimatedStyle} className="items-center">
            <View className="flex-row items-center gap-1.5 mb-2 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D0DFD6]">
              <Sparkles size={11} color="#355243" />
              <Text className="text-[10px] uppercase tracking-[2.5px] font-bold text-[#355243]">
                Solace Space
              </Text>
            </View>

            <Text
              accessibilityRole="header"
              className="text-[36px] font-serif font-bold text-[#1C2520] tracking-tight text-center"
            >
              Solace AI
            </Text>
          </Animated.View>

          {/* Calming Tagline */}
          <Animated.Text
            style={taglineAnimatedStyle}
            className="text-xs text-[#707F77] text-center leading-relaxed font-normal mt-2.5 max-w-[250px]"
          >
            Find your calm. Discover yourself.
          </Animated.Text>
        </Animated.View>

        {/* Bottom Living Status Pill */}
        <Animated.View style={taglineAnimatedStyle} className="pb-4 items-center">
          <View className="flex-row items-center gap-2.5 bg-[#F3EDE2] border border-[#E7DFCE] px-4 py-2 rounded-full shadow-2xs">
            <View className="w-2.5 h-2.5 rounded-full bg-[#355243]/20 items-center justify-center">
              <Animated.View
                style={dotAnimatedStyle}
                className="w-1.5 h-1.5 rounded-full bg-[#26362E]"
              />
            </View>
            <Text className="text-[11px] font-medium text-[#5C4C34] tracking-wide">
              Entering your mindful sanctuary…
            </Text>
          </View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}