import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Heart, Sparkles, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';


cssInterop(Heart, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });

export default function CheckInCard({ className = '', style }) {
  const reduceMotion = useReducedMotion();

  const handleCheckIn = () => {
    Haptics.selectionAsync().catch(() => { });
    router.push('/mood/checkin');
  };

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(380)}
      className={`w-full ${className}`}
      style={style}
    >
      <View
        accessibilityLabel="Daily check-in reflection"
        className="w-full bg-white border border-[#E9E4D8] p-6 rounded-[32px] shadow-sm shadow-[#26362E]/5 relative overflow-hidden"
      >
        {/* Ambient Subtle Aura Blobs */}
        <View className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#E5EDE8]/40 pointer-events-none" />
        <View className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#F3EDE2]/45 pointer-events-none" />

        {/* 1. Header: Concentric Aura Heart Crest & Category Badge */}
        <View className="flex-row items-center gap-3.5 mb-3.5">
          {/* Multi-layered Concentric Ripple Mark */}
          <View className="w-13 h-13 rounded-full bg-[#E5EDE8] items-center justify-center relative shadow-xs">
            <View className="w-10 h-10 rounded-full bg-[#C9DDD1] items-center justify-center">
              <View className="w-7 h-7 rounded-full bg-[#26362E] items-center justify-center shadow-xs">
                <Heart size={14} color="#FAF8F5" strokeWidth={2.2} fill="#FAF8F5" />
              </View>
            </View>
          </View>

          <View className="flex-1 pr-1">
            <View className="flex-row items-center gap-1.5 mb-0.5">
              <Sparkles size={11} color="#526F60" />
              <Text className="text-[10px] uppercase font-bold text-[#526F60] tracking-widest">
                Daily Reflection
              </Text>
            </View>

            <Text
              accessibilityRole="header"
              className="text-[20px] font-serif font-bold text-[#1C2520] tracking-tight leading-snug"
            >
              A Moment for You
            </Text>
          </View>
        </View>

        {/* 2. Soothing Body Invitation */}
        <Text className="text-xs text-[#586860] leading-relaxed font-normal mb-5">
          How are you feeling in this quiet breath? A few gentle seconds to pause and notice is all it takes.
        </Text>

        {/* 3. Deep Forest Green Pill CTA Button */}
        <TouchableOpacity
          onPress={handleCheckIn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Begin Check-in"
          accessibilityHint="Opens today's mindful mood check-in"
          className="h-[54px] w-full rounded-full bg-[#26362E] border border-[#202E27] flex-row items-center justify-center px-6 shadow-lg shadow-[#26362E]/25"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-sm font-semibold tracking-wide text-center text-[#FAF8F5]">
              Begin Check-in
            </Text>
            <ArrowRight size={16} color="#FAF8F5" />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}