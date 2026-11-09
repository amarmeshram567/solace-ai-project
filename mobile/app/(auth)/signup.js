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
import * as Haptics from 'expo-haptics';
import { cssInterop } from 'nativewind';

import { useAuth } from '../../src/auth/AuthContext';
import { ApiError } from '../../src/services/api';
import { fieldErrorsFrom } from '../../src/utils/format';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Ionicons, { className: 'style' });
cssInterop(Feather, { className: 'style' });

export default function Signup() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const { signUp } = useAuth();
  const { width } = useWindowDimensions();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your full name';
    if (!form.email.trim()) next.email = 'Enter your email address';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';

    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await signUp({ ...form, name: form.name.trim(), email: form.email.trim() });

      showNotification({
        title: 'Account Created',
        message: 'Your account has been successfully created. Please check your email for verification instructions.',
        type: 'success',
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
        title: 'Sign Up Failed',
        message: err.message || 'Please check your input and try again.',
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
      <View className="w-full flex-1 md:max-w-[420px] md:h-[94vh] md:max-h-[900px] md:rounded-[40px] md:overflow-hidden md:shadow-2xl md:shadow-[#26362E]/10 md:border md:border-[#E8E4DA] bg-[#F9F7F2] relative">

        {/* Top Organic Art Banner */}
        <View className="h-[180px] w-full relative overflow-hidden bg-[#EFECE4] items-center justify-center">
          <View className="absolute -top-12 -right-10 w-56 h-56 rounded-full bg-[#E3ECE6]/70" />
          <View className="absolute top-6 -left-12 w-44 h-44 rounded-full bg-[#E5DFD4]/60" />
          <View className="absolute -bottom-8 w-[120%] h-32 bg-[#A3B8AD]/30 rounded-t-[100%] items-center justify-end pb-3">
            <View className="w-[82%] h-20 bg-[#7B9486]/35 rounded-t-[100%] items-center justify-end pb-2">
              <View className="w-[58%] h-12 bg-[#2D3F35]/25 rounded-t-[100%]" />
            </View>
          </View>

          {/* Top Navigation */}
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

          {/* Floating Emblem */}
          <View className="items-center z-10 -mt-1">
            <View className="w-11 h-11 rounded-full bg-white items-center justify-center shadow-md shadow-black/5 border border-[#E5DFD3] mb-1">
              <Ionicons name="sparkles-outline" size={18} color="#26362E" />
            </View>
            <Text className="text-[10px] tracking-[4px] uppercase font-bold text-[#45544B]">
              Begin Your Journey
            </Text>
          </View>
        </View>

        {/* Elevated Form Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-[#FAF8F5] rounded-t-[36px] -mt-5 px-7 shadow-xl shadow-black/5 border-t border-[#EAE5D9]">
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingTop: 20, paddingBottom: 80 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header Titles */}
              <View className="mb-4 items-center">
                <Text className="text-[25px] font-serif text-[#1C2420] tracking-tight">
                  Create Your Space
                </Text>
                <Text className="text-xs text-[#707E76] mt-1 text-center">
                  Your feelings matter. Take one gentle step at a time.
                </Text>
              </View>

              {/* Segmented Switcher */}
              <View className="flex-row h-[48px] rounded-full p-1 bg-[#EAE5DB] mb-5 border border-[#E0D9CD]">
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity
                    className="flex-1 h-full items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-[#64726A] font-medium text-xs tracking-wider">Log In</Text>
                  </TouchableOpacity>
                </Link>

                <View className="flex-1 h-full rounded-full bg-[#26362E] items-center justify-center shadow-sm">
                  <Text className="text-[#FAF8F5] font-semibold text-xs tracking-wider">Sign Up</Text>
                </View>
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

              {/* Full Name */}
              <View className="mb-3.5">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Full Name
                </Text>
                <View className={`flex-row items-center h-[50px] px-4 rounded-2xl border ${getInputContainerStyle('name')}`}>
                  <Feather name="user" size={16} color={getIconColor('name')} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-sm text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0, paddingVertical: 0 }}
                    placeholder="Alex Rivera"
                    placeholderTextColor="#A9B3AC"
                    value={form.name}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={set('name')}
                    autoCapitalize="words"
                    textContentType="name"
                  />
                </View>
                {errors.name ? (
                  <Text className="text-[#B3261E] text-xs mt-1 ml-2">{errors.name}</Text>
                ) : null}
              </View>

              {/* Email Address */}
              <View className="mb-3.5">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Email Address
                </Text>
                <View className={`flex-row items-center h-[50px] px-4 rounded-2xl border ${getInputContainerStyle('email')}`}>
                  <Feather name="mail" size={16} color={getIconColor('email')} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-sm text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0, paddingVertical: 0 }}
                    placeholder="alex@mindfulness.com"
                    placeholderTextColor="#A9B3AC"
                    value={form.email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={set('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                  />
                </View>
                {errors.email ? (
                  <Text className="text-[#B3261E] text-xs mt-1 ml-2">{errors.email}</Text>
                ) : null}
              </View>

              {/* Password */}
              <View className="mb-3.5">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Password
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

              {/* Confirm Password */}
              <View className="mb-5">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Confirm Password
                </Text>
                <View className={`flex-row items-center h-[50px] px-4 rounded-2xl border ${getInputContainerStyle('confirmPassword')}`}>
                  <Feather name="shield" size={16} color={getIconColor('confirmPassword')} style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-sm text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0, paddingVertical: 0 }}
                    placeholder="Repeat your password"
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

              {/* Primary Action Button (Pure TouchableOpacity for Native Stability) */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Create Account"
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
                  marginTop: 6,
                  marginBottom: 16,
                }}
              >
                {submitting ? (
                  <ActivityIndicator color="#FAF8F5" size="small" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ color: '#FAF8F5', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 }}>
                      Create Space
                    </Text>
                    <Feather name="arrow-right" size={16} color="#FAF8F5" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Bottom Redirect */}
              <View className="flex-row items-center justify-center mt-2">
                <Text className="text-xs text-[#7B8880]">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-xs font-semibold text-[#26362E]">Log In</Text>
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