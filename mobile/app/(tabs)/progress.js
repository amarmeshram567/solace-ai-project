import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  Check,
  Flame,
  Heart,
  Wind,
  Sparkles,
  Calendar as CalendarIcon,
  Activity,
  ShieldCheck,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import ScreenContainer from '../../src/components/ScreenContainer';
import ProgressBar from '../../src/components/ProgressBar';
import { ErrorState, LoadingState, SectionHeader } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';
import { MOOD_META } from '../../src/constants/moods';

cssInterop(Check, { className: 'style' });
cssInterop(Flame, { className: 'style' });
cssInterop(Heart, { className: 'style' });
cssInterop(Wind, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(CalendarIcon, { className: 'style' });
cssInterop(Activity, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const RANGES = [
  { key: 'week', label: 'Last 7 Days' },
  { key: 'month', label: 'Last 30 Days' },
];

export default function Progress() {
  const [range, setRange] = useState('week');
  const { status, data, error, reload } = useRemote(`/progress?range=${range}`, { enabled: false });
  const reduceMotion = useReducedMotion();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <ScreenContainer scroll={true} edges={['top']} contentStyle={styles.scrollContent}>
      {/* 1. Header & Segmented Pill Switcher */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(400)}
        className="w-full mb-2"
      >
        <View className="flex-row items-center gap-1.5 mb-1.5">
          <Sparkles size={13} color="#526F60" />
          <Text className="text-[11px] uppercase font-bold text-[#526F60] tracking-widest">
            Mindful Analytics
          </Text>
        </View>

        <Text
          accessibilityRole="header"
          className="text-[28px] font-serif font-bold text-[#1C2520] tracking-tight leading-[36px] mb-4"
        >
          Your Journey & Growth
        </Text>

        {/* Segmented Range Switcher */}
        <View
          accessibilityRole="tablist"
          className="w-full flex-row p-1.5 rounded-full bg-[#EAE4D8] border border-[#DDD5C5]"
        >
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
                className={`flex-1 py-2.5 rounded-full items-center justify-center transition-all ${selected
                  ? 'bg-[#26362E] shadow-sm shadow-[#26362E]/25'
                  : 'bg-transparent'
                  }`}
              >
                <Text
                  className={`text-[13px] tracking-tight ${selected
                    ? 'font-bold text-[#FAF8F5]'
                    : 'font-semibold text-[#665D4F]'
                    }`}
                >
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* 2. Loading / Error States */}
      {status === 'loading' && !data ? (
        <LoadingState message="Reflecting upon your mindful moments…" />
      ) : null}

      {status === 'error' && !data ? (
        <ErrorState
          title="Progress unavailable"
          message={error || 'Could not fetch your mindful activity history.'}
          onRetry={reload}
        />
      ) : null}

      {/* 3. Dashboard Body with Range Prop */}
      {data ? <Dashboard data={data} range={range} /> : null}
    </ScreenContainer>
  );
}

function Dashboard({ data, range }) {
  const reduceMotion = useReducedMotion();

  if (data.isEmpty) {
    return (
      <View className="w-full bg-[#FAF8F5] border border-[#E9E4D8] p-6 rounded-[32px] items-center text-center">
        <View className="w-12 h-12 rounded-full bg-[#E5EDE8] items-center justify-center mb-3">
          <Sparkles size={20} color="#26362E" />
        </View>
        <Text className="text-xl font-serif font-bold text-[#1C2520] mb-2 text-center">
          Your Growth Starts Here
        </Text>
        <Text className="text-xs text-[#6F7E75] leading-relaxed text-center max-w-[280px]">
          Record a mood check-in, complete breathwork, or finish a restorative activity. Your progress unfolds gently as you go.
        </Text>
      </View>
    );
  }

  const {
    level,
    streak,
    totals,
    inRange,
    moodTrend = [],
    moodDistribution = [],
    recentAssessments = [],
    achievements = [],
  } = data;

  const maxCount = Math.max(1, ...(moodTrend?.map((d) => d.count) || [1]));
  const totalMoods = (moodDistribution || []).reduce((sum, m) => sum + m.count, 0);

  const xpRemaining = (level.nextLevelXp || 100) - (level.totalXp || 0);
  const nextText = level.nextLevelName
    ? `${xpRemaining > 0 ? xpRemaining : 0} XP to ${level.nextLevelName}`
    : 'Highest Solace-ai Tier';

  const activeDaysCount = moodTrend.filter((d) => d.count > 0).length;

  return (
    <>
      {/* 1. Solace-ai Level Card */}
      <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(400)}>
        <View className="w-full bg-[#26362E] border border-[#1E2B25] p-6 rounded-[32px] shadow-sm shadow-[#26362E]/10 relative overflow-hidden">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-[#35483E] items-center justify-center relative shadow-xs">
                <View className="w-9 h-9 rounded-full bg-[#18231E] items-center justify-center shadow-xs">
                  <Text className="text-xs font-serif font-bold text-[#FAF8F5]">
                    {level.level}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-[10px] uppercase font-bold text-[#8FA597] tracking-widest">
                  Level {level.level}
                </Text>
                <Text className="text-[20px] font-serif font-bold text-[#FAF8F5] tracking-tight leading-snug">
                  {level.levelName}
                </Text>
              </View>
            </View>

            <View className="bg-white/10 border border-white/15 px-3 py-1 rounded-full">
              <Text className="text-[11px] font-bold text-[#FAF8F5] font-mono">
                {level.totalXp} XP
              </Text>
            </View>
          </View>

          <View className="bg-white/10 border border-white/10 p-4 rounded-2xl mb-2">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[11px] font-semibold text-[#C3D2CA] uppercase tracking-wider">
                Progress
              </Text>
              <Text className="text-[11px] font-bold text-[#FAF8F5] font-mono">
                {level.progress > 1 ? Math.round(level.progress) : Math.round((level.progress || 0) * 100)}%
              </Text>
            </View>
            <ProgressBar progress={level.progress} tone="light" height={8} />
          </View>

          <Text className="text-[11px] text-[#A2B6AC] font-medium px-1">
            {nextText}
          </Text>
        </View>
      </Animated.View>

      {/* 2. Responsive 2x2 Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View className="w-8 h-8 rounded-full bg-[#FCECE8] items-center justify-center mb-2">
            <Flame size={16} color="#A8432E" fill="#A8432E" />
          </View>
          <Text className="text-[22px] font-serif font-bold text-[#1C2520] leading-tight">
            {streak.current} {streak.current === 1 ? 'day' : 'days'}
          </Text>
          <Text className="text-[11px] text-[#718077] mt-0.5">
            Active streak · max {streak.longest}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View className="w-8 h-8 rounded-full bg-[#E5EDE8] items-center justify-center mb-2">
            <Heart size={16} color="#26362E" />
          </View>
          <Text className="text-[22px] font-serif font-bold text-[#1C2520] leading-tight">
            {totals.moodEntries}
          </Text>
          <Text className="text-[11px] text-[#718077] mt-0.5">
            Check-ins · {inRange.moodEntries} in {range === 'week' ? '7d' : '30d'}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View className="w-8 h-8 rounded-full bg-[#E8F1EC] items-center justify-center mb-2">
            <Wind size={16} color="#2D4638" />
          </View>
          <Text className="text-[22px] font-serif font-bold text-[#1C2520] leading-tight">
            {totals.breathingCompleted}
          </Text>
          <Text className="text-[11px] text-[#718077] mt-0.5">
            Breaths · {inRange.breathingSessions} in {range === 'week' ? '7d' : '30d'}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View className="w-8 h-8 rounded-full bg-[#F3EDE2] items-center justify-center mb-2">
            <Activity size={16} color="#6E5D46" />
          </View>
          <Text className="text-[22px] font-serif font-bold text-[#1C2520] leading-tight">
            {totals.activitiesCompleted}
          </Text>
          <Text className="text-[11px] text-[#718077] mt-0.5">
            Activities · {inRange.activitiesCompleted} in {range === 'week' ? '7d' : '30d'}
          </Text>
        </View>
      </View>

      {/* 3. Daily Rhythm Section */}
      <View className="w-full">
        <SectionHeader
          title={range === 'week' ? 'Daily Check-in Rhythm' : '30-Day Presence Calendar'}
          subtitle={
            range === 'week'
              ? 'One bar per day in your timezone'
              : `${activeDaysCount} of ${moodTrend.length} mindful days active`
          }
        />

        <View className="w-full bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-xs">
          {range === 'month' ? (
            /* 30-Day Calendar Heatmap Grid */
            <View className="w-full">
              {/* Day Headers */}
              <View style={styles.calRow}>
                {DAY_LETTERS.map((letter, i) => (
                  <View key={i} style={styles.calCellWrapper}>
                    <Text style={styles.calDayHeader}>{letter}</Text>
                  </View>
                ))}
              </View>

              {/* 30 Days Grid */}
              <View style={styles.calGrid}>
                {moodTrend.map((d) => {
                  const dateObj = new Date(`${d.date}T12:00:00Z`);
                  const dayNum = dateObj.getDate();
                  const hasActivity = d.count > 0;

                  return (
                    <View key={d.date} style={styles.calCellWrapper}>
                      <View
                        style={[
                          styles.calCell,
                          hasActivity ? styles.calCellActive : styles.calCellEmpty,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calCellText,
                            hasActivity ? styles.calCellTextActive : styles.calCellTextEmpty,
                          ]}
                        >
                          {dayNum}
                        </Text>
                        {hasActivity && <View style={styles.activeDot} />}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Legend */}
              <View style={styles.calLegend}>
                <Text className="text-[11px] text-[#718077]">
                  {activeDaysCount} days checked in
                </Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1.5">
                    <View style={[styles.legendBox, { backgroundColor: '#FAF8F5' }]} />
                    <Text className="text-[10px] text-[#8A968F]">Rest</Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View style={[styles.legendBox, { backgroundColor: '#26362E' }]} />
                    <Text className="text-[10px] text-[#26362E] font-semibold">Active</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : inRange.moodEntries === 0 ? (
            <Text className="text-xs text-[#718077] text-center py-4">
              No check-ins recorded in this timeline.
            </Text>
          ) : (
            /* 7-Day Bar Chart */
            <View className="flex-row items-end justify-between h-[116px] pt-4 pb-1 px-1">
              {moodTrend.map((d) => {
                const heightPercent = d.count ? Math.max(14, (d.count / maxCount) * 78) : 8;
                const letter = DAY_LETTERS[new Date(`${d.date}T12:00:00Z`).getUTCDay()];
                const hasActivity = d.count > 0;

                return (
                  <View
                    key={d.date}
                    className="flex-1 items-center justify-end h-full px-1"
                    accessible
                    accessibilityLabel={`${d.date}: ${d.count} check-ins`}
                  >
                    <View
                      style={{ height: heightPercent }}
                      className={`w-full max-w-[20px] rounded-full transition-all ${hasActivity ? 'bg-[#26362E]' : 'bg-[#EAE5DA]'
                        }`}
                    />
                    <Text
                      className={`text-[10px] mt-2 font-mono font-bold ${hasActivity ? 'text-[#26362E]' : 'text-[#A0ABA4]'
                        }`}
                    >
                      {letter}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* 4. Mood Breakdown Distribution */}
      <View className="w-full">
        <SectionHeader
          title="How You’ve Felt"
          subtitle="Reflective emotional distribution"
        />
        <View className="w-full bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-xs gap-3.5">
          {moodDistribution.length === 0 ? (
            <Text className="text-xs text-[#718077] py-2">
              No recorded mood patterns in this range.
            </Text>
          ) : (
            [...moodDistribution]
              .sort((a, b) => b.count - a.count)
              .map((m) => {
                const meta = MOOD_META[m.mood];
                const ratio = totalMoods ? m.count / totalMoods : 0;
                return (
                  <View key={m.mood} className="gap-1.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-semibold text-[#1C2520]">
                        {meta?.label ?? m.label}
                      </Text>
                      <Text className="text-xs font-mono font-bold text-[#6D7D74]">
                        {m.count} ({Math.round(ratio * 100)}%)
                      </Text>
                    </View>
                    <ProgressBar
                      progress={ratio}
                      tone="forest"
                      height={6}
                      label={`${meta?.label ?? m.label}: ${m.count}`}
                    />
                  </View>
                );
              })
          )}
        </View>
      </View>

      {/* 5. Recent Self-Checks */}
      <View className="w-full">
        <SectionHeader
          title="Recent Self-Checks"
          subtitle="Non-clinical mindful reflections"
        />
        <View className="w-full bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-xs gap-3">
          {recentAssessments.length === 0 ? (
            <Text className="text-xs text-[#718077] py-2">
              No reflections completed yet.
            </Text>
          ) : (
            recentAssessments.map((a, i) => (
              <View
                key={a.id}
                className={`pb-3 ${i !== recentAssessments.length - 1 ? 'border-b border-[#F0EBE0]' : ''
                  }`}
              >
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text className="text-sm font-serif font-bold text-[#1C2520]">
                    {a.title}
                  </Text>
                  <Text className="text-[10px] font-mono text-[#829188]">
                    {new Date(a.completedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-xs text-[#6F7E75]">
                  {a.category} · Score {a.totalScore}
                </Text>
              </View>
            ))
          )}

          <View className="flex-row items-center gap-1.5 pt-1">
            <ShieldCheck size={13} color="#8A9790" />
            <Text className="text-[10px] text-[#8A9790] leading-tight flex-1">
              Self-checks represent your mindful self-reporting, not a clinical diagnosis.
            </Text>
          </View>
        </View>
      </View>

      {/* 6. Milestones */}
      <View className="w-full">
        <SectionHeader
          title="Solace-AI Milestones"
          subtitle="Small victories worth noticing"
        />
        <View className="gap-2.5">
          {achievements.map((a) => (
            <View
              key={a.key}
              className={`w-full p-4 rounded-2xl border flex-row items-center justify-between ${a.unlocked ? 'bg-[#F3EDE2] border-[#E5DAC6]' : 'bg-white border-[#E9E4D8]'
                }`}
            >
              <View className="flex-1 pr-3">
                <Text className="text-sm font-serif font-bold text-[#1C2520] mb-0.5">
                  {a.title}
                </Text>
                <Text className="text-xs text-[#6F7E75] leading-relaxed">
                  {a.description}
                </Text>
              </View>

              {a.unlocked ? (
                <View className="w-7 h-7 rounded-full bg-[#26362E] items-center justify-center shadow-xs">
                  <Check size={14} color="#FAF8F5" strokeWidth={2.4} />
                </View>
              ) : (
                <View className="bg-[#FAF8F5] border border-[#E5E0D5] px-2.5 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-[#8A9790] font-mono">
                    {a.progress}/{a.target}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
    paddingHorizontal: 18,
    rowGap: 20,
    width: '100%',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    width: '100%',
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 22,
    padding: 14,
    shadowColor: '#26362E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  // Rigid 7-column calendar grid
  calRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 8,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    rowGap: 8,
  },
  calCellWrapper: {
    width: '14.28%', // 100% / 7 days
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayHeader: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#8A968F',
  },
  calCell: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  calCellActive: {
    backgroundColor: '#26362E',
    borderColor: '#26362E',
  },
  calCellEmpty: {
    backgroundColor: '#FAF8F5',
    borderColor: '#EAE4D7',
  },
  calCellText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  calCellTextActive: {
    color: '#FAF8F5',
  },
  calCellTextEmpty: {
    color: '#8A968F',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#95B2A2',
    position: 'absolute',
    bottom: 2,
  },
  calLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE0',
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#EAE4D7',
  },
});