import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Heart,
  Moon,
  Sparkles,
  Wind,
  ArrowUpRight,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { WELLNESS_MOVES } from '../../constants/wellness';
import { SectionHeader } from '../../components/States';

cssInterop(Sparkles, { className: 'style' });
cssInterop(Heart, { className: 'style' });
cssInterop(Wind, { className: 'style' });
cssInterop(Moon, { className: 'style' });
cssInterop(ArrowUpRight, { className: 'style' });

const CATEGORY_META = {
  mindfulness: {
    icon: Sparkles,
    bgOuter: '#E5EDE8',
    bgCore: '#26362E',
    tag: 'Presence',
  },
  'self-love': {
    icon: Heart,
    bgOuter: '#FCECE8',
    bgCore: '#A8432E',
    tag: 'Kindness',
  },
  'stress-relief': {
    icon: Wind,
    bgOuter: '#E8F1EC',
    bgCore: '#2D4638',
    tag: 'Release',
  },
  'better-sleep': {
    icon: Moon,
    bgOuter: '#F3EDE2',
    bgCore: '#6E5D46',
    tag: 'Rest',
  },
};

export default function WellnessMoves({ className = '', style }) {
  return (
    <View className={`w-full ${className}`} style={style}>
      {/* 1. Section Header */}
      <SectionHeader
        title="Wellness Moves"
        subtitle="Small restorative pauses that gently shift your day"
      />

      {/* 2. Responsive 2x2 Grid via Tailwind */}
      <View className="w-full flex-row flex-wrap justify-between gap-y-3 mt-1.5">
        {WELLNESS_MOVES.map((move, index) => (
          <MoveTile key={move.key} move={move} index={index} />
        ))}
      </View>
    </View>
  );
}

function MoveTile({ move, index }) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const meta = CATEGORY_META[move.key] ?? {
    icon: Sparkles,
    bgOuter: '#E5EDE8',
    bgCore: '#26362E',
    tag: 'Mindful',
  };

  const Icon = meta.icon;

  const handlePressIn = () => {
    if (!reduceMotion) {
      scale.value = withSpring(0.97, { damping: 18, stiffness: 280, mass: 0.8 });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion) {
      scale.value = withSpring(1, { damping: 18, stiffness: 280, mass: 0.8 });
    }
  };

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => { });
    router.push(`/activities?category=${move.category}`);
  };

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(340).delay(index * 50)}
      style={[pressAnimatedStyle, { width: '48.5%' }]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${move.title}: ${move.subtitle}`}
        style={{ overflow: 'hidden' }}
        className="w-full min-h-[144px] bg-white border border-[#E9E4D8] rounded-[24px] p-3.5 justify-between relative shadow-xs shadow-[#26362E]/5 active:bg-[#FAF8F5]"
      >
        {/* Ambient Corner Aura Glow (Clipped strictly inside card) */}
        <View
          style={{ backgroundColor: meta.bgOuter }}
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-65 pointer-events-none"
        />

        {/* Top Bar: Concentric Icon + Arrow Pill */}
        <View className="w-full flex-row items-center justify-between z-10">
          {/* Concentric Aura Mark */}
          <View
            style={{ backgroundColor: meta.bgOuter }}
            className="w-9 h-9 rounded-full items-center justify-center relative shadow-xs"
          >
            <View
              style={{ backgroundColor: meta.bgCore }}
              className="w-6 h-6 rounded-full items-center justify-center shadow-xs"
            >
              <Icon size={12} color="#FAF8F5" strokeWidth={2.4} />
            </View>
          </View>

          {/* Micro Arrow Pill */}
          <View className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#EAE4D7] items-center justify-center">
            <ArrowUpRight size={12} color="#54625A" strokeWidth={2.2} />
          </View>
        </View>

        {/* Bottom Copy */}
        <View className="z-10 mt-2.5">
          <Text className="text-[10px] font-bold text-[#6D7D74] uppercase tracking-wider mb-0.5">
            {meta.tag}
          </Text>

          <Text
            numberOfLines={1}
            className="text-base font-serif font-bold text-[#1C2520] tracking-tight leading-snug"
          >
            {move.title}
          </Text>

          <Text
            numberOfLines={2}
            className="text-[11px] text-[#718077] leading-tight mt-0.5 font-normal"
          >
            {move.subtitle}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}