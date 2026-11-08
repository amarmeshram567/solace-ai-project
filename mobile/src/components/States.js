import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Wind,
} from 'lucide-react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import PrimaryButton from './PrimaryButton';

cssInterop(AlertTriangle, { className: 'style' });
cssInterop(RotateCcw, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(ChevronRight, { className: 'style' });
cssInterop(Wind, { className: 'style' });

export function LoadingState({
  message = 'Gathering mindful presence…',
  compact = false,
}) {
  const reduceMotion = useReducedMotion();
  const auraScale = useSharedValue(1);
  const auraOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (reduceMotion) return;
    auraScale.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 1600, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(1, { duration: 1600, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    );
    auraOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1600 }),
        withTiming(0.4, { duration: 1600 })
      ),
      -1,
      true
    );
  }, [reduceMotion]);

  const auraAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: auraScale.value }],
    opacity: auraOpacity.value,
  }));

  if (compact) {
    return (
      <View className="py-6 items-center justify-center gap-2">
        <ActivityIndicator size="small" color="#26362E" />
        <Text className="text-[11px] text-[#6E7E75] font-medium tracking-wide">
          {message}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 w-full items-center justify-center p-8 min-h-[300px]"
      accessibilityLiveRegion="polite"
    >
      {/* Concentric Breathing Aura Indicator */}
      <View className="w-28 h-28 items-center justify-center relative mb-5">
        <Animated.View
          style={auraAnimatedStyle}
          className="w-28 h-28 rounded-full bg-[#E5EDE8] absolute"
        />
        <View className="w-20 h-20 rounded-full bg-[#C9DDD1] items-center justify-center absolute" />
        <View className="w-12 h-12 rounded-full bg-[#26362E] items-center justify-center shadow-md shadow-[#26362E]/20 relative z-10">
          <ActivityIndicator size="small" color="#FAF8F5" />
        </View>
      </View>

      <Text className="text-sm font-serif font-bold text-[#1C2520] tracking-tight text-center mb-1">
        Solace AI
      </Text>
      <Text className="text-xs text-[#707E76] text-center leading-relaxed font-normal max-w-[240px]">
        {message}
      </Text>
    </View>
  );
}

export function ErrorState({
  title = 'Something didn’t load',
  message = 'We could not reach your solace data. Please check your connection.',
  onRetry,
}) {
  const reduceMotion = useReducedMotion();

  const handleRetry = () => {
    Haptics.selectionAsync().catch(() => { });
    onRetry?.();
  };

  return (
    <View className="flex-1 w-full items-center justify-center p-6 min-h-[320px]">
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(360)}
        className="w-full max-w-[340px] bg-[#FAF4F2] border border-[#F2DDD5] p-6 rounded-[30px] items-center shadow-xs"
      >
        {/* Terracotta Alert Crest */}
        <View className="w-14 h-14 rounded-full bg-[#FCECE8] items-center justify-center mb-3.5">
          <AlertTriangle size={24} color="#A83A2E" />
        </View>

        <Text
          accessibilityRole="header"
          className="text-[20px] font-serif font-bold text-[#3B1F19] text-center mb-1.5"
        >
          {title}
        </Text>

        <Text className="text-xs text-[#7A4E46] text-center leading-relaxed font-normal mb-5 px-1">
          {message}
        </Text>

        {onRetry ? (
          <TouchableOpacity
            onPress={handleRetry}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            className="h-[46px] px-6 rounded-full bg-[#A83A2E] flex-row items-center justify-center gap-2 shadow-sm shadow-[#A83A2E]/20"
          >
            <RotateCcw size={14} color="#FAF8F5" />
            <Text className="text-xs font-semibold text-[#FAF8F5] tracking-wide">
              Try Again
            </Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </View>
  );
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  actionLabel,
  onAction,
  className = '',
}) {
  const handleAction = () => {
    Haptics.selectionAsync().catch(() => { });
    onAction?.();
  };

  return (
    <View className={`w-full flex-row items-center justify-between mb-3 px-1 ${className}`}>
      <View className="flex-1 pr-3">
        <View className="flex-row items-center gap-2">
          <View className="w-1.5 h-1.5 rounded-full bg-[#26362E]" />
          <Text
            accessibilityRole="header"
            className="text-[19px] font-serif font-bold text-[#1C2520] tracking-tight leading-snug"
          >
            {title}
          </Text>

          {badge ? (
            <View className="bg-[#E5EDE8] px-2 py-0.5 rounded-full border border-[#D1E0D6]">
              <Text className="text-[9px] font-bold text-[#355243] uppercase tracking-wider">
                {badge}
              </Text>
            </View>
          ) : null}
        </View>

        {subtitle ? (
          <Text className="text-[11px] text-[#718279] mt-0.5 ml-3.5 leading-snug">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={handleAction}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className="flex-row items-center gap-1 bg-[#FAF8F5] border border-[#E8E2D6] px-3 py-1.5 rounded-full shadow-xs active:bg-[#F2EDE2]"
        >
          <Text className="text-xs font-semibold text-[#26362E] tracking-tight">
            {actionLabel}
          </Text>
          <ChevronRight size={13} color="#26362E" strokeWidth={2.2} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}