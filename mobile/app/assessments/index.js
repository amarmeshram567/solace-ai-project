import React from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Sparkles,
  History,
  ShieldCheck,
  Clock,
  HelpCircle,
  Award,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(ChevronRight, { className: 'style' });
cssInterop(ClipboardList, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(History, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(Clock, { className: 'style' });
cssInterop(HelpCircle, { className: 'style' });
cssInterop(Award, { className: 'style' });

// Screenshot Velora Inspired Muted Tone Cycles
const ASSESSMENT_TONES = [
  {
    bg: 'bg-[#E5EDE8]', // Pale Sage
    border: 'border-[#D4E1D8]',
    iconBg: 'bg-[#D6E3DA]',
    iconColor: '#385244',
  },
  {
    bg: 'bg-[#F3EDE2]', // Warm Sand / Oat
    border: 'border-[#E6DEC9]',
    iconBg: 'bg-[#E8DFC9]',
    iconColor: '#6B5738',
  },
  {
    bg: 'bg-[#EAEBF2]', // Soft Lavender / Slate Blue
    border: 'border-[#D8DAE6]',
    iconBg: 'bg-[#DCDFEA]',
    iconColor: '#454C68',
  },
  {
    bg: 'bg-[#FBECE6]', // Soft Terracotta Blush
    border: 'border-[#F2DDD5]',
    iconBg: 'bg-[#F3DDD3]',
    iconColor: '#7A4839',
  },
];

export default function AssessmentList() {
  const list = useRemote('/assessments');
  const history = useRemote('/assessments/history');
  const reduceMotion = useReducedMotion();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container for Mobile & Web Centering */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between">

        {/* Navigation & Header */}
        <View className="px-6 pt-4 pb-4 bg-[#FAF8F5] border-b border-[#EFEBE1]">
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
                Self-Care Check-In
              </Text>
            </View>

            <View className="w-10 h-10 rounded-full bg-transparent" />
          </View>

          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
            Self-Reflection
          </Text>
          <Text className="text-xs text-[#707E76] mt-0.5 leading-relaxed font-normal">
            Short, gentle check-ins to notice how your mind and body are resting today.
          </Text>
        </View>

        {/* Scrollable List Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 }}
          className="flex-1"
        >
          {list.status === 'loading' && !list.data ? (
            <View className="py-16">
              <LoadingState message="Gathering reflection prompts…" />
            </View>
          ) : null}

          {list.status === 'error' && !list.data ? (
            <ErrorState message={list.error} onRetry={list.reload} />
          ) : null}

          {/* Available Assessments Section */}
          <View className="mb-6">
            <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E] mb-3 ml-1">
              Available Check-Ins
            </Text>

            <View className="gap-3.5">
              {list.data?.map((a, i) => {
                const tone = ASSESSMENT_TONES[i % ASSESSMENT_TONES.length];
                return (
                  <Animated.View
                    key={a.id}
                    entering={
                      reduceMotion
                        ? undefined
                        : FadeInDown.duration(380).delay(Math.min(i * 50, 250))
                    }
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => { });
                        router.push(`/assessments/${a.id}`);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${a.title}: ${a.description}`}
                      className={`p-5 rounded-[28px] border ${tone.border} ${tone.bg} active:scale-[0.99] transition-all shadow-sm shadow-[#26362E]/5`}
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1 pr-2">
                          <View className="flex-row items-center gap-1.5 mb-1.5">
                            <View className={`w-6 h-6 rounded-full ${tone.iconBg} items-center justify-center`}>
                              <ClipboardList size={12} color={tone.iconColor} />
                            </View>
                            <Text className="text-[10px] uppercase tracking-wider font-bold text-[#55655C]">
                              Reflection #{i + 1}
                            </Text>
                          </View>

                          <Text className="text-[18px] font-serif font-bold text-[#1C2520] mb-1 leading-snug">
                            {a.title}
                          </Text>
                          <Text
                            className="text-xs text-[#526158] leading-relaxed mb-3.5"
                            numberOfLines={2}
                          >
                            {a.description}
                          </Text>

                          {/* Quick Duration Badges */}
                          <View className="flex-row items-center gap-2">
                            <View className="flex-row items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-black/5">
                              <HelpCircle size={11} color="#3C4B42" />
                              <Text className="text-[11px] font-medium text-[#3C4B42]">
                                {a.questionCount} Questions
                              </Text>
                            </View>

                            <View className="flex-row items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full border border-black/5">
                              <Clock size={11} color="#3C4B42" />
                              <Text className="text-[11px] font-medium text-[#3C4B42]">
                                ~1 min
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Right Directional Arrow Pill */}
                        <View className="w-9 h-9 rounded-full bg-white/80 items-center justify-center self-center shadow-xs">
                          <ChevronRight size={17} color="#26362E" />
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* Past History Section */}
          {history.data?.length ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.duration(400).delay(180)}
              className="mb-4"
            >
              <View className="flex-row items-center justify-between mb-3 px-1">
                <View className="flex-row items-center gap-1.5">
                  <History size={14} color="#57665E" />
                  <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E]">
                    Your Past Reflections
                  </Text>
                </View>
                <Text className="text-[11px] text-[#86948B]">
                  {history.data.length} recorded
                </Text>
              </View>

              <View className="gap-2.5">
                {history.data.map((h) => (
                  <View
                    key={h.id}
                    className="p-4 rounded-3xl bg-white border border-[#E9E4D8] shadow-sm shadow-[#26362E]/5 flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center gap-2 mb-0.5">
                        <Text className="text-sm font-serif font-bold text-[#1C2520]">
                          {h.title}
                        </Text>
                        <View className="bg-[#EFECE5] px-2 py-0.5 rounded-full">
                          <Text className="text-[9px] uppercase font-bold text-[#67776F]">
                            {h.category}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-[11px] text-[#788880]">
                        Completed on {new Date(h.completedAt).toLocaleDateString()}
                      </Text>
                    </View>

                    <View className="bg-[#FAF8F5] border border-[#E5DFD1] px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                      <Award size={12} color="#26362E" />
                      <Text className="text-xs font-bold text-[#26362E]">
                        Score {h.totalScore}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          ) : null}
        </ScrollView>

        {/* Footer Guidance Note */}
        <View className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#EFEBE1] flex-row items-center justify-center gap-1.5">
          <ShieldCheck size={12} color="#8A9790" />
          <Text className="text-[11px] text-[#8A9790] text-center">
            Nothing here is a score to beat. It is only space to listen to yourself.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}