import React, { useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Circle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';
import ProgressBar from '../../src/components/ProgressBar';
import ResultView from '../../src/features/assessments/ResultView';
import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';
import { useAuth } from '../../src/auth/AuthContext';
import { ApiError } from '../../src/services/api';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Check, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });
cssInterop(ArrowLeft, { className: 'style' });
cssInterop(Circle, { className: 'style' });
cssInterop(HelpCircle, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });

export default function AssessmentRunner() {
  const { id } = useLocalSearchParams();
  const { authedRequest } = useAuth();
  const assessment = useRemote(`/assessments/${id}`);
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState(null);

  const retake = () => {
    Haptics.selectionAsync().catch(() => { });
    setIndex(0);
    setAnswers({});
    setOutcome(null);
    setError('');
  };

  if (assessment.status === 'loading' && !assessment.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <LoadingState message="Preparing your mindful check-in…" />
      </SafeAreaView>
    );
  }

  if (assessment.status === 'error' && !assessment.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <ErrorState message={assessment.error} onRetry={assessment.reload} />
      </SafeAreaView>
    );
  }

  const { title, questions = [], scale = [], disclaimer } = assessment.data || {};
  const total = questions.length;
  const q = questions[index] || {};
  const chosen = answers[q.id];
  const isLast = index === total - 1;
  const progressRatio = total > 0 ? (index + 1) / total : 0;

  const submit = async () => {
    setSubmitting(true);
    setError('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    try {
      const data = await authedRequest(`/assessments/${id}/submit`, {
        method: 'POST',
        body: {
          answers: questions.map((question) => ({
            questionId: question.id,
            value: answers[question.id],
          })),
        },
      });
      setOutcome(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not save your result. Your answers are preserved, please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOption = (value) => {
    Haptics.selectionAsync().catch(() => { });
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const handleNext = () => {
    Haptics.selectionAsync().catch(() => { });
    if (isLast) {
      submit();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    Haptics.selectionAsync().catch(() => { });
    setIndex((i) => Math.max(0, i - 1));
  };

  if (outcome) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1">
          <View className="px-6 pt-4 pb-3 border-b border-[#EFEBE1] flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={20} color="#26362E" />
            </TouchableOpacity>
            <Text className="text-sm font-serif font-bold text-[#1C2520]">{title}</Text>
            <View className="w-10 h-10" />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
            <ResultView result={outcome.result} reward={outcome.reward} onRetake={retake} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between">

        {/* Navigation & Stepper Header */}
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
                Question {index + 1} of {total}
              </Text>
            </View>

            <View className="w-10 h-10 rounded-full bg-transparent items-center justify-center" />
          </View>

          {/* Smooth Linear Progress Bar */}
          <View className="w-full h-1.5 rounded-full bg-[#E8E3D8] overflow-hidden">
            {/* <SmoothBar progress={progressRatio} color="#26362E" /> */}
            <ProgressBar progress={progressRatio} label={`Question ${index + 1} of ${total}`} />

          </View>
        </View>

        {/* Question & Options Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 20 }}
          className="flex-1"
        >
          <Animated.View
            key={`question-${q.id || index}`}
            entering={reduceMotion ? undefined : FadeInRight.duration(300)}
            className="flex-1 justify-center"
          >
            {/* Context Badge */}
            <View className="flex-row items-center gap-1.5 mb-2.5">
              <HelpCircle size={14} color="#607267" />
              <Text className="text-[11px] uppercase tracking-[2px] font-bold text-[#607267]">
                Self Reflection
              </Text>
            </View>

            {/* Main Prompt */}
            <Text
              accessibilityRole="header"
              className="text-[23px] font-serif font-bold text-[#1C2520] leading-[32px] tracking-tight mb-6"
            >
              {q.prompt}
            </Text>

            {/* Radio Options List */}
            <View className="gap-3 mb-4" accessibilityRole="radiogroup">
              {scale.map((opt) => {
                const selected = chosen === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleSelectOption(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={opt.label}
                    className={`p-4 rounded-2xl border transition-all flex-row items-center justify-between ${selected
                      ? 'bg-[#E5EDE8] border-[#26362E] shadow-sm'
                      : 'bg-white border-[#E8E2D6] active:bg-[#F7F4EC]'
                      }`}
                  >
                    <Text
                      className={`text-sm flex-1 pr-3 leading-snug ${selected ? 'font-bold text-[#1C2820]' : 'font-medium text-[#38463D]'
                        }`}
                    >
                      {opt.label}
                    </Text>

                    {/* Radio Indicator */}
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center border ${selected
                        ? 'bg-[#26362E] border-[#26362E]'
                        : 'border-[#BDC7C0] bg-transparent'
                        }`}
                    >
                      {selected ? <Check size={13} color="#FAF8F5" strokeWidth={2.8} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {error ? (
              <View className="bg-[#FBF1EF] p-3 rounded-2xl border border-[#F4D2CC] mb-4">
                <Text className="text-xs text-[#A83A2E] text-center font-medium">{error}</Text>
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>

        {/* Footer Actions & Disclaimer */}
        <View className="px-6 pt-3 pb-5 bg-[#FAF8F5] border-t border-[#EFEBE1]">
          <View className="flex-row items-center gap-3 mb-3">
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBack}
              disabled={index === 0}
              activeOpacity={0.7}
              className={`w-14 h-[52px] rounded-full border items-center justify-center ${index === 0
                ? 'border-[#E7E2D5] bg-[#F2EDE2]/40 opacity-40'
                : 'border-[#D9D2C3] bg-white'
                }`}
            >
              <ArrowLeft size={18} color="#26362E" />
            </TouchableOpacity>

            {/* Next / Submit Pill Button */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={chosen === undefined || submitting}
              activeOpacity={0.85}
              className={`flex-1 h-[52px] rounded-full flex-row items-center justify-center gap-2 shadow-md ${chosen === undefined || submitting
                ? 'bg-[#D2CBC0] opacity-60'
                : 'bg-[#26362E] shadow-[#26362E]/20'
                }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FAF8F5" />
              ) : (
                <>
                  <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                    {isLast ? 'See My Result' : 'Next Question'}
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

          {/* Gentle Disclaimer Notice */}
          {disclaimer ? (
            <View className="flex-row items-center justify-center gap-1.5 px-2">
              <ShieldCheck size={11} color="#8A9790" />
              <Text className="text-[10px] text-[#8A9790] text-center leading-snug flex-1">
                {disclaimer}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Micro-Component: Smooth Linear Stepper
function SmoothBar({ progress, color }) {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withTiming(Math.min(1, Math.max(0, progress)), {
      duration: 350,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%`,
    backgroundColor: color,
  }));

  return <Animated.View style={animatedStyle} className="h-full rounded-full" />;
}