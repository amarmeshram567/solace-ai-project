import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Sparkles,
  Check,
  ArrowRight,
  Smile,
  Tag,
  FileText,
  Award,
  Compass,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import MoodPicker from '../../src/features/mood/MoodPicker';
import { MOOD_META } from '../../src/constants/moods';
import { useAuth } from '../../src/auth/AuthContext';
import { ApiError } from '../../src/services/api';
import { newRequestId, rewardText } from '../../src/utils/rewards';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Check, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });
cssInterop(Smile, { className: 'style' });
cssInterop(Tag, { className: 'style' });
cssInterop(FileText, { className: 'style' });
cssInterop(Award, { className: 'style' });
cssInterop(Compass, { className: 'style' });

export default function MoodCheckin() {

  const { showNotification } = useNotification();

  const { authedRequest } = useAuth();
  const clientRequestId = useRef(newRequestId()).current;
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState('pick'); // 'pick' | 'details' | 'done'
  const [mood, setMood] = useState(null);
  const [intensity, setIntensity] = useState(null);
  const [note, setNote] = useState('');
  const [tagText, setTagText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isTagFocused, setIsTagFocused] = useState(false);

  // Micro-interaction button press spring
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const submit = async () => {
    if (!mood || submitting) return;
    setSubmitting(true);
    setError('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

    const tags = tagText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);

    try {
      const data = await authedRequest('/moods', {
        method: 'POST',
        body: { mood, intensity, note: note.trim() || null, tags, clientRequestId },
      });
      setResult(data);
      setStep('done');

      showNotification({
        title: 'Check-In Recorded',
        message: 'Your mood check-in has been successfully saved.',
        type: 'success',
      })

    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not save your check-in. Please try again.'
      );

      showNotification({
        title: 'Check-In Failed',
        message: err.message || 'Could not save your mood check-in. Please try again.',
        type: 'alert',
      })

    } finally {
      setSubmitting(false);
    }
  };

  const handlePickContinue = () => {
    Haptics.selectionAsync().catch(() => { });
    setStep('details');
  };

  const handleBackNavigation = () => {
    Haptics.selectionAsync().catch(() => { });
    if (step === 'details') {
      setStep('pick');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container for Mobile & Web Centering */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between">

        {/* Navigation & Stage Header */}
        <View className="px-6 pt-4 pb-3 bg-[#FAF8F5] border-b border-[#EFEBE1] flex-row items-center justify-between">
          {step !== 'done' ? (
            <TouchableOpacity
              onPress={handleBackNavigation}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={20} color="#26362E" />
            </TouchableOpacity>
          ) : (
            <View className="w-10 h-10" />
          )}

          <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D1E0D6]">
            <Sparkles size={12} color="#355243" />
            <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
              {step === 'done' ? 'Recorded' : step === 'details' ? 'Reflection' : 'Daily Mood'}
            </Text>
          </View>

          <View className="w-10 h-10" />
        </View>

        {/* Dynamic Multi-Step Body */}
        {step === 'done' && result ? (
          /* STEP 3: Complete / Reflection View */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 36, alignItems: 'center' }}
            className="flex-1"
          >
            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.duration(420)}
              className="w-full items-center"
            >
              {/* Concentric Organic Aura Rings */}
              <View className="w-40 h-40 rounded-full bg-[#E5EDE8] items-center justify-center mb-6 relative">
                <View className="w-28 h-28 rounded-full bg-[#C9DDD1] items-center justify-center">
                  <View className="w-16 h-16 rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25">
                    <Check size={32} color="#FAF8F5" strokeWidth={2.8} />
                  </View>
                </View>
              </View>

              <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight text-center mb-2">
                Thank You for Checking In
              </Text>

              {/* Serene Reflection Card */}
              <View className="w-full bg-[#E5EDE8] border border-[#D4E1D8] p-5 rounded-3xl mb-5 shadow-sm shadow-[#26362E]/5">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Sparkles size={13} color="#385244" />
                  <Text className="text-[10px] uppercase tracking-wider font-bold text-[#385244]">
                    Zen Reflection
                  </Text>
                </View>
                <Text className="text-xs text-[#223329] leading-relaxed font-normal">
                  {result.reflection || 'Acknowledging how you feel creates a gentle pause for your nervous system to reset.'}
                </Text>
              </View>

              {/* Recommended Routine / DeepLink */}
              {result.suggestion ? (
                <TouchableOpacity
                  onPress={() => router.push(result.suggestion.deepLink)}
                  activeOpacity={0.85}
                  className="w-full bg-[#26362E] p-4 rounded-3xl flex-row items-center justify-between mb-4 shadow-md shadow-[#26362E]/20"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center">
                      <Compass size={18} color="#FAF8F5" />
                    </View>
                    <View>
                      <Text className="text-[10px] uppercase font-semibold text-[#A3C2B1] tracking-wider">
                        Suggested Practice
                      </Text>
                      <Text className="text-xs font-bold text-[#FAF8F5]">
                        {result.suggestion.label}
                      </Text>
                    </View>
                  </View>
                  <ArrowRight size={16} color="#FAF8F5" />
                </TouchableOpacity>
              ) : null}

              {/* Reward Badge */}
              {rewardText(result.reward) ? (
                <View className="bg-[#F3EDE2] border border-[#E5DDCB] px-4 py-2 rounded-2xl flex-row items-center gap-2 mb-4">
                  <Award size={14} color="#715E41" />
                  <Text className="text-xs font-semibold text-[#54442A]">
                    {rewardText(result.reward)}
                  </Text>
                </View>
              ) : null}
            </Animated.View>
          </ScrollView>
        ) : step === 'pick' ? (
          /* STEP 1: Mood Picker Grid */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 28 }}
            className="flex-1"
          >
            <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(360)}>
              <View className="mb-4">
                <Text
                  accessibilityRole="header"
                  className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight leading-tight"
                >
                  How are you feeling right now?
                </Text>
                <Text className="text-xs text-[#707E76] mt-1 font-normal leading-relaxed">
                  Notice whatever is here without judgment. Give yourself permission to feel.
                </Text>
              </View>

              <MoodPicker value={mood} onChange={setMood} />
            </Animated.View>
          </ScrollView>
        ) : (
          /* STEP 2: Intensity, Note & Context Tags */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 28 }}
            className="flex-1"
          >
            <Animated.View entering={reduceMotion ? undefined : FadeInRight.duration(300)}>

              {/* Selected Mood Chip Banner */}
              <View className="flex-row items-center justify-between bg-white border border-[#E8E2D6] p-4 rounded-3xl mb-5 shadow-sm shadow-[#26362E]/5">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-[#E5EDE8] items-center justify-center">
                    <Smile size={20} color="#26362E" />
                  </View>
                  <View>
                    <Text className="text-[10px] uppercase tracking-wider font-semibold text-[#7A8A81]">
                      Identified Mood
                    </Text>
                    <Text className="text-base font-serif font-bold text-[#1C2520] capitalize">
                      {MOOD_META[mood]?.label || mood}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setStep('pick')}
                  activeOpacity={0.7}
                  className="bg-[#FAF8F5] border border-[#DDD6C7] px-3 py-1.5 rounded-full"
                >
                  <Text className="text-xs font-semibold text-[#26362E]">Change</Text>
                </TouchableOpacity>
              </View>

              {/* Intensity Picker (1-5 Pills) */}
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-2.5 px-1">
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
                    How strong is it? (optional)
                  </Text>
                  <Text className="text-xs text-[#7A8881]">
                    {intensity !== null ? `${intensity} of 5` : 'Gentle / Default'}
                  </Text>
                </View>

                <View className="flex-row justify-between gap-2" accessibilityRole="radiogroup">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const isSelected = intensity !== null && n <= intensity;
                    const isExact = intensity === n;

                    return (
                      <Pressable
                        key={n}
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => { });
                          setIntensity(intensity === n ? null : n);
                        }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isExact }}
                        accessibilityLabel={`Intensity ${n} of 5`}
                        className={`flex-1 h-[48px] rounded-2xl items-center justify-center border transition-all ${isSelected
                          ? 'bg-[#26362E] border-[#26362E] shadow-sm shadow-[#26362E]/20'
                          : 'bg-white border-[#E8E2D6] active:bg-[#F2EDE2]'
                          }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${isSelected ? 'text-[#FAF8F5]' : 'text-[#56655D]'
                            }`}
                        >
                          {n}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Note / Context Input */}
              <View className="mb-4">
                <View className="flex-row items-center gap-1.5 mb-1.5 ml-1">
                  <FileText size={13} color="#54625A" />
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
                    What is making you feel this way?
                  </Text>
                </View>

                <View
                  className={`bg-white border rounded-2xl p-4 min-h-[100px] ${isNoteFocused ? 'border-[#26362E]' : 'border-[#E6E1D5]'
                    } shadow-sm shadow-[#26362E]/5`}
                >
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    onFocus={() => setIsNoteFocused(true)}
                    onBlur={() => setIsNoteFocused(false)}
                    placeholder="A few words or bodily observations are enough..."
                    placeholderTextColor="#A9B3AC"
                    multiline
                    maxLength={1000}
                    autoCapitalize="sentences"
                    className="text-sm text-[#1E2522] leading-relaxed"
                    style={{
                      outlineStyle: 'none',
                      borderWidth: 0,
                      textAlignVertical: 'top',
                    }}
                  />
                </View>
              </View>

              {/* Tags Input */}
              <View className="mb-4">
                <View className="flex-row items-center gap-1.5 mb-1.5 ml-1">
                  <Tag size={13} color="#54625A" />
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
                    Tags (optional)
                  </Text>
                </View>

                <View
                  className={`flex-row items-center h-[50px] px-4 rounded-2xl bg-white border ${isTagFocused ? 'border-[#26362E]' : 'border-[#E6E1D5]'
                    } shadow-sm shadow-[#26362E]/5`}
                >
                  <TextInput
                    value={tagText}
                    onChangeText={setTagText}
                    onFocus={() => setIsTagFocused(true)}
                    onBlur={() => setIsTagFocused(false)}
                    placeholder="e.g. work, family, sleep, outdoors"
                    placeholderTextColor="#A9B3AC"
                    className="flex-1 text-sm text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0 }}
                    autoCapitalize="none"
                  />
                </View>
                <Text className="text-[10px] text-[#86948B] mt-1 ml-1.5">
                  Comma separated to track recurring circumstances.
                </Text>
              </View>

              {error ? (
                <View className="bg-[#FBF1EF] p-3 rounded-2xl border border-[#F4D2CC] mb-2">
                  <Text className="text-xs text-[#A83A2E] text-center font-medium">{error}</Text>
                </View>
              ) : null}
            </Animated.View>
          </ScrollView>
        )}

        {/* Footer Actions Dock */}
        <View className="w-full px-6 pt-3 pb-6 bg-[#FAF8F5] border-t border-[#EAE4D7] shadow-sm shadow-[#26362E]/5">
          {step === 'done' ? (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => { });
                router.replace('/(tabs)');
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Return to home solace"
              className="w-full h-[54px] rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/20"
            >
              <Text className="text-[14px] font-semibold text-[#FAF8F5] tracking-wide">
                Back to Home
              </Text>
            </TouchableOpacity>
          ) : step === 'pick' ? (
            <Animated.View style={buttonAnimatedStyle} className="w-full">
              <TouchableOpacity
                onPress={() => {
                  if (!mood) return;
                  Haptics.selectionAsync().catch(() => { });
                  handlePickContinue();
                }}
                disabled={!mood}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Continue to reflection note"
                accessibilityState={{ disabled: !mood }}
                className={`w-full h-[54px] rounded-full flex-row items-center justify-center gap-2 transition-all ${!mood
                  ? 'bg-[#E8E2D6] opacity-75'
                  : 'bg-[#26362E] shadow-lg shadow-[#26362E]/25'
                  }`}
              >
                <Text
                  className={`text-[14px] font-semibold tracking-wide ${!mood ? 'text-[#8E8678]' : 'text-[#FAF8F5]'
                    }`}
                >
                  Continue
                </Text>
                <ArrowRight
                  size={16}
                  color={!mood ? '#8E8678' : '#FAF8F5'}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View style={buttonAnimatedStyle} className="w-full">
              <TouchableOpacity
                onPress={() => {
                  if (submitting) return;
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
                  submit();
                }}
                disabled={submitting}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Save check-in and finish"
                className="w-full h-[54px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25"
              >
                {submitting ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#FAF8F5" />
                    <Text className="text-[14px] font-semibold text-[#FAF8F5] tracking-wide">
                      Saving Reflection…
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text className="text-[14px] font-semibold text-[#FAF8F5] tracking-wide">
                      Complete Check-In
                    </Text>
                    <Check size={16} color="#FAF8F5" strokeWidth={2.4} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}