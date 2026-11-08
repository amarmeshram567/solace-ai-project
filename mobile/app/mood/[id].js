import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Trash2,
  Smile,
  Calendar,
  Tag,
  FileText,
  Sparkles,
  Check,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import ScreenContainer from '../../src/components/ScreenContainer';


import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';
import { useAuth } from '../../src/auth/AuthContext';
import { ApiError } from '../../src/services/api';
import { MOOD_META } from '../../src/constants/moods';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Trash2, { className: 'style' });
cssInterop(Smile, { className: 'style' });
cssInterop(Calendar, { className: 'style' });
cssInterop(Tag, { className: 'style' });
cssInterop(FileText, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Check, { className: 'style' });

export default function MoodEntryDetail() {

  const { showNotification } = useNotification();

  const { id } = useLocalSearchParams();
  const { authedRequest } = useAuth();
  const entry = useRemote(`/moods/${id}`);
  const reduceMotion = useReducedMotion();

  const [note, setNote] = useState('');
  const [intensity, setIntensity] = useState(null);
  const [tagText, setTagText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [isTagFocused, setIsTagFocused] = useState(false);

  useEffect(() => {
    if (entry.data) {
      setNote(entry.data.note ?? '');
      setIntensity(entry.data.intensity);
      setTagText(entry.data.tags ? entry.data.tags.join(', ') : '');
    }
  }, [entry.data]);

  const save = async () => {
    setBusy(true);
    setError('');
    Haptics.selectionAsync().catch(() => { });
    const tags = tagText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);

    try {
      await authedRequest(`/moods/${id}`, {
        method: 'PATCH',
        body: { note: note.trim() || null, intensity, tags },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
      router.back();

      showNotification({
        title: 'Check-In Updated',
        message: 'Your check-in has been successfully updated.',
        type: 'success',
      })

    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save changes.');

      showNotification({
        title: 'Update Failed',
        message: err.message || 'Could not save your check-in. Please try again.',
        type: 'alert',
      })

    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    Alert.alert('Delete this check-in?', 'This removes it from your emotional timeline. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await authedRequest(`/moods/${id}`, { method: 'DELETE' });
            router.back();

            showNotification({
              title: 'Check-In Deleted',
              message: 'This check-in has been removed from your timeline.',
              type: 'mindful',
            })

          } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Could not delete. Please try again.');
            setBusy(false);

            showNotification({
              title: 'Deletion Failed',
              message: err.message || 'Could not delete this check-in. Please try again.',
              type: 'alert',
            })

          }
        },
      },
    ]);
  };

  if (entry.status === 'loading' && !entry.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <LoadingState message="Opening your check-in…" />
      </SafeAreaView>
    );
  }

  if (entry.status === 'error' && !entry.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <ErrorState message={entry.error} onRetry={entry.reload} />
      </SafeAreaView>
    );
  }

  const moodData = entry.data || {};
  const meta = MOOD_META[moodData.mood] || {};

  return (
    <ScreenContainer>
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        {/* Responsive Canvas Container for Mobile & Web Centering */}
        <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between">

          {/* Navigation Bar */}
          <View className="px-6 pt-4 pb-3 bg-[#FAF8F5] border-b border-[#EFEBE1] flex-row items-center justify-between">
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
                Check-In Record
              </Text>
            </View>

            <TouchableOpacity
              onPress={confirmDelete}
              disabled={busy}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-[#FBECE6] border border-[#F2DDD5] items-center justify-center shadow-xs"
              accessibilityRole="button"
              accessibilityLabel="Delete entry"
            >
              <Trash2 size={16} color="#A83A2E" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32 }}
            className="flex-1"
          >
            <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(380)}>

              {/* 1. Mood Hero Banner Card */}
              <View className="bg-[#26362E] rounded-[30px] p-6 relative overflow-hidden shadow-lg shadow-[#26362E]/20 mb-6">
                {/* Organic Decorative Hills */}
                <View className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-white/5" />
                <View className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-[#8FA89B]/15" />

                <View className="flex-row items-center justify-between mb-3">
                  <View className="w-12 h-12 rounded-full bg-[#FAF8F5]/15 border border-white/20 items-center justify-center">
                    <Smile size={24} color="#FAF8F5" strokeWidth={2.2} />
                  </View>
                  <View className="bg-[#FAF8F5]/20 px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-semibold text-[#FAF8F5] uppercase tracking-wider">
                      {meta.category ?? 'Mood Log'}
                    </Text>
                  </View>
                </View>

                <Text className="text-[26px] font-serif font-bold text-[#FAF8F5] tracking-tight mb-1">
                  {moodData.moodLabel || meta.label || 'Present State'}
                </Text>

                <View className="flex-row items-center gap-1.5 mt-2">
                  <Calendar size={12} color="#BAC9BF" />
                  <Text className="text-xs text-[#BAC9BF]">
                    {new Date(moodData.recordedAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </View>
              </View>

              {/* 2. Intensity Rating (1-5 Organic Pills) */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2.5 px-1">
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
                    Intensity Level
                  </Text>
                  <Text className="text-xs text-[#7A8881]">
                    {intensity !== null ? `${intensity} of 5` : 'Not specified'}
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
                        accessibilityLabel={`Intensity ${n}`}
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

              {/* 3. Reflection Note Input */}
              <View className="mb-5">
                <View className="flex-row items-center gap-1.5 mb-1.5 ml-1">
                  <FileText size={13} color="#54625A" />
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
                    Personal Reflection
                  </Text>
                </View>

                <View
                  className={`bg-white border rounded-2xl p-4 min-h-[110px] ${isNoteFocused ? 'border-[#26362E]' : 'border-[#E6E1D5]'
                    } shadow-sm shadow-[#26362E]/5`}
                >
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    onFocus={() => setIsNoteFocused(true)}
                    onBlur={() => setIsNoteFocused(false)}
                    placeholder="How did this feeling arise? What did your body experience?"
                    placeholderTextColor="#A9B3AC"
                    multiline
                    maxLength={1000}
                    className="text-sm text-[#1E2522] leading-relaxed"
                    style={{
                      outlineStyle: 'none',
                      borderWidth: 0,
                      textAlignVertical: 'top',
                    }}
                  />
                </View>
              </View>

              {/* 4. Contextual Tags */}
              <View className="mb-4">
                <View className="flex-row items-center gap-1.5 mb-1.5 ml-1">
                  <Tag size={13} color="#54625A" />
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
                    Context Tags
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
                    placeholder="work, breath, outdoors, rest (comma separated)"
                    placeholderTextColor="#A9B3AC"
                    className="flex-1 text-sm text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0 }}
                    autoCapitalize="none"
                  />
                </View>
                <Text className="text-[10px] text-[#86948B] mt-1 ml-1.5">
                  Up to 5 comma-separated tags to track emotional triggers.
                </Text>
              </View>

              {error ? (
                <View className="bg-[#FBF1EF] p-3 rounded-2xl border border-[#F4D2CC] mb-3">
                  <Text className="text-xs text-[#A83A2E] text-center font-medium">{error}</Text>
                </View>
              ) : null}
            </Animated.View>
          </ScrollView>

          {/* Bottom Save Action */}
          <View className="px-6 py-4 bg-[#FAF8F5] border-t border-[#EFEBE1]">
            <TouchableOpacity
              onPress={save}
              disabled={busy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              className="h-[52px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25"
            >
              {busy ? (
                <ActivityIndicator size="small" color="#FAF8F5" />
              ) : (
                <>
                  <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                    Save Changes
                  </Text>
                  <Check size={16} color="#FAF8F5" strokeWidth={2.4} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScreenContainer>
  );
}