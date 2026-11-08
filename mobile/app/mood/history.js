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
import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Smile,
  Tag,
  FileText,
  Clock,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  useReducedMotion,
  LinearTransition,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';
import { useAuth } from '../../src/auth/AuthContext';
import { MOOD_META } from '../../src/constants/moods';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(ChevronRight, { className: 'style' });
cssInterop(TrendingUp, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Calendar, { className: 'style' });
cssInterop(Smile, { className: 'style' });
cssInterop(Tag, { className: 'style' });
cssInterop(FileText, { className: 'style' });
cssInterop(Clock, { className: 'style' });

const RANGES = [
  { key: 'week', label: 'Last 7 Days' },
  { key: 'month', label: 'Last 30 Days' },
];

export default function MoodHistory() {

  const { showNotification } = useNotification();

  const { authedRequest } = useAuth();
  const reduceMotion = useReducedMotion();

  const [range, setRange] = useState('week');
  const analytics = useRemote(`/moods/analytics?range=${range}`);
  const list = useRemote('/moods?limit=20');
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = async () => {
    if (!list.data?.nextCursor || loadingMore) return;
    Haptics.selectionAsync().catch(() => { });
    setLoadingMore(true);
    try {
      const more = await authedRequest(
        `/moods?limit=20&before=${encodeURIComponent(list.data.nextCursor)}`
      );
      list.setData((d) => ({
        items: [...d.items, ...more.items],
        nextCursor: more.nextCursor,
      }));

      showNotification({
        title: 'More Entries Loaded',
        message: 'Older check-ins have been successfully loaded.',
        type: 'success',
      })

    } finally {
      setLoadingMore(false);
    }
  };

  const byDayData = analytics.data?.byDay ?? [];
  const maxDay = Math.max(1, ...byDayData.map((d) => d.count || 0));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col">

        {/* Navigation & Segment Filter Header */}
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
              <TrendingUp size={12} color="#355243" />
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                Emotional Log
              </Text>
            </View>

            <View className="w-10 h-10" />
          </View>

          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
            Mood History
          </Text>
          <Text className="text-xs text-[#707E76] mt-0.5 font-normal">
            Reflect on how your nervous system and emotions flow over time.
          </Text>

          {/* Segmented Filter Switcher */}
          <View className="flex-row h-[46px] rounded-full p-1 bg-[#ECE7DC] border border-[#E0D9CB] mt-3.5">
            {RANGES.map((r) => {
              const selected = range === r.key;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => { });
                    setRange(r.key);
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  className={`flex-1 h-full rounded-full items-center justify-center transition-all ${selected ? 'bg-[#26362E] shadow-sm' : 'bg-transparent active:bg-[#DFD8CB]'
                    }`}
                >
                  <Text
                    className={`text-xs font-semibold tracking-wide ${selected ? 'text-[#FAF8F5]' : 'text-[#67776F]'
                      }`}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Scrollable Analytics & Entries */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 }}
          className="flex-1"
        >
          {/* Analytics Chart Card */}
          <Animated.View
            layout={reduceMotion ? undefined : LinearTransition.springify()}
            className="mb-6"
          >
            <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E]">
                    Check-In Frequency
                  </Text>
                  <Text className="text-[11px] text-[#86948B] mt-0.5">
                    {analytics.data?.totalEntries ?? 0} total logs in this timeframe
                  </Text>
                </View>
                <View className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E8E2D6] items-center justify-center">
                  <Sparkles size={12} color="#26362E" />
                </View>
              </View>

              {analytics.status === 'loading' && !analytics.data ? (
                <View className="py-8">
                  <LoadingState message="Looking at your patterns…" />
                </View>
              ) : null}

              {analytics.status === 'error' && !analytics.data ? (
                <ErrorState message={analytics.error} onRetry={analytics.reload} />
              ) : null}

              {analytics.data ? (
                analytics.data.totalEntries === 0 ? (
                  <Text className="text-xs text-[#7B8B82] py-4 text-center leading-relaxed">
                    No check-ins yet in this period. Your patterns will appear here as you log your day.
                  </Text>
                ) : (
                  <View>
                    {/* Fixed-Baseline Animated Bar Chart */}
                    <View className="flex-row items-end justify-between h-[115px] pt-4 px-1">
                      {byDayData.map((d, index) => {
                        const targetHeight = d.count ? Math.max(14, (d.count / maxDay) * 78) : 6;
                        const dayNumber = d.date.slice(8);
                        return (
                          <View key={d.date} className="flex-1 items-center justify-end">
                            <View className="h-[80px] w-full items-center justify-end">
                              <AlignedBarColumn
                                targetHeight={targetHeight}
                                hasValue={Boolean(d.count)}
                                delay={index * 35}
                              />
                            </View>
                            <Text className="text-[10px] font-semibold text-[#8C9A92] mt-2">
                              {dayNumber}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* Mood Distribution Chips */}
                    {analytics.data.byMood ? (
                      <View className="flex-row flex-wrap gap-2 mt-5 pt-3.5 border-t border-[#F0EBE0]">
                        {Object.entries(analytics.data.byMood).map(([moodKey, count]) => (
                          <View
                            key={moodKey}
                            className="flex-row items-center gap-1.5 bg-[#F6F3EC] border border-[#EAE3D5] px-3 py-1.5 rounded-full"
                          >
                            <Text className="text-xs font-semibold text-[#303E35] capitalize">
                              {MOOD_META[moodKey]?.label ?? moodKey}
                            </Text>
                            <View className="w-1.5 h-1.5 rounded-full bg-[#8FA89B]" />
                            <Text className="text-xs font-bold text-[#26362E]">{count}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                )
              ) : null}
            </View>
          </Animated.View>

          {/* Past Entries List Section */}
          <View>
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E]">
                Recorded Entries
              </Text>
              <Text className="text-xs text-[#8A9790]">
                {list.data?.items?.length ?? 0} shown
              </Text>
            </View>

            {list.status === 'loading' && !list.data ? (
              <View className="py-8">
                <LoadingState message="Loading check-ins…" />
              </View>
            ) : null}

            {list.status === 'error' && !list.data ? (
              <ErrorState message={list.error} onRetry={list.reload} />
            ) : null}

            {list.data?.items.length === 0 ? (
              <View className="py-12 items-center bg-[#F4F1EA] rounded-3xl border border-[#E7E2D5] px-6">
                <Smile size={24} color="#8A9790" />
                <Text className="text-sm font-serif font-bold text-[#2A3730] mt-2 mb-1">
                  No check-ins yet
                </Text>
                <Text className="text-xs text-[#7E8D84] text-center leading-relaxed">
                  Your first check-in will start your mindful history.
                </Text>
              </View>
            ) : null}

            <View className="gap-3">
              {list.data?.items.map((entry, index) => {
                const meta = MOOD_META[entry.mood];
                const IconComponent = meta?.Icon || Smile;

                return (
                  <Animated.View
                    key={entry.id}
                    entering={
                      reduceMotion
                        ? undefined
                        : FadeInDown.duration(360).delay(Math.min(index * 40, 250))
                    }
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => { });
                        router.push(`/mood/${entry.id}`);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${entry.moodLabel}, ${new Date(entry.recordedAt).toLocaleDateString()}`}
                      className="bg-white border border-[#E8E2D6] p-4 rounded-3xl active:scale-[0.99] transition-all shadow-sm shadow-[#26362E]/5"
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        {/* Circular Mood Emblem */}
                        <View className="w-11 h-11 rounded-full bg-[#E5EDE8] border border-[#D5E1D9] items-center justify-center">
                          <IconComponent size={20} color="#26362E" />
                        </View>

                        <View className="flex-1 pr-1">
                          <View className="flex-row items-center justify-between mb-0.5">
                            <Text className="text-base font-serif font-bold text-[#1C2520]">
                              {entry.moodLabel}
                            </Text>
                            <Text className="text-[10px] text-[#86948B]">
                              {new Date(entry.recordedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Text>
                          </View>

                          {/* Intensity Badge */}
                          {entry.intensity ? (
                            <View className="flex-row items-center gap-1 mb-1.5">
                              <Text className="text-[10px] uppercase font-bold text-[#67776F]">
                                Intensity:
                              </Text>
                              <View className="flex-row gap-0.5">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                  <View
                                    key={lvl}
                                    className={`w-1.5 h-1.5 rounded-full ${lvl <= entry.intensity ? 'bg-[#26362E]' : 'bg-[#E0DAD0]'
                                      }`}
                                  />
                                ))}
                              </View>
                            </View>
                          ) : null}

                          {/* Note Excerpt */}
                          <Text
                            className="text-xs text-[#526158] leading-relaxed mb-2"
                            numberOfLines={2}
                          >
                            {entry.note || 'No notes added'}
                          </Text>

                          {/* Tag Chips */}
                          {entry.tags?.length > 0 ? (
                            <View className="flex-row flex-wrap gap-1.5">
                              {entry.tags.map((t) => (
                                <View
                                  key={t}
                                  className="bg-[#F4F0E8] border border-[#E7E0D3] px-2 py-0.5 rounded-full"
                                >
                                  <Text className="text-[10px] text-[#637269] font-medium">
                                    #{t}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          ) : null}
                        </View>

                        <ChevronRight size={16} color="#A8B4AC" className="self-center" />
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>

            {/* Load More Button */}
            {list.data?.nextCursor ? (
              <View className="mt-5">
                <TouchableOpacity
                  onPress={loadMore}
                  disabled={loadingMore}
                  activeOpacity={0.85}
                  className="h-[50px] rounded-full border border-[#D5CEC0] bg-[#F4EFE6]/60 items-center justify-center flex-row gap-2 shadow-xs"
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="#26362E" />
                  ) : (
                    <Text className="text-xs font-semibold text-[#26362E]">
                      Load Older Entries
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Fixed Baseline Animated Bar
function AlignedBarColumn({ targetHeight, hasValue, delay = 0 }) {
  const heightAnim = useSharedValue(6);

  useEffect(() => {
    heightAnim.value = 6;
    const timer = setTimeout(() => {
      heightAnim.value = withSpring(targetHeight, {
        damping: 15,
        stiffness: 110,
        mass: 0.9,
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [targetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`w-3 rounded-full ${hasValue ? 'bg-[#26362E]' : 'bg-[#E5E1D5]'}`}
    />
  );
}