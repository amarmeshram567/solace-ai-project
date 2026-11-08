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

import { forgotPassword } from '../../src/services/endpoints';
import { ApiError } from '../../src/services/api';
import { useNotification } from '../../src/notification/NotificationContext';


const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity);

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Ionicons, { className: 'style' });
cssInterop(Feather, { className: 'style' });
cssInterop(AnimatedPressable, { className: 'style' });

export default function ForgotPassword() {

  const { showNotification } = useNotification();

  const router = useRouter();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Micro-interaction button scale
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const submit = async () => {
    setFormError('');
    if (!email.trim()) {
      setEmailError('Enter your email address');
      return;
    }
    setEmailError('');
    setSubmitting(true);
    try {
      const data = await forgotPassword(email.trim());
      setMessage(data?.message || 'Password reset instructions have been sent to your inbox.');
      showNotification({
        title: 'Check your inbox',
        message: data?.message || 'Password reset instructions have been sent to your inbox.',
        type: 'success',
      })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      showNotification({
        title: 'Request Failed',
        message: err.message || 'Please check your email address.',
        type: 'alert',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Shell for Web & Tablet / Mobile Edge-to-Edge */}
      <View className="w-full h-full md:max-w-[420px] md:h-[92vh] md:max-h-[860px] md:rounded-[40px] md:overflow-hidden md:shadow-2xl md:shadow-[#26362E]/10 md:border md:border-[#E8E4DA] bg-[#F9F7F2] relative">

        {/* Top Organic Art Banner */}
        <View className="h-[220px] w-full relative overflow-hidden bg-[#EFECE4] items-center justify-center">
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
              <Feather name="feather" size={15} color="#26362E" />
            </View>
          </SafeAreaView>

          {/* Center Key Emblem */}
          <View className="items-center z-10 -mt-1">
            <View className="w-13 h-13 p-3 rounded-full bg-white items-center justify-center shadow-md shadow-black/5 border border-[#E5DFD3] mb-2">
              <Feather name="key" size={22} color="#26362E" />
            </View>
            <Text className="text-[10px] tracking-[4px] uppercase font-bold text-[#45544B]">
              Account Recovery
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
            {/* Header Titles */}
            <View className="mb-6 items-center">
              <Text className="text-[26px] font-serif text-[#1C2420] tracking-tight text-center">
                Reset Password
              </Text>
              <Text className="text-xs text-[#707E76] mt-1.5 text-center leading-relaxed px-2 font-normal">
                Enter your email address and we will guide you back. There is no rush.
              </Text>
            </View>

            {message ? (
              /* Success Card View */
              <View className="gap-5 mt-2">
                <View className="bg-[#EBF2EE] border border-[#CCDCD2] p-5 rounded-3xl items-center">
                  <View className="w-12 h-12 rounded-full bg-[#26362E] items-center justify-center mb-3 shadow-sm">
                    <Feather name="check" size={22} color="#FAF8F5" />
                  </View>
                  <Text className="text-sm font-semibold text-[#26362E] text-center mb-1">
                    Check your inbox
                  </Text>
                  <Text className="text-xs text-[#526359] text-center leading-relaxed">
                    {message}
                  </Text>
                </View>

                {/* Primary Button to Code Reset */}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/reset-password')}
                  activeOpacity={0.85}
                  className="h-[52px] rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-[#FAF8F5] text-sm font-semibold tracking-wide">
                      I Have a Reset Code
                    </Text>
                    <Feather name="arrow-right" size={16} color="#FAF8F5" />
                  </View>
                </TouchableOpacity>

                {/* Resend Action */}
                <TouchableOpacity
                  onPress={() => setMessage('')}
                  activeOpacity={0.7}
                  className="items-center py-2"
                >
                  <Text className="text-xs font-semibold text-[#54625A]">
                    Re-enter email address
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Input Form View */
              <>
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

                {/* Email Address Field */}
                <View className="mb-6">
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                    Registered Email
                  </Text>
                  <View
                    className={`flex-row items-center h-[52px] px-4 rounded-2xl bg-white border ${emailError
                      ? 'border-[#B3261E] bg-[#FFFBFB]'
                      : isFocused
                        ? 'border-[#26362E]'
                        : 'border-[#E6E1D5]'
                      }`}
                  >
                    <Feather
                      name="mail"
                      size={16}
                      color={emailError ? '#B3261E' : isFocused ? '#26362E' : '#7E8B83'}
                      style={{ marginRight: 10 }}
                    />
                    <TextInput
                      className="flex-1 text-sm text-[#1E2522]"
                      style={{
                        outlineStyle: 'none',
                        borderWidth: 0,
                        paddingVertical: 0,
                      }}
                      placeholder="alex@mindfulness.com"
                      placeholderTextColor="#A9B3AC"
                      value={email}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                    />
                  </View>
                  {emailError ? (
                    <Text className="text-[#B3261E] text-xs mt-1 ml-2">{emailError}</Text>
                  ) : null}
                </View>

                {/* Primary Action Button */}
                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel="Send instructions"
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
                  className="h-[52px] rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25 elevation-3 mb-3"
                  style={buttonAnimatedStyle}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FAF8F5" size="small" />
                  ) : (
                    <View className="flex-row items-center justify-center gap-2">
                      <Text className="text-[#FAF8F5] text-sm font-semibold tracking-wide">
                        Send Instructions
                      </Text>
                      <Feather name="arrow-right" size={16} color="#FAF8F5" />
                    </View>
                  )}
                </AnimatedPressable>

                {/* Secondary Pill Button for existing reset code */}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/reset-password')}
                  activeOpacity={0.7}
                  className="h-[50px] rounded-full border border-[#D5CEC0] bg-[#F4EFE6]/50 items-center justify-center"
                >
                  <Text className="text-xs font-semibold text-[#3B4840]">
                    I have a reset code
                  </Text>
                </TouchableOpacity>

                {/* Back to Login Link */}
                <View className="flex-row items-center justify-center mt-7">
                  <Text className="text-xs text-[#7B8880]">Remembered your password? </Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text className="text-xs font-semibold text-[#26362E]">Log In</Text>
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