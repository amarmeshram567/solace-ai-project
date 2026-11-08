import React from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Sparkles,
  Bot,
  Award,
  LifeBuoy,
  ShieldCheck,
  ChevronRight,
  Info,
  Heart,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Bot, { className: 'style' });
cssInterop(Award, { className: 'style' });
cssInterop(LifeBuoy, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(ChevronRight, { className: 'style' });
cssInterop(Info, { className: 'style' });
cssInterop(Heart, { className: 'style' });

export default function About() {
  const reduceMotion = useReducedMotion();

  const navigateTo = (path) => {
    Haptics.selectionAsync().catch(() => { });
    router.push(path);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container for Mobile & Web Centering */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col">

        {/* Navigation & Header */}
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

            <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D1E0D6]">
              <Info size={12} color="#355243" />
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                About Solace
              </Text>
            </View>

            <View className="w-10 h-10" />
          </View>

          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
            About & Guidance
          </Text>
          <Text className="text-xs text-[#707E76] mt-0.5 leading-relaxed font-normal">
            Understand how our mindful companion works, our values, and your safety.
          </Text>
        </View>

        {/* Scrollable Content Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 48 }}
          className="flex-1"
        >
          {/* 1. Hero Sanctuary Overview Banner */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360)}
            className="mb-5"
          >
            <View className="bg-[#26362E] rounded-[30px] p-6 relative overflow-hidden shadow-lg shadow-[#26362E]/20">
              {/* Organic Decorative Curves */}
              <View className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-white/5" />
              <View className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-[#8FA89B]/15" />

              <View className="flex-row items-center gap-2 mb-2">
                <Sparkles size={14} color="#A3C2B1" />
                <Text className="text-[10px] uppercase tracking-[2.5px] font-bold text-[#A3C2B1]">
                  Mindful Living
                </Text>
              </View>

              <Text className="text-[22px] font-serif font-bold text-[#FAF8F5] leading-snug mb-2">
                Your Quiet Haven in the Noise
              </Text>
              <Text className="text-xs text-[#B2C2B8] leading-relaxed">
                Solace is crafted as an everyday gentle sanctuary: offering mood check-ins, guided breathwork, self-reflection assessments, and restorative micro-habits.
              </Text>
            </View>
          </Animated.View>

          {/* 2. Zen Monk AI Companion Clarification */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360).delay(60)}
            className="mb-4"
          >
            <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
              <View className="flex-row items-center gap-2.5 mb-2">
                <View className="w-8 h-8 rounded-full bg-[#E5EDE8] items-center justify-center">
                  <Bot size={16} color="#26362E" />
                </View>
                <Text className="text-base font-serif font-bold text-[#1C2520]">
                  What Zen Monk Is & Isn't
                </Text>
              </View>
              <Text className="text-xs text-[#526158] leading-relaxed font-normal">
                Zen Monk is an AI companion designed for calm presence, empathetic listening, and reflective prompts. It is <Text className="font-bold text-[#1C2520]">not</Text> a human therapist, cannot clinical diagnose mental health conditions, and does not prescribe or advise on medication.
              </Text>
            </View>
          </Animated.View>

          {/* 3. Metrics & Scoring Transparency */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360).delay(120)}
            className="mb-4"
          >
            <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
              <View className="flex-row items-center gap-2.5 mb-2">
                <View className="w-8 h-8 rounded-full bg-[#F3EDE2] items-center justify-center">
                  <Award size={16} color="#6B5738" />
                </View>
                <Text className="text-base font-serif font-bold text-[#1C2520]">
                  Where Scores Come From
                </Text>
              </View>
              <Text className="text-xs text-[#526158] leading-relaxed font-normal">
                Progress bars, levels, and streaks are transparently derived from activities you choose to record. Self-reflection assessments are private evaluations of your current feelings and should never be viewed as a formal diagnosis or a score to beat.
              </Text>
            </View>
          </Animated.View>

          {/* 4. Immediate Crisis Safety Warning (Warm Terracotta Accent) */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360).delay(180)}
            className="mb-4"
          >
            <View className="bg-[#FAF4F2] border border-[#F2DDD5] p-5 rounded-[28px] shadow-xs">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-[#FCECE8] items-center justify-center">
                  <LifeBuoy size={16} color="#A83A2E" />
                </View>
                <Text className="text-base font-serif font-bold text-[#3B1F19]">
                  If You Need Urgent Help
                </Text>
              </View>
              <Text className="text-xs text-[#7A4E46] leading-relaxed mb-4">
                If you are in danger or considering self-harm, reach out to local emergency services right away. Solace cannot dispatch emergency assistance on your behalf.
              </Text>

              <TouchableOpacity
                onPress={() => navigateTo('/crisis-support')}
                activeOpacity={0.85}
                className="h-[46px] px-4 rounded-full bg-[#A83A2E] flex-row items-center justify-center gap-2 self-start"
              >
                <Text className="text-xs font-bold text-[#FAF8F5]">Open Crisis Support</Text>
                <ChevronRight size={14} color="#FAF8F5" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* 5. Privacy & Data Autonomy */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360).delay(240)}
            className="mb-4"
          >
            <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
              <View className="flex-row items-center gap-2.5 mb-2">
                <View className="w-8 h-8 rounded-full bg-[#E5EDE8] items-center justify-center">
                  <ShieldCheck size={16} color="#355243" />
                </View>
                <Text className="text-base font-serif font-bold text-[#1C2520]">
                  Your Privacy & Rights
                </Text>
              </View>
              <Text className="text-xs text-[#526158] leading-relaxed mb-4">
                You maintain complete sovereignty over your wellness data. You can download a full archive of your logs or delete your account at any time.
              </Text>

              <TouchableOpacity
                onPress={() => navigateTo('/settings/privacy')}
                activeOpacity={0.85}
                className="h-[46px] rounded-full border border-[#D5CEC0] bg-[#FAF8F5] flex-row items-center justify-between px-4"
              >
                <Text className="text-xs font-semibold text-[#26362E]">
                  Go to Privacy & Data Controls
                </Text>
                <ChevronRight size={15} color="#26362E" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* App Version Info Footer */}
          <View className="items-center mt-3">
            <Text className="text-[11px] uppercase tracking-[3px] font-bold text-[#86948B]">
              Solace AI • Version 1.0.0
            </Text>
            <Text className="text-[10px] text-[#A0ACA4] mt-0.5">
              Crafted for calm and mindful presence
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}