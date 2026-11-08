import React from 'react';
import { Text, View } from 'react-native';
import { Flame, Sparkles, Award } from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import ProgressBar from '../../components/ProgressBar';

cssInterop(Flame, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Award, { className: 'style' });

export default function LevelCard({ level, streak, className = '', style }) {
  const reduceMotion = useReducedMotion();
  const isMax = level.nextLevelXp === null;
  const dayLabel = streak.current === 1 ? 'day' : 'days';

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(380)}
      className={`w-full ${className}`}
      style={style}
    >
      <View
        accessibilityLabel={`Level ${level.level}, ${level.levelName}`}
        className="w-full bg-[#E5EDE8] border border-[#D2E0D7] p-6 rounded-[32px] shadow-sm shadow-[#26362E]/5 relative overflow-hidden"
      >
        {/* Subtle Ambient Radial Halos */}
        <View className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/40 pointer-events-none" />
        <View className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#C9DDD1]/40 pointer-events-none" />

        {/* 1. Header: Concentric Aura Level Crest & Flame Streak Pill */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center gap-3">
            {/* Concentric Organic Level Badge */}
            <View className="w-13 h-13 rounded-full bg-[#D4E3D9] items-center justify-center relative shadow-xs">
              <View className="w-10 h-10 rounded-full bg-[#C0D6C8] items-center justify-center">
                <View className="w-7 h-7 rounded-full bg-[#26362E] items-center justify-center shadow-xs">
                  <Text className="text-xs font-serif font-bold text-[#FAF8F5]">
                    {level.level}
                  </Text>
                </View>
              </View>
            </View>

            <View>
              <View className="flex-row items-center gap-1 mb-0.5">
                <Sparkles size={10} color="#355243" />
                <Text className="text-[10px] uppercase font-bold text-[#355243] tracking-widest">
                  Your Journey
                </Text>
              </View>
              <Text
                accessibilityRole="header"
                className="text-[20px] font-serif font-bold text-[#1C2520] tracking-tight leading-snug"
              >
                {level.levelName}
              </Text>
            </View>
          </View>

          {/* Warm Sand & Terracotta Daily Streak Pill */}
          <View
            accessibilityLabel={`Streak: ${streak.current} ${dayLabel}`}
            className="flex-row items-center gap-1.5 bg-[#FAF8F5] border border-[#D7E2DC] px-3.5 py-1.5 rounded-full shadow-xs"
          >
            <Flame size={14} color="#A8432E" fill="#A8432E" />
            <Text className="text-xs font-bold text-[#26362E] tracking-tight">
              {streak.current} {dayLabel}
            </Text>
          </View>
        </View>

        {/* 2. Precision Progress Bar Container */}
        <View className="bg-white/70 border border-[#D5E3DB] p-4 rounded-2xl mb-2.5">
          <View className="flex-row items-center justify-between mb-2 px-0.5">
            <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#485B51]">
              {isMax ? 'Sanctuary Mastery' : `Next: ${level.nextLevelName}`}
            </Text>

            <Text className="text-[11px] font-bold text-[#26362E] font-mono">
              {Math.round((level.progress || 0) * 100)}%
            </Text>
          </View>

          <ProgressBar
            progress={level.progress}
            tone="forest"
            height={7}
            label={isMax ? 'Maximum level reached' : `Progress to ${level.nextLevelName}`}
          />
        </View>

        {/* 3. XP Trajectory Footer */}
        <View className="flex-row items-center justify-between px-1 pt-1">
          <View className="flex-row items-center gap-1.5">
            <Award size={12} color="#485B51" />
            <Text className="text-[11px] text-[#485B51] font-medium tracking-tight">
              {isMax
                ? `${level.totalXp} XP total earned`
                : `${level.totalXp} / ${level.nextLevelXp} XP`}
            </Text>
          </View>

          <Text className="text-[10px] uppercase font-bold text-[#485B51] tracking-wider">
            {isMax ? 'Peak Tier' : `${level.nextLevelXp - level.totalXp} XP to go`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}