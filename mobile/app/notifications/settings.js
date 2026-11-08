import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
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
  Bell,
  BellRing,
  Clock,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Inbox,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { ErrorState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/auth/AuthContext';
import { useRemote } from '../../src/hooks/useRemote';
import { enablePushNotifications } from '../../src/services/notifications';
import { ApiError } from '../../src/services/api';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Bell, { className: 'style' });
cssInterop(BellRing, { className: 'style' });
cssInterop(Clock, { className: 'style' });
cssInterop(Calendar, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Plus, { className: 'style' });
cssInterop(Trash2, { className: 'style' });
cssInterop(Check, { className: 'style' });
cssInterop(Inbox, { className: 'style' });
cssInterop(ChevronRight, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });

const TIMES = ['07:00', '09:00', '12:00', '18:00', '21:00'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function daysSummary(mask) {
  if (mask === 127) return 'Every day';
  return DAY_LABELS.filter((_, i) => (mask >> i) & 1).join(', ');
}

export default function NotificationSettings() {

  const { showNotification } = useNotification();

  const { authedRequest } = useAuth();
  const reduceMotion = useReducedMotion();

  const prefs = useRemote('/notifications/preferences');
  const inbox = useRemote('/notifications/inbox');

  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [label, setLabel] = useState('');
  const [labelError, setLabelError] = useState('');
  const [time, setTime] = useState('09:00');
  const [days, setDays] = useState(127);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (prefs.data && draft === null) setDraft(prefs.data.builtIn);
  }, [prefs.data, draft]);

  if (prefs.status === 'loading' && !prefs.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <LoadingState message="Gathering your mindful cadence…" />
      </SafeAreaView>
    );
  }

  if (prefs.status === 'error' && !prefs.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <ErrorState message={prefs.error} onRetry={prefs.reload} />
      </SafeAreaView>
    );
  }

  const custom = prefs.data?.custom ?? [];

  const turnOnPush = async () => {
    setPushMessage('');
    Haptics.selectionAsync().catch(() => { });
    try {
      const result = await enablePushNotifications(authedRequest);
      setPushMessage(result.ok ? 'Push reminders are active on this device.' : result.reason);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

      if (result.ok) {
        showNotification({
          title: 'Push Notifications Activated',
          message: 'Your quiet inbox will receive all reminders.',
          type: 'success',
        });
      }

    } catch {
      setPushMessage('Could not activate push notifications. Your quiet inbox still receives all reminders.');

      showNotification({
        title: 'Activation Failed',
        message: 'Could not activate push notifications. Please try again.',
        type: 'alert',
      });

    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage('');
    Haptics.selectionAsync().catch(() => { });
    try {
      const body = {
        items: draft.map(({ type, enabled, timeOfDay, daysMask }) => ({
          type,
          enabled,
          timeOfDay,
          daysMask,
        })),
      };
      const data = await authedRequest('/notifications/preferences', { method: 'PATCH', body });
      prefs.setData(data);
      setDraft(data.builtIn);
      setMessage('Reminder schedule saved.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

      showNotification({
        title: 'Preferences Saved',
        message: 'Your reminder schedule has been successfully saved.',
        type: 'success',
      })

    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Could not save schedule. Please try again.');

      showNotification({
        title: 'Save Failed',
        message: err.message || 'Could not save your reminder schedule. Please try again.',
        type: 'alert',
      })

    } finally {
      setSaving(false);
    }
  };

  const addCustom = async () => {
    if (!label.trim()) {
      setLabelError('Please give your reminder a title');
      return;
    }
    setLabelError('');
    Haptics.selectionAsync().catch(() => { });
    try {
      await authedRequest('/notifications/custom', {
        method: 'POST',
        body: { label: label.trim(), timeOfDay: time, daysMask: days },
      });
      setLabel('');
      prefs.reload();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

      showNotification({
        title: 'Reminder Added',
        message: 'Your personal reminder has been successfully added.',
        type: 'success',
      })

    } catch (err) {
      setLabelError(err instanceof ApiError ? err.message : 'Could not add reminder.');
      showNotification({
        title: 'Add Failed',
        message: err.message || 'Could not add your personal reminder. Please try again.',
        type: 'alert',
      })
    }
  };

  const removeCustom = (item) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    Alert.alert('Remove reminder?', `"${item.label}" will no longer alert you.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await authedRequest(`/notifications/custom/${item.id}`, { method: 'DELETE' });
            prefs.reload();

            showNotification({
              title: 'Reminder Removed',
              message: 'Your personal reminder has been successfully removed.',
              type: 'mindful',
            })

          } catch (err) {
            Alert.alert('Could not remove reminder', err.message ?? 'Please try again.');
            showNotification({
              title: 'Removal Failed',
              message: err.message || 'Could not remove your personal reminder. Please try again.',
              type: 'alert',
            })
          }
        },
      },
    ]);
  };

  const openItem = async (item) => {
    Haptics.selectionAsync().catch(() => { });
    try {
      if (!item.readAt) await authedRequest(`/notifications/inbox/${item.id}/read`, { method: 'POST' });
    } catch {
      // Quiet failover
    }
    inbox.reload();
    if (item.deepLink) router.push(item.deepLink);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container */}
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
              <BellRing size={12} color="#355243" />
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                Gentle Cadence
              </Text>
            </View>

            <View className="w-10 h-10" />
          </View>

          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
            Reminders
          </Text>
          <Text className="text-xs text-[#707E76] mt-0.5 leading-relaxed font-normal">
            Gentle prompts to breathe, reflect, and pause throughout your day.
          </Text>
        </View>

        {/* Scrollable Settings Feed */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 48 }}
          className="flex-1"
        >
          {/* 1. Gentle Push Notifications Banner (Warm Sand/Sage Card) */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360)}
            className="mb-6"
          >
            <View className="bg-[#26362E] rounded-[30px] p-6 relative overflow-hidden shadow-lg shadow-[#26362E]/20">
              {/* Organic Decorative Curves */}
              <View className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-white/5" />
              <View className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-[#8FA89B]/15" />

              <View className="flex-row items-center gap-2 mb-2">
                <Sparkles size={14} color="#A3C2B1" />
                <Text className="text-[10px] uppercase tracking-[2.5px] font-bold text-[#A3C2B1]">
                  Mindful Alerts
                </Text>
              </View>

              <Text className="text-[21px] font-serif font-bold text-[#FAF8F5] leading-snug mb-2">
                Never Miss a Moment of Calm
              </Text>
              <Text className="text-xs text-[#B2C2B8] leading-relaxed mb-5">
                Notifications always collect quietly in your inbox. To receive gentle chimes directly on this device, turn on push alerts.
              </Text>

              <TouchableOpacity
                onPress={turnOnPush}
                activeOpacity={0.85}
                className="flex-row items-center justify-center gap-2 bg-[#FAF8F5] active:bg-[#ECE8DE] px-5 py-3 rounded-full self-start shadow-md shadow-black/10"
              >
                <Bell size={14} color="#26362E" />
                <Text className="text-xs font-bold text-[#26362E]">Turn On Push Reminders</Text>
              </TouchableOpacity>

              {pushMessage ? (
                <View className="mt-3.5 pt-3 border-t border-white/10">
                  <Text className="text-xs text-[#E4ECE7] leading-relaxed font-medium">
                    {pushMessage}
                  </Text>
                </View>
              ) : null}
            </View>
          </Animated.View>

          {/* 2. Daily Core Routines */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E]">
                Daily Routines
              </Text>
              <Text className="text-xs text-[#8A9790]">
                {draft?.filter((d) => d.enabled).length || 0} active
              </Text>
            </View>

            <View className="gap-3">
              {draft?.map((item) => (
                <ReminderRow
                  key={item.type}
                  item={item}
                  onChange={(next) =>
                    setDraft((d) => d.map((x) => (x.type === next.type ? next : x)))
                  }
                />
              ))}
            </View>

            {message ? (
              <View className="bg-[#E5EDE8] border border-[#D1E0D6] p-3 rounded-2xl mt-3 flex-row items-center gap-2">
                <Check size={14} color="#26362E" />
                <Text className="text-xs font-semibold text-[#26362E]">{message}</Text>
              </View>
            ) : null}

            {/* Save Routine Preferences Button */}
            <TouchableOpacity
              onPress={savePreferences}
              disabled={saving}
              activeOpacity={0.85}
              className="mt-4 h-[50px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-sm"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FAF8F5" />
              ) : (
                <>
                  <Text className="text-xs font-semibold text-[#FAF8F5] tracking-wide">
                    Save Routine Preferences
                  </Text>
                  <Check size={15} color="#FAF8F5" strokeWidth={2.4} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* 3. Custom Personal Reminders */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E]">
                Custom Reminders
              </Text>
              <Text className="text-xs text-[#8A9790]">{custom.length}/10</Text>
            </View>

            {custom.length === 0 ? (
              <View className="bg-white border border-[#E9E4D8] p-4 rounded-3xl mb-3">
                <Text className="text-xs text-[#7B8881] text-center">
                  No personal reminders added yet. Create one below for your bespoke ritual.
                </Text>
              </View>
            ) : (
              <View className="gap-2.5 mb-3">
                {custom.map((r) => (
                  <View
                    key={r.id}
                    className="p-4 rounded-3xl bg-white border border-[#E9E4D8] flex-row items-center justify-between shadow-xs"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-sm font-serif font-bold text-[#1C2520]">
                        {r.label}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className="flex-row items-center gap-1 bg-[#F4F0E8] px-2 py-0.5 rounded-full">
                          <Clock size={10} color="#607066" />
                          <Text className="text-[10px] font-semibold text-[#607066]">
                            {r.timeOfDay}
                          </Text>
                        </View>
                        <Text className="text-[11px] text-[#7A8A80]">
                          {daysSummary(r.daysMask)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeCustom(r)}
                      className="w-9 h-9 rounded-full bg-[#FBECE6] items-center justify-center"
                      accessibilityLabel={`Delete ${r.label}`}
                    >
                      <Trash2 size={15} color="#A83A2E" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Custom Reminder Form Card */}
            <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
              <View className="flex-row items-center gap-1.5 mb-3">
                <Plus size={14} color="#26362E" />
                <Text className="text-xs font-bold text-[#26362E] uppercase tracking-wider">
                  Create Personal Reminder
                </Text>
              </View>

              {/* Title Input */}
              <View className="mb-4">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Name & Intention
                </Text>
                <View
                  className={`flex-row items-center h-[48px] px-3.5 rounded-2xl bg-white border ${labelError
                    ? 'border-[#B3261E] bg-[#FFFBFB]'
                    : isInputFocused
                      ? 'border-[#26362E]'
                      : 'border-[#E6E1D5]'
                    }`}
                >
                  <TextInput
                    value={label}
                    onChangeText={(text) => {
                      setLabel(text);
                      if (labelError) setLabelError('');
                    }}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="e.g. Evening Journal, Herbal Tea Pause"
                    placeholderTextColor="#A9B3AC"
                    maxLength={60}
                    autoCapitalize="sentences"
                    className="flex-1 text-xs text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0 }}
                  />
                </View>
                {labelError ? (
                  <Text className="text-xs text-[#B3261E] mt-1 ml-1.5">{labelError}</Text>
                ) : null}
              </View>

              {/* Time Selection */}
              <View className="mb-4">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-2 ml-1">
                  Time of Day
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {TIMES.map((t) => (
                    <Chip key={t} label={t} selected={time === t} onPress={() => setTime(t)} />
                  ))}
                </View>
              </View>

              {/* Day Selection */}
              <View className="mb-5">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-2 ml-1">
                  Active Days
                </Text>
                <DayPicker daysMask={days} onChange={setDays} />
              </View>

              <TouchableOpacity
                onPress={addCustom}
                disabled={custom.length >= 10}
                activeOpacity={0.85}
                className={`h-[48px] rounded-full flex-row items-center justify-center gap-2 ${custom.length >= 10
                  ? 'bg-[#E5E1D6] opacity-60'
                  : 'bg-[#26362E] shadow-sm shadow-[#26362E]/20'
                  }`}
              >
                <Plus size={15} color="#FAF8F5" />
                <Text className="text-xs font-semibold text-[#FAF8F5]">Add Custom Reminder</Text>
              </TouchableOpacity>
              {custom.length >= 10 ? (
                <Text className="text-[11px] text-[#86948B] text-center mt-2">
                  Maximum limit of 10 custom reminders reached.
                </Text>
              ) : null}
            </View>
          </View>

          {/* 4. Recent Reminders Quiet Inbox */}
          <View className="mb-2">
            <View className="flex-row items-center gap-1.5 mb-3 px-1">
              <Inbox size={14} color="#57665E" />
              <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E]">
                Recent Reminders Inbox
              </Text>
            </View>

            {inbox.status === 'loading' && !inbox.data ? (
              <Text className="text-xs text-[#8A9790] px-1">Checking inbox…</Text>
            ) : null}

            {inbox.status === 'error' && !inbox.data ? (
              <Text className="text-xs text-[#A83A2E] px-1">{inbox.error}</Text>
            ) : null}

            {inbox.data?.length === 0 ? (
              <View className="bg-white border border-[#E9E4D8] p-5 rounded-3xl items-center">
                <Text className="text-xs text-[#7B8881] text-center">
                  Your inbox is completely clear and peaceful.
                </Text>
              </View>
            ) : null}

            <View className="gap-2.5">
              {inbox.data?.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => openItem(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}${item.readAt ? '' : ', new'}. ${item.body}`}
                  className={`p-4 rounded-3xl border active:scale-[0.99] transition-all flex-row items-center justify-between ${item.readAt
                    ? 'bg-white border-[#E9E4D8]'
                    : 'bg-[#E5EDE8] border-[#D1E0D6] shadow-sm shadow-[#26362E]/5'
                    }`}
                >
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-sm font-serif font-bold text-[#1C2520]">
                        {item.title}
                      </Text>
                      {!item.readAt ? (
                        <View className="bg-[#26362E] px-2 py-0.5 rounded-full">
                          <Text className="text-[9px] font-bold text-[#FAF8F5] uppercase">
                            New
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="text-xs text-[#526158] leading-relaxed mb-1.5">
                      {item.body}
                    </Text>
                    <Text className="text-[10px] text-[#84948A]">
                      {new Date(item.scheduledFor).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <ChevronRight size={16} color="#A8B4AC" />
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ReminderRow({ item, onChange }) {
  return (
    <View className="bg-white border border-[#E9E4D8] p-5 rounded-3xl shadow-xs">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-serif font-bold text-[#1C2520] flex-1 pr-2">
          {item.title}
        </Text>
        <Switch
          value={item.enabled}
          onValueChange={(enabled) => {
            Haptics.selectionAsync().catch(() => { });
            onChange({ ...item, enabled });
          }}
          trackColor={{ false: '#E2DBD0', true: '#26362E' }}
          thumbColor="#FFFFFF"
          accessibilityLabel={`${item.title} reminder`}
        />
      </View>

      {item.enabled ? (
        <View className="pt-3 mt-1 border-t border-[#F0EBE0] gap-3">
          <View>
            <Text className="text-[10px] uppercase font-bold text-[#6D7D74] mb-1.5">
              Scheduled Time
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TIMES.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={item.timeOfDay === t}
                  onPress={() => onChange({ ...item, timeOfDay: t })}
                />
              ))}
            </View>
          </View>

          <View>
            <Text className="text-[10px] uppercase font-bold text-[#6D7D74] mb-1.5">
              Cadence Days
            </Text>
            <DayPicker
              daysMask={item.daysMask}
              onChange={(daysMask) => onChange({ ...item, daysMask })}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DayPicker({ daysMask, onChange }) {
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {DAY_LABELS.map((d, i) => {
        const on = ((daysMask >> i) & 1) === 1;
        return (
          <Chip
            key={d}
            label={d}
            selected={on}
            accessibilityLabel={`${d}, ${on ? 'selected' : 'not selected'}`}
            onPress={() => {
              const next = daysMask ^ (1 << i);
              if (next !== 0) onChange(next);
            }}
          />
        );
      })}
    </View>
  );
}

function Chip({ label, selected, onPress, accessibilityLabel }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => { });
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      className={`px-3 py-1.5 rounded-full border transition-all ${selected
        ? 'bg-[#26362E] border-[#26362E]'
        : 'bg-[#FAF8F5] border-[#E3DDD1] active:bg-[#F2EDE2]'
        }`}
    >
      <Text
        className={`text-[11px] font-semibold ${selected ? 'text-[#FAF8F5]' : 'text-[#506056]'
          }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}