import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Clock,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Flame,
  Award,
  CircleDot,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';
import { useAuth } from '../../src/auth/AuthContext';
import { ApiError } from '../../src/services/api';
import { rewardText } from '../../src/utils/rewards';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Clock, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Check, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });
cssInterop(ArrowLeft, { className: 'style' });
cssInterop(Flame, { className: 'style' });
cssInterop(Award, { className: 'style' });
cssInterop(CircleDot, { className: 'style' });

export default function ActivityRunner() {

  const { showNotification } = useNotification();

  const { id } = useLocalSearchParams();
  const { authedRequest } = useAuth();
  const activity = useRemote(`/wellness/activities/${id}`);
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(-1); // -1 = Intro overview
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Animated Pill Step Button Scale
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  if (activity.status === 'loading' && !activity.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <LoadingState message="Preparing your guided space…" />
      </SafeAreaView>
    );
  }

  if (activity.status === 'error' && !activity.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <ErrorState message={activity.error} onRetry={activity.reload} />
      </SafeAreaView>
    );
  }

  const { title, description, steps = [], durationSec = 180, xpReward = 15 } = activity.data || {};
  const totalSteps = steps.length;
  const isLast = index === totalSteps - 1;
  const progressRatio = totalSteps > 0 && index >= 0 ? (index + 1) / totalSteps : 0;

  const finish = async () => {
    setBusy(true);
    setError('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    try {
      const data = await authedRequest(`/wellness/activities/${id}/complete`, { method: 'POST' });
      setResult(data);
      setDone(true);

      showNotification({
        title: 'Activity Completed',
        message: `You've completed "${title}" and earned ${xpReward} XP!`,
        type: 'success',
      });

    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not record this. Your practice still counts; try again in a moment.'
      );

      showNotification({
        title: 'Completion Failed',
        message: err.message || 'Could not record your activity completion. Please try again.',
        type: 'alert',
      });

    } finally {
      setBusy(false);
    }
  };

  const handleStepForward = () => {
    Haptics.selectionAsync().catch(() => { });
    if (isLast) {
      finish();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleStepBack = () => {
    Haptics.selectionAsync().catch(() => { });
    setIndex((i) => Math.max(0, i - 1));
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Shell for Web / Edge-to-Edge on Mobile */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between">

        {/* Top Header & Progress */}
        <View className="px-6 pt-4 pb-3 bg-[#FAF8F5] border-b border-[#EFEBE1]">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={20} color="#26362E" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3 py-1 rounded-full border border-[#D1E0D6]">
              <Sparkles size={12} color="#355243" />
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                {done ? 'Completed' : index === -1 ? 'Overview' : `Step ${index + 1} of ${totalSteps}`}
              </Text>
            </View>

            <View className="w-10 h-10 rounded-full bg-transparent items-center justify-center" />
          </View>

          {/* Stepper Progress Bar */}
          {index >= 0 && !done ? (
            <View className="w-full h-1.5 rounded-full bg-[#E8E3D8] overflow-hidden">
              <SmoothBar progress={progressRatio} color="#26362E" />
            </View>
          ) : null}
        </View>

        {/* Dynamic Center Stage */}
        <View className="flex-1 justify-center px-6 py-4">
          {done ? (
            /* Completed Screen (Aura circles & gentle praise) */
            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.duration(420)}
              className="items-center justify-center"
            >
              {/* Concentric Organic Aura Rings */}
              <View className="w-44 h-44 rounded-full bg-[#E5EDE8] items-center justify-center mb-6 relative">
                <View className="w-32 h-32 rounded-full bg-[#C9DDD1] items-center justify-center">
                  <View className="w-20 h-20 rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25">
                    <Check size={36} color="#FAF8F5" strokeWidth={2.8} />
                  </View>
                </View>
              </View>

              <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight text-center mb-2">
                Activity Complete
              </Text>
              <Text className="text-xs text-[#6F7E75] text-center leading-relaxed font-normal px-4 mb-6">
                Take a long, gentle breath. Notice the softness in your chest and calm clarity in your thoughts.
              </Text>

              {/* Reward Badge */}
              <View className="bg-[#F3EDE2] border border-[#E5DDCB] px-4 py-2.5 rounded-2xl flex-row items-center gap-2 mb-2">
                <Award size={16} color="#715E41" />
                <Text className="text-xs font-semibold text-[#54442A]">
                  {result?.alreadyCompletedToday
                    ? 'Practice already logged today • Routine kept'
                    : rewardText(result?.reward) || `+${xpReward} XP earned toward your growth`}
                </Text>
              </View>
            </Animated.View>
          ) : index === -1 ? (
            /* Intro Overview (Screenshot 3 Style Hero Structure) */
            <Animated.View
              entering={reduceMotion ? undefined : FadeIn.duration(380)}
              className="items-center"
            >
              {/* Concentric Soft Botanical Crest */}
              <View className="w-40 h-40 rounded-full bg-[#E5EDE8]/70 items-center justify-center mb-6 relative">
                <View className="w-28 h-28 rounded-full bg-[#CEDBCE] items-center justify-center">
                  <View className="w-16 h-16 rounded-full bg-[#26362E] items-center justify-center shadow-md shadow-[#26362E]/20">
                    <Sparkles size={24} color="#FAF8F5" />
                  </View>
                </View>
              </View>

              <Text className="text-[25px] font-serif font-bold text-[#1C2520] tracking-tight text-center mb-2">
                {title}
              </Text>
              <Text className="text-xs text-[#6F7E75] text-center leading-relaxed font-normal px-3 mb-6">
                {description}
              </Text>

              {/* Quick Metrics Badges */}
              <View className="flex-row items-center gap-3 mb-2">
                <View className="flex-row items-center gap-1.5 bg-[#FAF8F5] border border-[#E3DDD1] px-3.5 py-1.5 rounded-full shadow-sm">
                  <Clock size={13} color="#26362E" />
                  <Text className="text-[11px] font-medium text-[#26362E]">
                    ~{Math.round(durationSec / 60)} min
                  </Text>
                </View>

                <View className="flex-row items-center gap-1.5 bg-[#FAF8F5] border border-[#E3DDD1] px-3.5 py-1.5 rounded-full shadow-sm">
                  <Flame size={13} color="#9C6B32" />
                  <Text className="text-[11px] font-medium text-[#9C6B32]">
                    +{xpReward} XP
                  </Text>
                </View>

                <View className="flex-row items-center gap-1.5 bg-[#FAF8F5] border border-[#E3DDD1] px-3.5 py-1.5 rounded-full shadow-sm">
                  <CircleDot size={13} color="#45544B" />
                  <Text className="text-[11px] font-medium text-[#45544B]">
                    {totalSteps} Steps
                  </Text>
                </View>
              </View>
            </Animated.View>
          ) : (
            /* Step-by-Step Interactive Card */
            <Animated.View
              key={`step-${index}`}
              entering={reduceMotion ? undefined : FadeInRight.duration(320)}
              className="w-full items-center"
            >
              {/* Concentric Step Ripple */}
              <View className="w-24 h-24 rounded-full bg-[#E5EDE8] items-center justify-center mb-6">
                <View className="w-16 h-16 rounded-full bg-[#CEDBCE] items-center justify-center">
                  <Text className="text-xl font-serif font-bold text-[#26362E]">
                    {index + 1}
                  </Text>
                </View>
              </View>

              {/* Step Card */}
              <View className="w-full bg-white border border-[#E8E2D6] p-7 rounded-[32px] shadow-sm shadow-[#26362E]/5 items-center">
                <Text className="text-[10px] uppercase tracking-[3px] font-bold text-[#8A9790] mb-3 text-center">
                  Guidance
                </Text>
                <Text className="text-[20px] font-serif font-bold text-[#1C2520] text-center leading-[30px]">
                  {steps[index]?.text}
                </Text>
              </View>
            </Animated.View>
          )}

          {error ? (
            <View className="mt-4 bg-[#FBF1EF] p-3 rounded-2xl border border-[#F4D2CC]">
              <Text className="text-xs text-[#A83A2E] text-center font-medium">{error}</Text>
            </View>
          ) : null}
        </View>

        {/* Bottom Actions Floating Bar */}
        <View className="px-6 py-5 bg-[#FAF8F5] border-t border-[#EFEBE1]">
          {done ? (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.85}
              className="h-[52px] rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/20"
            >
              <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                Return to Activities
              </Text>
            </TouchableOpacity>
          ) : index === -1 ? (
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => { });
                  setIndex(0);
                }}
                activeOpacity={0.85}
                className="h-[52px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25"
              >
                <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                  Begin Practice
                </Text>
                <ArrowRight size={16} color="#FAF8F5" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View className="flex-row items-center gap-3">
              {/* Previous Step Button */}
              <TouchableOpacity
                onPress={handleStepBack}
                disabled={index === 0}
                activeOpacity={0.7}
                className={`w-14 h-[52px] rounded-full border items-center justify-center ${index === 0
                  ? 'border-[#E7E2D5] bg-[#F2EDE2]/40 opacity-40'
                  : 'border-[#D9D2C3] bg-white'
                  }`}
              >
                <ArrowLeft size={18} color="#26362E" />
              </TouchableOpacity>

              {/* Next / Complete Pill Button */}
              <TouchableOpacity
                onPress={handleStepForward}
                disabled={busy}
                activeOpacity={0.85}
                className="flex-1 h-[52px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25"
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#FAF8F5" />
                ) : (
                  <>
                    <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                      {isLast ? 'Complete Activity' : 'Next Step'}
                    </Text>
                    {isLast ? (
                      <Check size={16} color="#FAF8F5" strokeWidth={2.4} />
                    ) : (
                      <ArrowRight size={16} color="#FAF8F5" />
                    )}
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Micro-Component: Smooth Interpolated Top Progress Bar
function SmoothBar({ progress, color }) {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withTiming(Math.min(1, Math.max(0, progress)), {
      duration: 380,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%`,
    backgroundColor: color,
  }));

  return <Animated.View style={animatedStyle} className="h-full rounded-full" />;
}