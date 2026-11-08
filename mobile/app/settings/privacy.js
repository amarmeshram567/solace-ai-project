import React, { useState } from 'react';
import {
  Alert,
  Platform,
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
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Bot,
  Download,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Info,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { LoadingState, ErrorState } from '../../src/components/States';
import { useAuth } from '../../src/auth/AuthContext';
import { useRemote } from '../../src/hooks/useRemote';
import { ApiError } from '../../src/services/api';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Bot, { className: 'style' });
cssInterop(Download, { className: 'style' });
cssInterop(Trash2, { className: 'style' });
cssInterop(Lock, { className: 'style' });
cssInterop(Eye, { className: 'style' });
cssInterop(EyeOff, { className: 'style' });
cssInterop(AlertTriangle, { className: 'style' });
cssInterop(Check, { className: 'style' });
cssInterop(Info, { className: 'style' });

export default function PrivacySettings() {

  const { showNotification } = useNotification();

  const { authedRequest, signOut } = useAuth();
  const reduceMotion = useReducedMotion();
  const prefs = useRemote('/users/me/preferences');

  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const confirmAction = (title, message, confirmLabel, onConfirm) => {
    if (Platform.OS === 'web') {
      if (typeof globalThis.confirm !== 'function') {
        setNote('This browser does not support confirmation dialogs.');
        return;
      }
      if (globalThis.confirm(`${title}\n\n${message}`)) onConfirm();
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: onConfirm },
    ]);
  };

  const setPreference = async (key, value) => {
    Haptics.selectionAsync().catch(() => { });
    const previous = prefs.data;
    prefs.setData((d) => ({ ...d, [key]: value }));
    try {
      const data = await authedRequest('/users/me/preferences', {
        method: 'PATCH',
        body: { [key]: value },
      });
      prefs.setData(data);

      showNotification({
        title: 'Settings Saved',
        message: 'Your privacy settings have been successfully saved.',
        type: 'success',
      })

    } catch {
      prefs.setData(previous);
      setNote('That setting could not be saved. Please try again.');

      showNotification({
        title: 'Save Failed',
        message: 'Could not save your privacy setting. Please try again.',
        type: 'alert',
      })

    }
  };

  const clearChats = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    confirmAction(
      'Clear all conversations?',
      'Every interaction and reflection with Zen Monk will be permanently removed. This cannot be undone.',
      'Clear Chats',
      async () => {
        setBusy('clear');
        setNote('');
        try {
          await authedRequest('/ai/conversations', { method: 'DELETE' });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
          setNote('Your conversation history has been cleared.');
          showNotification({
            title: 'Chats Cleared',
            message: 'Your conversation history has been successfully cleared.',
            type: 'success',
          });
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Could not clear chats. Please try again.';
          setNote(message);
          showNotification({
            title: 'Clear Failed',
            message,
            type: 'alert',
          });
        } finally {
          setBusy('');
        }
      },
    );
  };

  const downloadArchive = (data) => {
    if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      throw new Error('This browser cannot download files.');
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `solace-archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const exportData = async () => {
    Haptics.selectionAsync().catch(() => { });
    setBusy('export');
    setNote('');
    try {
      const data = await authedRequest('/users/me/export');
      if (Platform.OS === 'web') {
        downloadArchive(data);
      } else {
        const directory = FileSystem.cacheDirectory;
        if (!directory) throw new Error('Could not access temporary storage for the archive.');
        const uri = `${directory}solace-archive-${new Date().toISOString().slice(0, 10)}.json`;
        await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
        if (!(await Sharing.isAvailableAsync())) {
          throw new Error('Sharing is not available on this device, so the archive could not be saved.');
        }
        await Sharing.shareAsync(uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save your Solace archive',
        });
      }

      setNote(Platform.OS === 'web'
        ? 'Your personal archive has been downloaded.'
        : 'Your personal archive is ready to save or share.');
      showNotification({
        title: 'Archive Exported',
        message: Platform.OS === 'web'
          ? 'Your archive JSON file has been downloaded.'
          : 'Your personal archive has been shared.',
        type: 'success',
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err.message || 'Could not export your archive. Please try again.';
      setNote(message);
      showNotification({
        title: 'Export Failed',
        message,
        type: 'alert',
      });
    } finally {
      setBusy('');
    }
  };

  const deleteAccount = () => {
    setPasswordError('');
    if (!password) {
      setPasswordError('Enter your account password to confirm');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    confirmAction(
      'Delete your account permanently?',
      'Your check-ins, mindful progress, journals, and reflections will be deleted forever. This action is irreversible.',
      'Delete Account',
      async () => {
        setBusy('delete');
        try {
          await authedRequest('/users/me', { method: 'DELETE', body: { password } });
          await signOut();
          showNotification({
            title: 'Account Deleted',
            message: 'Your account has been permanently deleted.',
            type: 'success',
          });
        } catch (err) {
          const message = err instanceof ApiError
            ? err.message
            : 'Could not delete your account. Please check your password.';
          setPasswordError(message);
          setBusy('');
          showNotification({
            title: 'Deletion Failed',
            message,
            type: 'alert',
          });
        }
      },
    );
  };

  if (prefs.status === 'loading' && !prefs.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <LoadingState message="Securing your private solace…" />
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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Viewport */}
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
              <ShieldCheck size={12} color="#355243" />
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                Data & Privacy
              </Text>
            </View>

            <View className="w-10 h-10" />
          </View>

          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
            Privacy & Control
          </Text>
          <Text className="text-xs text-[#707E76] mt-0.5 leading-relaxed font-normal">
            You own your reflections. We ensure your space remains safe, private, and yours alone.
          </Text>
        </View>

        {/* Scrollable Settings Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 48 }}
          className="flex-1"
        >
          {/* Status Note Banner */}
          {note ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.duration(300)}
              className="bg-[#E5EDE8] border border-[#D1E0D6] p-4 rounded-2xl flex-row items-center gap-2.5 mb-5 shadow-xs"
            >
              <Info size={16} color="#26362E" />
              <Text className="text-xs text-[#26362E] font-medium flex-1">{note}</Text>
            </Animated.View>
          ) : null}

          {/* 1. Zen Monk Companion Privacy */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360)}
            className="mb-5"
          >
            <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-8 h-8 rounded-full bg-[#E5EDE8] items-center justify-center">
                  <Bot size={16} color="#26362E" />
                </View>
                <View>
                  <Text className="text-base font-serif font-bold text-[#1C2520]">
                    Zen Monk Companion
                  </Text>
                  <Text className="text-[10px] uppercase font-bold text-[#718279] tracking-wider">
                    Contextual AI Preferences
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between py-3 border-t border-[#F0EBE0] gap-3">
                <Text className="text-xs text-[#4A5950] flex-1 leading-relaxed">
                  Allow Zen Monk to use a general mood summary from the past week to gently personalize reflections.
                </Text>
                <Switch
                  value={Boolean(prefs.data?.aiPersonalization)}
                  onValueChange={(v) => setPreference('aiPersonalization', v)}
                  trackColor={{ false: '#E2DBD0', true: '#26362E' }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="Personalize Zen Monk reflections"
                />
              </View>

              <Text className="text-[11px] text-[#86948C] pt-2 mb-4 leading-normal">
                Off by default. Turning it off stops context transmission immediately.
              </Text>

              {/* Clear Chats Button */}
              <TouchableOpacity
                onPress={clearChats}
                disabled={Boolean(busy)}
                activeOpacity={0.8}
                className="h-[46px] rounded-full border border-[#D5CEC0] bg-[#FAF8F5] flex-row items-center justify-center gap-2"
              >
                {busy === 'clear' ? (
                  <ActivityIndicator size="small" color="#26362E" />
                ) : (
                  <>
                    <Trash2 size={14} color="#5A6860" />
                    <Text className="text-xs font-semibold text-[#3E4D45]">
                      Clear All Chat History
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* 2. Full Data Portability & Archive */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360).delay(60)}
            className="mb-5"
          >
            <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-[#F3EDE2] items-center justify-center">
                  <Download size={16} color="#6B5738" />
                </View>
                <View>
                  <Text className="text-base font-serif font-bold text-[#1C2520]">
                    Your Personal Archive
                  </Text>
                  <Text className="text-[10px] uppercase font-bold text-[#718279] tracking-wider">
                    Full Data Portability
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-[#526158] leading-relaxed mb-4">
                Export a clean JSON file containing all check-ins, self-reflection assessments, milestones, and conversation reflections. Passwords and authentication credentials are never included.
              </Text>

              <TouchableOpacity
                onPress={exportData}
                disabled={Boolean(busy)}
                activeOpacity={0.85}
                className="h-[48px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-sm"
              >
                {busy === 'export' ? (
                  <ActivityIndicator size="small" color="#FAF8F5" />
                ) : (
                  <>
                    <Download size={15} color="#FAF8F5" />
                    <Text className="text-xs font-semibold text-[#FAF8F5] tracking-wide">
                      Export My Archive
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* 3. Account Deletion (Warm Terracotta Accent) */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360).delay(120)}
            className="mb-3"
          >
            <View className="bg-[#FAF4F2] border border-[#F2DDD5] p-5 rounded-[28px] shadow-xs">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-8 h-8 rounded-full bg-[#FCECE8] items-center justify-center">
                  <AlertTriangle size={16} color="#A83A2E" />
                </View>
                <View>
                  <Text className="text-base font-serif font-bold text-[#3B1F19]">
                    Delete Account
                  </Text>
                  <Text className="text-[10px] uppercase font-bold text-[#965A4F] tracking-wider">
                    Irreversible Action
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-[#7A4E46] leading-relaxed mb-4">
                Permanently erase your identity and solace logs from Solace servers. To confirm ownership, enter your password below:
              </Text>

              {/* Password Confirmation Field with Zero-Outline */}
              <View className="mb-4">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#8C463A] mb-1.5 ml-1">
                  Account Password
                </Text>
                <View
                  className={`flex-row items-center h-[48px] px-3.5 rounded-2xl bg-white border ${passwordError
                    ? 'border-[#B3261E]'
                    : isPasswordFocused
                      ? 'border-[#A83A2E]'
                      : 'border-[#EAD3CC]'
                    }`}
                >
                  <Lock size={15} color={passwordError ? '#B3261E' : '#947069'} style={{ marginRight: 8 }} />
                  <TextInput
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (passwordError) setPasswordError('');
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="Enter password to confirm"
                    placeholderTextColor="#B8A4A0"
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    className="flex-1 text-xs text-[#2A1815]"
                    style={{ outlineStyle: 'none', borderWidth: 0 }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#947069" />
                    ) : (
                      <Eye size={16} color="#947069" />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text className="text-xs text-[#B3261E] mt-1 ml-1.5">{passwordError}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={deleteAccount}
                disabled={Boolean(busy)}
                activeOpacity={0.85}
                className="h-[48px] rounded-full bg-[#A83A2E] flex-row items-center justify-center gap-2 shadow-sm"
              >
                {busy === 'delete' ? (
                  <ActivityIndicator size="small" color="#FAF8F5" />
                ) : (
                  <>
                    <Trash2 size={15} color="#FAF8F5" />
                    <Text className="text-xs font-bold text-[#FAF8F5] tracking-wide">
                      Permanently Delete Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}