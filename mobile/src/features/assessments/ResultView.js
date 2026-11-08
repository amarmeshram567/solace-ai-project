import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import {
  Sprout,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressBar from '../../components/ProgressBar';
import { rewardText } from '../../utils/rewards';

cssInterop(Sprout, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });
cssInterop(RotateCcw, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(Award, { className: 'style' });
cssInterop(CheckCircle2, { className: 'style' });

export default function ResultView({ result, reward, onRetake }) {
  const reduceMotion = useReducedMotion();
  const reward_ = rewardText(reward);
  const progressRatio = result.maxScore ? Math.min(1, result.totalScore / result.maxScore) : 0;

  const handleRetake = () => {
    Haptics.selectionAsync().catch(() => { });
    onRetake?.();
  };

  const handleSuggestion = () => {
    Haptics.selectionAsync().catch(() => { });
    if (result.suggestion?.deepLink) {
      router.push(result.suggestion.deepLink);
    }
  };

  return (
    <View className="gap-5 pb-8">
      {/* 1. Main Assessment Result Hero Card (Velora Organic Canvas) */}
      <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(380)}>
        <View className="bg-white border border-[#E9E4D8] p-6 rounded-[32px] shadow-sm shadow-[#26362E]/5">
          {/* Header Row: Title & Concentric Aura Crest */}
          <View className="flex-row items-center gap-3.5 mb-5">
            <View className="w-14 h-14 rounded-full bg-[#E5EDE8] items-center justify-center relative shadow-xs">
              <View className="w-10 h-10 rounded-full bg-[#C9DDD1] items-center justify-center">
                <View className="w-7 h-7 rounded-full bg-[#26362E] items-center justify-center shadow-xs">
                  <Sprout size={16} color="#FAF8F5" strokeWidth={2.2} />
                </View>
              </View>
            </View>

            <View className="flex-1 pr-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Sparkles size={11} color="#526F60" />
                <Text className="text-[10px] uppercase font-bold text-[#526F60] tracking-wider">
                  {result.title || 'Self-Check Reflection'}
                </Text>
              </View>

              <Text
                accessibilityRole="header"
                className="text-[22px] font-serif font-bold text-[#1C2520] tracking-tight leading-snug"
              >
                {result.category}
              </Text>
            </View>
          </View>

          {/* Score Metric Progress Pill */}
          <View className="bg-[#FAF8F5] border border-[#E8E2D6] p-4 rounded-2xl mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
                Reflection Index
              </Text>
              <Text className="text-xs font-bold text-[#26362E] font-mono">
                {result.totalScore} / {result.maxScore}
              </Text>
            </View>

            <ProgressBar
              progress={progressRatio}
              tone="forest"
              height={7}
              label={`Score ${result.totalScore} out of ${result.maxScore}`}
            />
          </View>

          {/* Supportive Reflection Summary */}
          <Text className="text-xs text-[#526158] leading-relaxed font-normal">
            {result.summary}
          </Text>
        </View>
      </Animated.View>

      {/* 2. Structured Actionable Ideas for Coming Days */}
      {result.recommendations?.length ? (
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(380).delay(80)}>
          <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
            <View className="flex-row items-center gap-2 mb-3.5 px-0.5">
              <View className="w-2 h-2 rounded-full bg-[#26362E]" />
              <Text className="text-base font-serif font-bold text-[#1C2520]">
                Ideas for the Next Few Days
              </Text>
            </View>

            <View className="gap-2.5">
              {result.recommendations.map((recommendation, idx) => (
                <View
                  key={idx}
                  className="flex-row items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6]"
                >
                  <View className="w-5 h-5 rounded-full bg-[#E5EDE8] items-center justify-center mt-0.5">
                    <CheckCircle2 size={12} color="#355243" />
                  </View>
                  <Text className="text-xs text-[#2A3730] leading-relaxed flex-1 font-medium">
                    {recommendation}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      ) : null}

      {/* 3. Milestone Reward Badge (if applicable) */}
      {reward_ ? (
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(380).delay(140)}>
          <View className="bg-[#F3EDE2] border border-[#E5DDCB] p-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-xs">
            <Award size={15} color="#715E41" />
            <Text
              className="text-xs font-semibold text-[#54442A] text-center"
              accessibilityLiveRegion="polite"
            >
              {reward_}
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {/* 4. Action Controls Flow */}
      <View className="gap-2.5 pt-1">
        {result.suggestion ? (
          <PrimaryButton
            label={result.suggestion.label}
            onPress={handleSuggestion}
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
          />
        ) : null}

        <PrimaryButton
          label="Retake Reflection"
          onPress={handleRetake}
          variant={result.suggestion ? 'outline' : 'primary'}
          icon={RotateCcw}
          iconPosition="left"
        />
      </View>

      {/* 5. Non-Clinical Supportive Disclaimer */}
      {result.disclaimer ? (
        <View className="flex-row items-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] mt-1">
          <ShieldCheck size={14} color="#7A8A81" />
          <Text className="text-[11px] text-[#7A8A81] leading-relaxed flex-1">
            {result.disclaimer}
          </Text>
        </View>
      ) : null}
    </View>
  );
}