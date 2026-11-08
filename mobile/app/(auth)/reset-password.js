import { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cssInterop } from 'nativewind';

import { useNotification } from '../../src/notification/NotificationContext';


import { resetPassword } from '../../src/services/endpoints';
import { ApiError } from '../../src/services/api';
import { fieldErrorsFrom } from '../../src/utils/format';

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Ionicons, { className: 'style' });
cssInterop(Feather, { className: 'style' });
cssInterop(AnimatedPressable, { className: 'style' });

export default function ResetPassword() {

  const { showNotification } = useNotification();

  const router = useRouter();
  const { width } = useWindowDimensions();

  const [form, setForm] = useState({ token: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Micro-interaction button spring
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async () => {
    const next = {};
    if (!form.token.trim()) next.token = 'Enter the reset code from your email';
    if (form.password.length < 8) next.password = 'Use at least 8 characters';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await resetPassword({
        token: form.token.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setDone(true);

      showNotification({
        title: 'Password Reset',
        message: 'Your password has been successfully reset.',
        type: 'success', // 'success' | 'mindful' | 'alert'
      });

    } catch (err) {
      if (err instanceof ApiError) {
        const fields = fieldErrorsFrom(err);
        if (Object.keys(fields).length) setErrors(fields);
        setFormError(err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }

      showNotification({
        title: 'Password Reset Failed',
        message: err.message || 'Please check your credentials.',
        type: 'alert',
      });

    } finally {
      setSubmitting(false);
    }
  };

  const getInputContainerStyle = (fieldName) => {
    if (errors[fieldName]) return 'border-[#B3261E] bg-[#FFFBFB]';
    if (focusedField === fieldName) return 'border-[#26362E] bg-white';
    return 'border-[#E6E1D5] bg-white';
  };

  const getIconColor = (fieldName) => {
    if (errors[fieldName]) return '#B3261E';
    if (focusedField === fieldName) return '#26362E';
    return '#7E8B83';
  };

  return (
    <View className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Shell for Web & Tablet / Mobile Edge-to-Edge */}
      <View className="w-full h-full md:max-w-[420px] md:h-[92vh] md:max-h-[860px] md:rounded-[40px] md:overflow-hidden md:shadow-2xl md:shadow-[#26362E]/10 md:border md:border-[#E8E4DA] bg-[#F9F7F2] relative">

        {/* Top Organic Art Banner */}
        <View className="h-[210px] w-full relative overflow-hidden bg-[#EFECE4] items-center justify-center">
          {/* Layered Organic Hills */}
          <View className="absolute -top-12 -right-10 w-56 h-56 rounded-full bg-[#E3ECE6]/70" />
          <View className="absolute top-8 -left-12 w-48 h-48 rounded-full bg-[#E5DFD4]/60" />
          <View className="absolute -bottom-8 w-[120%] h-32 bg-[#A3B8AD]/30 rounded-t-[100%] items-center justify-end pb-3">
            <View className="w-[82%] h-20 bg-[#7B9486]/35 rounded-t-[100%] items-center justify-end pb-2">
              <View className="w-[58%] h-12 bg-[#2D3F35]/25 rounded-t-[100%]" />
            </View>
          </View>

          {/* Navigation Bar */}
          <SafeAreaView edges={['top', 'left', 'right']} className="absolute top-2 left-5 right-5 z-20 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.canGoBack() && router.back()}
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full bg-white/95 items-center justify-center border border-[#E2DDD0] shadow-sm"
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Feather name="chevron-left" size={20} color="#26362E" />
            </TouchableOpacity>

            <View className="w-9 h-9 rounded-full bg-white/95 items-center justify-center border border-[#E2DDD0] shadow-sm">
              <Feather name="shield" size={15} color="#26362E" />
            </View>
          </SafeAreaView>

          {/* Floating Emblem */}
          <View className="items-center z-10 -mt-1">
            <View className="w-13 h-13 p-3 rounded-full bg-white items-center justify-center shadow-md shadow-black/5 border border-[#E5DFD3] mb-2">
              <Feather name={done ? 'check-circle' : 'lock'} size={22} color="#26362E" />
            </View>
            <Text className="text-[10px] tracking-[4px] uppercase font-bold text-[#45544B]">
              {done ? 'Security Updated' : 'Create New Password'}
            </Text>
          </View>
        </View>

        {/* Elevated Form Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-[#FAF8F5] rounded-t-[36px] -mt-5 px-7 shadow-xl shadow-black/5 border-t border-[#EAE5D9]"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 26, paddingBottom: 36 }}
            keyboardShouldPersistTaps="handled"
          >
            {done ? (
              /* Success / Completed View */
              <View className="gap-5 mt-4 items-center">
                <Text className="text-[26px] font-serif text-[#1C2420] tracking-tight text-center">
                  Password Updated
                </Text>
                <Text className="text-xs text-[#707E76] text-center leading-relaxed font-normal px-2 -mt-2">
                  Your credentials have been securely updated. You can now sign in to resume your mindful practice.
                </Text>

                <View className="w-full bg-[#EBF2EE] border border-[#CCDCD2] p-5 rounded-3xl items-center my-2">
                  <View className="w-12 h-12 rounded-full bg-[#26362E] items-center justify-center mb-2 shadow-sm">
                    <Feather name="check" size={22} color="#FAF8F5" />
                  </View>
                  <Text className="text-xs text-[#4E6056] text-center font-medium">
                    New password is now active
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  activeOpacity={0.85}
                  className="w-full h-[52px] rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-[#FAF8F5] text-sm font-semibold tracking-wide">
                      Back to Log In
                    </Text>
                    <Feather name="arrow-right" size={16} color="#FAF8F5" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* Reset Form Inputs View */
              <>
                <View className="mb-5 items-center">
                  <Text className="text-[25px] font-serif text-[#1C2420] tracking-tight text-center">
                    Set a New Password
                  </Text>
                  <Text className="text-xs text-[#707E76] mt-1 text-center leading-relaxed font-normal">
                    Paste the reset code you received. Codes expire after 30 minutes.
                  </Text>
                </View>

                {/* Form Error Banner */}
                {formError ? (
                  <View
                    className="flex-row items-center gap-2.5 bg-[#FBF0ED] px-4 py-2.5 rounded-2xl mb-4 border border-[#F2D2CB]"
                    accessibilityLiveRegion="polite"
                  >
                    <Feather name="alert-circle" size={15} color="#A83A2E" />
                    <Text className="text-[#A83A2E] text-xs font-medium flex-1">{formError}</Text>
                  </View>
                ) : null}

                {/* Reset Code Input */}
                <View className="mb-3.5">
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                    Reset Code
                  </Text>
                  <View className={`flex-row items-center h-[50px] px-4 rounded-2xl border ${getInputContainerStyle('token')}`}>
                    <Feather name="key" size={16} color={getIconColor('token')} style={{ marginRight: 10 }} />
                    <TextInput
                      className="flex-1 text-sm text-[#1E2522]"
                      style={{ outlineStyle: 'none', borderWidth: 0, paddingVertical: 0 }}
                      placeholder="Paste code from email"
                      placeholderTextColor="#A9B3AC"
                      value={form.token}
                      onFocus={() => setFocusedField('token')}
                      onBlur={() => setFocusedField(null)}
                      onChangeText={set('token')}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.token ? (
                    <Text className="text-[#B3261E] text-xs mt-1 ml-2">{errors.token}</Text>
                  ) : null}
                </View>

                {/* New Password */}
                <View className="mb-3.5">
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                    New Password
                  </Text>
                  <View className={`flex-row items-center h-[50px] px-4 rounded-2xl border ${getInputContainerStyle('password')}`}>
                    <Feather name="lock" size={16} color={getIconColor('password')} style={{ marginRight: 10 }} />
                    <TextInput
                      className="flex-1 text-sm text-[#1E2522]"
                      style={{ outlineStyle: 'none', borderWidth: 0, paddingVertical: 0 }}
                      placeholder="At least 8 characters"
                      placeholderTextColor="#A9B3AC"
                      value={form.password}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onChangeText={set('password')}
                      secureTextEntry={!showPassword}
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={16}
                        color={showPassword ? '#26362E' : '#8A9790'}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password ? (
                    <Text className="text-[#B3261E] text-xs mt-1 ml-2">{errors.password}</Text>
                  ) : null}
                </View>

                {/* Confirm New Password */}
                <View className="mb-5">
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                    Confirm New Password
                  </Text>
                  <View className={`flex-row items-center h-[50px] px-4 rounded-2xl border ${getInputContainerStyle('confirmPassword')}`}>
                    <Feather name="shield" size={16} color={getIconColor('confirmPassword')} style={{ marginRight: 10 }} />
                    <TextInput
                      className="flex-1 text-sm text-[#1E2522]"
                      style={{ outlineStyle: 'none', borderWidth: 0, paddingVertical: 0 }}
                      placeholder="Re-enter password"
                      placeholderTextColor="#A9B3AC"
                      value={form.confirmPassword}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      onChangeText={set('confirmPassword')}
                      secureTextEntry={!showConfirmPassword}
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessibilityRole="button"
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <Feather
                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                        size={16}
                        color={showConfirmPassword ? '#26362E' : '#8A9790'}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword ? (
                    <Text className="text-[#B3261E] text-xs mt-1 ml-2">{errors.confirmPassword}</Text>
                  ) : null}
                </View>

                {/* Save Button */}
                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel="Save new password"
                  accessibilityState={{ disabled: submitting }}
                  disabled={submitting}
                  onPressIn={() => {
                    buttonScale.value = withSpring(0.97, { damping: 15 });
                  }}
                  onPressOut={() => {
                    buttonScale.value = withSpring(1, { damping: 15 });
                  }}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => { });
                    submit();
                  }}
                  className="h-[52px] rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25 elevation-3"
                  style={buttonAnimatedStyle}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FAF8F5" size="small" />
                  ) : (
                    <View className="flex-row items-center justify-center gap-2">
                      <Text className="text-[#FAF8F5] text-sm font-semibold tracking-wide">
                        Save New Password
                      </Text>
                      <Feather name="arrow-right" size={16} color="#FAF8F5" />
                    </View>
                  )}
                </AnimatedPressable>

                {/* Back to Login Link */}
                <View className="flex-row items-center justify-center mt-6">
                  <Text className="text-xs text-[#7B8880]">Changed your mind? </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text className="text-xs font-semibold text-[#26362E]">Back to Log In</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}