import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../../src/auth/AuthContext';
import { ApiError } from '../../src/services/api';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ArrowLeft, { className: 'style' });
cssInterop(Lock, { className: 'style' });
cssInterop(KeyRound, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Eye, { className: 'style' });
cssInterop(EyeOff, { className: 'style' });

export default function ChangePassword() {
  const router = useRouter();
  const { changePassword } = useAuth();
  const { showNotification } = useNotification();
  const reduceMotion = useReducedMotion();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError('');
    if (!currentPassword) {
      setError('Enter your current password.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Use at least 8 characters, including a letter and a number.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
      return;
    }

    setSaving(true);
    Haptics.selectionAsync().catch(() => { });

    try {
      await changePassword({ currentPassword, newPassword });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
      showNotification({
        title: 'Password Changed',
        message: 'Your password was updated. Other active sessions were refreshed.',
        type: 'success',
      });
      router.back();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not change your password. Please try again.';
      setError(message);
      showNotification({ title: 'Password Change Failed', message, type: 'alert' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2]">
      <View className="w-full flex-1 self-center bg-[#FAF8F5] md:max-w-[430px] border-x border-[#ECE7DD]">
        {/* Header Bar */}
        <View className="flex-row items-center justify-between px-5 py-3.5 border-b border-[#ECE7DD] bg-[#FAF8F5]">
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync().catch(() => { });
              router.back();
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="w-9 h-9 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-xs shadow-[#26362E]/5"
          >
            <ArrowLeft size={18} color="#26362E" strokeWidth={2} />
          </TouchableOpacity>

          <Text className="text-[18px] font-serif font-bold text-[#1C2520] tracking-tight">
            Security & Access
          </Text>

          <View className="w-9 h-9 items-center justify-center">
            <View className="w-8 h-8 rounded-full bg-[#E5EDE8] items-center justify-center">
              <KeyRound size={14} color="#26362E" strokeWidth={2} />
            </View>
          </View>
        </View>

        {/* 1. Scrollable Form (className="flex-1" add kiya hai) */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Velora Concentric Security Banner */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(380)}
            className="bg-[#E5EDE8] border border-[#D0DFD6] rounded-[28px] p-5 mb-6 relative overflow-hidden"
          >
            <View className="flex-row items-center gap-3.5 mb-2">
              <View className="w-11 h-11 rounded-full bg-[#D4E3D9] items-center justify-center">
                <View className="w-8 h-8 rounded-full bg-[#26362E] items-center justify-center shadow-xs">
                  <ShieldCheck size={16} color="#FAF8F5" strokeWidth={2.4} />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] uppercase font-bold text-[#355243] tracking-widest">
                  Solace-AI Protection
                </Text>
                <Text className="text-base font-serif font-bold text-[#1C2520] tracking-tight">
                  Protect Your Solace Space
                </Text>
              </View>
            </View>
            <Text className="text-xs text-[#526359] leading-relaxed">
              Use at least 8 characters with a mix of letters and numbers. Updating your password
              safeguards your personal notes and private sessions.
            </Text>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(380).delay(60)}
            className="gap-4 mb-2"
          >
            <PasswordField
              label="Current Password"
              placeholder="Enter current password"
              contentType="password"
              value={currentPassword}
              onChangeText={(t) => {
                setCurrentPassword(t);
                if (error) setError('');
              }}
            />

            <PasswordField
              label="New Password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                if (error) setError('');
              }}
            />

            <PasswordField
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (error) setError('');
              }}
            />
          </Animated.View>

          {/* Error Message */}
          {error ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.duration(240)}
              className="bg-[#FAF4F2] border border-[#F2DDD5] p-3 rounded-2xl mb-4 mt-2"
            >
              <Text accessibilityRole="alert" className="text-xs text-[#A83A2E] font-medium leading-snug">
                {error}
              </Text>
            </Animated.View>
          ) : null}
        </ScrollView>

        {/* 2. Pinned Bottom Action Button (ScrollView ke BAHAR yahan rakhna hai) */}
        <View className="px-5 pt-3 pb-6 bg-[#FAF8F5] border-t border-[#ECE7DD] shadow-sm shadow-[#26362E]/5">
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(380).delay(120)}>
            <TouchableOpacity
              onPress={submit}
              disabled={saving}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Update Password"
              className="w-full h-[54px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25"
            >
              {saving ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#FAF8F5" />
                  <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                    Securing Account…
                  </Text>
                </View>
              ) : (
                <>
                  <Lock size={15} color="#FAF8F5" strokeWidth={2.2} />
                  <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                    Update Password
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

      </View>
    </SafeAreaView>
  );
}

function PasswordField({
  label,
  placeholder,
  contentType = 'newPassword',
  value,
  onChangeText,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="w-full p-1.5">
      <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
        {label}
      </Text>
      <View
        className={`h-[52px] px-3.5 rounded-2xl bg-white border flex-row items-center transition-all ${isFocused
          ? 'border-[#26362E] shadow-sm shadow-[#26362E]/10'
          : 'border-[#E6E1D5] shadow-2xs shadow-[#26362E]/5'
          }`}
      >
        <View className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#ECE7DC] items-center justify-center mr-2.5">
          <Lock size={13} color={isFocused ? '#26362E' : '#7D8B84'} strokeWidth={2.2} />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor="#9EA8A2"
          secureTextEntry={!showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType={contentType}
          autoComplete={
            Platform.OS === 'web'
              ? contentType === 'password'
                ? 'current-password'
                : 'new-password'
              : undefined
          }
          className="flex-1 text-sm text-[#1E2522] font-medium"
          style={{ outlineStyle: 'none', borderWidth: 0 }}
        />

        <Pressable
          onPress={() => {
            Haptics.selectionAsync().catch(() => { });
            setShowPassword((prev) => !prev);
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          className="w-8 h-8 rounded-full items-center justify-center active:bg-[#F3EDE2]"
        >
          {showPassword ? (
            <EyeOff size={16} color="#26362E" strokeWidth={2} />
          ) : (
            <Eye size={16} color="#8A9790" strokeWidth={1.8} />
          )}
        </Pressable>
      </View>
    </View>
  );
}