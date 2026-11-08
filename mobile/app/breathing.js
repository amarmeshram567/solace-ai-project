import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Alert,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Check,
  Award,
  CircleDot,
  Clock,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { DEFAULT_CYCLES, DEFAULT_PATTERN, useBreathingSession } from '../src/features/breathing/useBreathingSession';
import { useAuth } from '../src/auth/AuthContext';
import { ApiError } from '../src/services/api';
import { newRequestId, rewardText } from '../src/utils/rewards';
import { useNotification } from '../src/notification/NotificationContext';
import BreathingCircle from '../src/features/breathing/BreathingCircle';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Play, { className: 'style' });
cssInterop(Pause, { className: 'style' });
cssInterop(RotateCcw, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Check, { className: 'style' });
cssInterop(Award, { className: 'style' });
cssInterop(CircleDot, { className: 'style' });
cssInterop(Clock, { className: 'style' });

const LABELS = {
  ready: 'Get Ready',
  inhale: 'Breathe In',
  hold: 'Hold Gently',
  exhale: 'Breathe Out',
  rest: 'Rest & Pause',
  completed: 'Completed',
};

const SUB_LABELS = {
  ready: 'Center your mind and soften your shoulders',
  inhale: 'Fill your chest and belly with calm air',
  hold: 'Hold still, feeling the gentle stillness',
  exhale: 'Release tension, slow and steady',
  rest: 'Let your body settle into neutral ground',
  completed: 'Your nervous system is restored',
};

export default function Breathing() {
  const { showNotification } = useNotification();
  const { authedRequest } = useAuth();
  const reduceMotion = useReducedMotion();
  const pattern = DEFAULT_PATTERN;
  const clientRequestId = useMemo(() => newRequestId(), []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [summary, setSummary] = useState(null);
  const lastPhase = useRef('ready');

  const session = useBreathingSession({
    pattern,
    cycles: DEFAULT_CYCLES,
    onComplete: async ({ elapsedSec, cycles }) => {
      setSaving(true);
      try {
        const data = await authedRequest('/breathing/sessions', {
          method: 'POST',
          body: {
            clientRequestId,
            patternId: 'box-4444',
            pattern,
            cycles,
            durationSec: elapsedSec,
            completed: true,
          },
        });
        setSummary({ durationSec: elapsedSec, reward: data.reward });

        showNotification({
          title: 'Wellness Session Completed',
          message: `You've completed a wellness session and earned ${rewardText(data.reward)}!`,
          type: 'success',
        });
      } catch (err) {
        setSaveError(
          err instanceof ApiError
            ? err.message
            : 'Your session finished, but could not be saved. Check your connection.'
        );

        showNotification({
          title: 'Session Save Failed',
          message: err.message || 'Your session finished, but could not be saved. Check your connection.',
          type: 'alert',
        });
      } finally {
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    if (session.phase !== lastPhase.current && session.phase !== 'ready' && session.phase !== 'completed') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    }
    lastPhase.current = session.phase;
  }, [session.phase]);

  const exit = () => {
    Haptics.selectionAsync().catch(() => { });
    if (session.started && !session.completed) {
      Alert.alert('Pause this practice?', 'Your session progress will not be recorded.', [
        { text: 'Keep Going', style: 'cancel' },
        { text: 'End Session', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  // Completed State View
  if (session.completed) {
    const reward = rewardText(summary?.reward);
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between p-6">
          <View className="items-center pt-2">
            <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D1E0D6] mb-4">
              <Sparkles size={12} color="#355243" />
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                Practice Complete
              </Text>
            </View>
          </View>

          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(400)} className="items-center">
            <View className="w-44 h-44 rounded-full bg-[#E5EDE8] items-center justify-center mb-6 relative">
              <View className="w-32 h-32 rounded-full bg-[#C9DDD1] items-center justify-center">
                <View className="w-18 h-18 rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25">
                  <Check size={32} color="#FAF8F5" strokeWidth={2.8} />
                </View>
              </View>
            </View>

            <Text className="text-[28px] font-serif font-bold text-[#1C2520] tracking-tight text-center mb-1.5">
              Deep Breath Reset
            </Text>
            <Text className="text-xs text-[#6F7E75] text-center leading-relaxed font-normal px-4 mb-6">
              You completed all {session.cycles} rounds of box breathing. Notice how peaceful and steady your heart feels.
            </Text>

            <View className="flex-row items-center gap-2.5 mb-3">
              <View className="flex-row items-center gap-1 bg-[#FAF8F5] border border-[#E3DDD1] px-3.5 py-1.5 rounded-full shadow-xs">
                <Clock size={12} color="#26362E" />
                <Text className="text-xs font-semibold text-[#26362E]">
                  {Math.max(1, Math.round((summary?.durationSec ?? session.elapsedSec) / 60))} min
                </Text>
              </View>

              <View className="flex-row items-center gap-1 bg-[#FAF8F5] border border-[#E3DDD1] px-3.5 py-1.5 rounded-full shadow-xs">
                <CircleDot size={12} color="#26362E" />
                <Text className="text-xs font-semibold text-[#26362E]">
                  {session.cycles} Rounds
                </Text>
              </View>
            </View>

            {saving && (
              <View className="flex-row items-center gap-2 mt-2">
                <ActivityIndicator size="small" color="#26362E" />
                <Text className="text-xs text-[#7A8A81]">Recording mindful session…</Text>
              </View>
            )}

            {saveError ? (
              <Text className="text-xs text-[#A83A2E] text-center mt-2 px-2">{saveError}</Text>
            ) : null}

            {reward ? (
              <View className="bg-[#F3EDE2] border border-[#E5DDCB] px-4 py-2 rounded-2xl flex-row items-center gap-2 mt-3">
                <Award size={14} color="#715E41" />
                <Text className="text-xs font-semibold text-[#54442A]">{reward}</Text>
              </View>
            ) : null}
          </Animated.View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.85}
              className="h-[52px] rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25"
            >
              <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                Return to Solace
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => session.restart()}
              activeOpacity={0.7}
              className="h-[50px] rounded-full border border-[#D5CEC0] bg-[#FAF8F5] items-center justify-center"
            >
              <Text className="text-xs font-semibold text-[#26362E]">Breathe Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentPhaseDuration = pattern[session.phase] || 4;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between p-6">

        {/* Top Header & Pattern Badges */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              onPress={exit}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={20} color="#26362E" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D1E0D6]">
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                Box Cadence
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => session.restart()}
              disabled={!session.started}
              activeOpacity={0.7}
              className={`w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm ${!session.started ? 'opacity-30' : 'opacity-100'
                }`}
              accessibilityRole="button"
              accessibilityLabel="Restart"
            >
              <RotateCcw size={16} color="#26362E" />
            </TouchableOpacity>
          </View>

          {/* Subtitle / Round Count */}
          <View className="items-center">
            <Text className="text-xs text-[#7A8A81] font-medium tracking-wide">
              Round {session.started ? session.cycle : 1} of {session.cycles} • {pattern.inhale}s
            </Text>
          </View>
        </View>

        {/* Center Breathing Hero & Labels */}
        <View className="flex-1 items-center justify-center my-4">
          <BreathingCircle
            phase={session.phase}
            remaining={session.remaining}
            running={session.running}
            duration={currentPhaseDuration}
            label={LABELS[session.phase]}
          />

          {/* Dynamic Phase Text */}
          <View className="mt-8 items-center">
            <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
              {LABELS[session.phase]}
            </Text>
            <Text className="text-xs text-[#6E7E75] mt-1 text-center font-normal px-6">
              {SUB_LABELS[session.phase]}
            </Text>
          </View>
        </View>

        {/* Bottom Floating Timer & Controls */}
        <View>
          {/* Elapsed Timer Pill */}
          <View className="items-center mb-4">
            <View className="flex-row items-center gap-1.5 bg-white border border-[#E8E2D6] px-4 py-1.5 rounded-full shadow-xs">
              <Clock size={12} color="#718279" />
              <Text className="text-xs font-semibold text-[#303E35]">
                {Math.floor(session.elapsedSec / 60)}:{String(session.elapsedSec % 60).padStart(2, '0')}{' '}
                <Text className="text-[#86958D] font-normal">/ ~{Math.round(session.totalSec / 60)} min</Text>
              </Text>
            </View>
          </View>

          {/* Control Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync().catch(() => { });
              if (!session.started) session.start();
              else if (session.running) session.pause();
              else session.resume();
            }}
            activeOpacity={0.85}
            className="w-full h-[54px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25"
          >
            {!session.started ? (
              <>
                <Play size={16} color="#FAF8F5" fill="#FAF8F5" />
                <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                  Begin Breathing
                </Text>
              </>
            ) : session.running ? (
              <>
                <Pause size={16} color="#FAF8F5" fill="#FAF8F5" />
                <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                  Pause Practice
                </Text>
              </>
            ) : (
              <>
                <Play size={16} color="#FAF8F5" fill="#FAF8F5" />
                <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                  Resume Practice
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}