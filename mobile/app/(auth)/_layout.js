import React, { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { useAuth } from '../../src/auth/AuthContext';

// Dedicated Mindful Organic Pulsing Loader
function MindfulAuthLoading() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.35);

  useEffect(() => {
    // Gentle meditative breathing cycle (4s cycle: 2s in, 2s out)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.65, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 2000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      true
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        withTiming(0.4, { duration: 2000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const emblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View className="flex-1 bg-[#F9F7F2] items-center justify-center relative">
      <StatusBar style="dark" />

      {/* Subtle Ambient Background Gradients */}
      <View className="absolute top-1/4 -right-16 w-72 h-72 rounded-full bg-[#E3ECE6]/40 blur-3xl pointer-events-none" />
      <View className="absolute bottom-1/4 -left-16 w-72 h-72 rounded-full bg-[#E5DFD4]/50 blur-3xl pointer-events-none" />

      {/* Expanding Ripple Ring */}
      <Animated.View
        style={ringStyle}
        className="w-24 h-24 rounded-full border border-[#8FA89B] absolute"
      />

      {/* Main Breathing Emblem */}
      <Animated.View
        style={emblemStyle}
        className="w-16 h-16 rounded-full bg-[#FAF8F5] items-center justify-center shadow-lg shadow-[#26362E]/10 border border-[#E5DFD3]"
      >
        <Ionicons name="leaf-outline" size={28} color="#26362E" />
      </Animated.View>

      {/* Serene Brand Label */}
      <View className="mt-8 items-center">
        <Text className="text-[11px] uppercase tracking-[4px] font-semibold text-[#4A5750]">
          Solace
        </Text>
        <Text className="text-xs text-[#8A9790] mt-1 font-normal tracking-wide">
          Centering your space...
        </Text>
      </View>
    </View>
  );
}

// Signed-in users never see auth screens; they are sent to their appropriate flow.
export default function AuthLayout() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <MindfulAuthLoading />;
  }

  if (status === 'signedIn') {
    return <Redirect href={user?.profileCompleted ? '/(tabs)' : '/profile-setup'} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F9F7F2' },
          animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
          animationDuration: 280,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="signup" options={{ animation: 'fade' }} />
        <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}