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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { cssInterop } from 'nativewind';

import { useAuth } from '../../src/auth/AuthContext';
import { ApiError } from '../../src/services/api';
import { fieldErrorsFrom } from '../../src/utils/format';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(LinearGradient, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Ionicons, { className: 'style' });
cssInterop(Feather, { className: 'style' });

export default function Login() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();
  const isWebOrTablet = width >= 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  const submit = async () => {
    const next = {};
    if (!email.trim()) next.email = 'Enter your email';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      showNotification({
        title: 'Welcome Back',
        message: 'You have entered your mindful solace-ai.',
        type: 'success',
      });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      showNotification({
        title: 'Sign In Failed',
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
      {/* Responsive Shell */}
      <View className="w-full flex-1 md:max-w-[440px] md:h-[92vh] md:max-h-[880px] md:rounded-[44px] md:overflow-hidden md:shadow-2xl md:shadow-[#26362E]/15 md:border md:border-[#E8E4DA] bg-[#F9F7F2] relative">

        {/* Top Organic Art Banner */}
        <View className="h-[200px] w-full relative overflow-hidden bg-[#F1EFE9] items-center justify-center">
          {/* Subtle Multi-layer Organic Hills/Arcs */}
          <View className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-[#E5ECE7]/60" />
          <View className="absolute top-10 -left-16 w-56 h-56 rounded-full bg-[#E2DBD0]/50" />
          <View className="absolute bottom-0 w-[120%] h-32 bg-[#8FA89B]/20 rounded-t-[100%] items-center justify-end pb-3">
            <View className="w-[85%] h-20 bg-[#738E7E]/30 rounded-t-[100%] items-center justify-end pb-2">
              <View className="w-[60%] h-12 bg-[#26362E]/20 rounded-t-[100%]" />
            </View>
          </View>

          {/* Navigation Bar */}
          <SafeAreaView edges={['top', 'left']} className="absolute top-3 left-5 right-5 z-20 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.canGoBack() && router.back()}
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center border border-[#E5E2D9] shadow-sm"
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Feather name="chevron-left" size={20} color="#26362E" />
            </TouchableOpacity>

            {/* Mindful Badge */}
            <View className="w-8 h-8 rounded-full bg-white/90 items-center justify-center border border-[#E5E2D9]">
              <Feather name="feather" size={14} color="#26362E" />
            </View>
          </SafeAreaView>

          {/* Minimal Organic Illustration Center */}
          <View className="items-center z-10 -mt-2">
            <View className="w-12 h-12 rounded-full bg-[#FAF8F5] items-center justify-center shadow-sm border border-[#E4DEC9] mb-1.5">
              <Ionicons name="leaf-outline" size={24} color="#26362E" />
            </View>
            <Text className="text-[10px] uppercase tracking-[3px] font-medium text-[#7C8780]">
              Mindful Living
            </Text>
          </View>
        </View>

        {/* Elevated Form Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-[#FAF8F5] rounded-t-[36px] -mt-6 px-7 shadow-lg shadow-[#26362E]/5 border-t border-[#EFECE3]">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingTop: 20, paddingBottom: 70 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header Title & Subtitle */}
              <View className="mb-5 items-center">
                <Text className="text-[26px] font-serif text-[#1E2522] tracking-tight">
                  Welcome Back
                </Text>
                <Text className="text-xs text-[#73827A] mt-1 text-center font-normal">
                  Breathe in, calm your mind, and resume your path
                </Text>
              </View>

              {/* Segmented Pill Switcher */}
              <View className="flex-row h-[46px] rounded-full p-1 bg-[#EDE8DE] mb-5 border border-[#E3DDCF]">
                <View className="flex-1 h-full rounded-full bg-[#26362E] items-center justify-center shadow-sm">
                  <Text className="text-[#FAF8F5] font-semibold text-xs tracking-wider">Log In</Text>
                </View>

                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity
                    className="flex-1 h-full items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-[#64726A] font-medium text-xs tracking-wider">Sign Up</Text>
                  </TouchableOpacity>
                </Link>
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

              {/* Email Field */}
              <View className="mb-4">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Email Address
                </Text>
                <View
                  className={`flex-row items-center border h-[50px] px-4 rounded-2xl bg-white ${getInputContainerStyle('email')}`}
                >
                  <Feather name="mail" size={16} color={getIconColor('email')} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-sm text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0, paddingVertical: 0 }}
                    placeholder="alex@mindfulness.com"
                    placeholderTextColor="#A9B3AC"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email ? (
                  <Text className="text-[#B3261E] text-xs mt-1 ml-2">{errors.email}</Text>
                ) : null}
              </View>

              {/* Password Field */}
              <View className="mb-4">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Password
                </Text>
                <View
                  className={`flex-row items-center border h-[50px] px-4 rounded-2xl bg-white ${getInputContainerStyle('password')}`}
                >
                  <Feather name="lock" size={16} color={getIconColor('password')} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-sm text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0, paddingVertical: 0 }}
                    placeholder="••••••••"
                    placeholderTextColor="#A9B3AC"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={16}
                      color="#7E8B83"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text className="text-[#B3261E] text-xs mt-1 ml-2">{errors.password}</Text>
                ) : null}
              </View>

              {/* Remember Me & Forgot Password */}
              <View className="flex-row items-center justify-between mt-1 mb-6 px-1">
                <TouchableOpacity
                  className="flex-row items-center gap-2"
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.8}
                >
                  <View
                    className={`w-4 h-4 rounded-md border items-center justify-center ${rememberMe ? 'bg-[#26362E] border-[#26362E]' : 'border-[#A3AEA7] bg-white'
                      }`}
                  >
                    {rememberMe && <Ionicons name="checkmark" size={11} color="#FFFFFF" />}
                  </View>
                  <Text className="text-xs text-[#637269]">Remember me</Text>
                </TouchableOpacity>

                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text className="text-xs font-medium text-[#26362E]">Forgot Password?</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Primary Action Button (Solid TouchableOpacity) */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Sign In"
                accessibilityState={{ disabled: submitting }}
                disabled={submitting}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => { });
                  submit();
                }}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#26362E',
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 4,
                  shadowColor: '#26362E',
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#FAF8F5" size="small" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ color: '#FAF8F5', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 }}>
                      Continue
                    </Text>
                    <Feather name="arrow-right" size={16} color="#FAF8F5" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Bottom Disclaimer */}
              <View className="flex-row items-center justify-center mt-6">
                <Text className="text-xs text-[#7B8880]">New to mindful routines? </Text>
                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity>
                    <Text className="text-xs font-semibold text-[#26362E]">Create Account</Text>
                  </TouchableOpacity>
                </Link>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}