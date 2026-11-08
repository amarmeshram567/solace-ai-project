import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { MOOD_KEYS, MOOD_META } from '../../constants/moods';

cssInterop(Check, { className: 'style' });

export default function MoodPicker({ value, onChange, className = '', style }) {
  return (
    <View
      accessibilityRole="radiogroup"
      className={`w-full flex-row flex-wrap justify-between gap-y-3.5 mt-1 ${className}`}
      style={style}
    >
      {MOOD_KEYS.map((key) => {
        const { label, Icon, tint } = MOOD_META[key] || {};
        return (
          <MoodOption
            key={key}
            moodKey={key}
            label={label || key}
            Icon={Icon}
            tint={tint}
            selected={value === key}
            onPress={() => onChange(key)}
          />
        );
      })}
    </View>
  );
}

function MoodOption({ label, Icon, tint, selected, onPress }) {
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const auraColor = tint || '#E5EDE8';

  useEffect(() => {
    if (!reduceMotion) {
      iconScale.value = withSpring(selected ? 1.12 : 1, {
        damping: 15,
        stiffness: 260,
      });
    }
  }, [selected, reduceMotion, iconScale]);

  const handlePressIn = () => {
    if (!reduceMotion) {
      scale.value = withSpring(0.965, { damping: 16, stiffness: 280, mass: 0.8 });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion) {
      scale.value = withSpring(1, { damping: 16, stiffness: 280, mass: 0.8 });
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    onPress();
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Animated.View
      style={[animatedCardStyle, { width: '48.5%' }]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="radio"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        style={{ overflow: 'hidden' }}
        className={`w-full min-h-[126px] py-4 px-3 rounded-[26px] items-center justify-center relative border transition-all ${selected
          ? 'bg-white border-2 border-[#26362E] shadow-md shadow-[#26362E]/15'
          : 'bg-white border border-[#EAE4D7] shadow-xs shadow-[#26362E]/5 active:bg-[#FAF8F5]'
          }`}
      >
        {/* Soft Ambient Background Aura Glow */}
        <View
          style={{ backgroundColor: auraColor }}
          className={`absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none transition-opacity ${selected ? 'opacity-35' : 'opacity-20'
            }`}
        />

        {/* Selected Micro Check Pill Badge */}
        {selected ? (
          <View className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#26362E] items-center justify-center shadow-xs">
            <Check size={11} color="#FAF8F5" strokeWidth={2.8} />
          </View>
        ) : null}

        {/* Concentric Aura Icon Crest */}
        <View className="items-center justify-center mb-2.5">
          {/* Outer Ripple */}
          <View
            style={{ backgroundColor: auraColor }}
            className={`w-[54px] h-[54px] rounded-full items-center justify-center transition-all ${selected ? 'opacity-90 scale-100' : 'opacity-60 scale-95'
              }`}
          >
            {/* Core Orb */}
            <Animated.View
              style={animatedIconStyle}
              className={`w-[38px] h-[38px] rounded-full items-center justify-center ${selected
                ? 'bg-[#26362E] shadow-sm shadow-[#26362E]/30'
                : 'bg-[#FAF8F5] border border-[#E8E2D6]'
                }`}
            >
              {Icon ? (
                <Icon
                  size={20}
                  color={selected ? '#FAF8F5' : '#26362E'}
                  strokeWidth={selected ? 2.2 : 1.8}
                />
              ) : null}
            </Animated.View>
          </View>
        </View>

        {/* Mood Label */}
        <Text
          numberOfLines={1}
          className={`text-[15px] tracking-tight text-center ${selected
            ? 'font-serif font-bold text-[#1C2520]'
            : 'font-semibold text-[#55635C]'
            }`}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}