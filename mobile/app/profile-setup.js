import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';
import {
  User,
  Calendar,
  Globe,
  Sparkles,
  ArrowRight,
  Camera,
  AlertCircle,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { LoadingState } from '../src/components/States';
import { useAuth } from '../src/auth/AuthContext';
import { ApiError } from '../src/services/api';
import { deviceTimeZone, fieldErrorsFrom } from '../src/utils/format';
import { useNotification } from '../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(User, { className: 'style' });
cssInterop(Calendar, { className: 'style' });
cssInterop(Globe, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });
cssInterop(Camera, { className: 'style' });
cssInterop(AlertCircle, { className: 'style' });

const TIMEZONES = [
  'Asia/Kolkata',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
];

export default function ProfileSetup() {
  const { showNotification } = useNotification();
  const { status, user, updateProfile, uploadAvatar } = useAuth();
  const reduceMotion = useReducedMotion();

  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [birthYear, setBirthYear] = useState('');
  const [timezone, setTimezone] = useState(() => {
    const device = deviceTimeZone();
    return TIMEZONES.includes(device) ? device : user?.timezone ?? 'Asia/Kolkata';
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isYearFocused, setIsYearFocused] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const maximumBirthDate = new Date(new Date().getFullYear() - 5, 11, 31);

  const handleDateChange = (event, selectedDate) => {
    // On Android, the dialog closes immediately on selection or dismiss
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      const year = selectedDate.getFullYear().toString();
      setBirthYear(year);
      if (errors.birthYear) {
        setErrors((e) => ({ ...e, birthYear: '' }));
      }
    }
  };

  const handleWebDateChange = (selectedDate) => {
    const year = selectedDate.slice(0, 4);
    if (/^\d{4}$/.test(year)) {
      setBirthYear(year);
      if (errors.birthYear) {
        setErrors((e) => ({ ...e, birthYear: '' }));
      }
    }
  };

  const avatarScale = useSharedValue(1);
  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const saveAvatar = useCallback(async (asset) => {
    setAvatarUploading(true);
    try {
      const savedAvatarUri = await uploadAvatar(asset);
      setAvatarUri(savedAvatarUri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    } catch (err) {
      showNotification({
        title: 'Photo Upload Failed',
        message: err instanceof ApiError
          ? err.message
          : 'Could not save your profile photo. Please try again.',
        type: 'alert',
      });
    } finally {
      setAvatarUploading(false);
    }
  }, [showNotification, uploadAvatar]);

  useEffect(() => {
    if (Platform.OS !== 'android' || status !== 'signedIn' || user?.profileCompleted) {
      return undefined;
    }

    let active = true;
    ImagePicker.getPendingResultAsync()
      .then((result) => {
        if (!active || !result) return;
        if ('code' in result) {
          showNotification({
            title: 'Photo Selection Failed',
            message: result.message || 'Could not retrieve the selected photo. Please try again.',
            type: 'alert',
          });
          return;
        }

        const asset = result.assets?.[0];
        if (!result.canceled && asset) void saveAvatar(asset);
      })
      .catch((err) => {
        if (!active) return;
        showNotification({
          title: 'Photo Selection Failed',
          message: err instanceof Error
            ? err.message
            : 'Could not retrieve the selected photo. Please try again.',
          type: 'alert',
        });
      });

    return () => {
      active = false;
    };
  }, [saveAvatar, showNotification, status, user?.profileCompleted]);

  if (status === 'loading') {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <LoadingState message="Setting up your solace…" />
      </SafeAreaView>
    );
  }

  if (status === 'signedOut') return <Redirect href="/(auth)/login" />;
  if (user?.profileCompleted) return <Redirect href="/(tabs)" />;

  const pickImage = async () => {
    Haptics.selectionAsync().catch(() => { });
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showNotification({
          title: 'Permission Required',
          message: 'Please allow access to your photo library to pick an avatar.',
          type: 'alert',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        base64: true,
      });

      const asset = result.assets?.[0];
      if (result.canceled || !asset) return;

      await saveAvatar(asset);
    } catch (err) {
      showNotification({
        title: 'Photo Upload Failed',
        message: err instanceof ApiError
          ? err.message
          : 'Could not save your profile photo. Please try again.',
        type: 'alert',
      });
    }
  };

  const handleAvatarPressIn = () => {
    if (!reduceMotion) {
      avatarScale.value = withSpring(0.95, { damping: 16, stiffness: 280 });
    }
  };

  const handleAvatarPressOut = () => {
    if (!reduceMotion) {
      avatarScale.value = withSpring(1, { damping: 16, stiffness: 280 });
    }
  };

  const submit = async () => {
    const next = {};
    if (!name.trim()) next.name = 'Please tell us what to call you';
    const year = birthYear.trim() ? Number(birthYear) : null;
    if (birthYear.trim() && (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() - 5)) {
      next.birthYear = `Enter a valid birth year (1900–${new Date().getFullYear() - 5})`;
    }

    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
      return;
    }

    setSubmitting(true);
    Haptics.selectionAsync().catch(() => { });

    try {
      await updateProfile({
        name: name.trim(),
        birthYear: year,
        timezone,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

      showNotification({
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
        type: 'success',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = fieldErrorsFrom(err);
        if (Object.keys(fields).length) setErrors(fields);
        setFormError(err.message);
      } else {
        setFormError('Something went wrong. Please check your connection and try again.');
      }

      showNotification({
        title: 'Profile Update Failed',
        message: err.message || 'Something went wrong. Please check your connection and try again.',
        type: 'alert',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between p-6">
        {/* Top Stepper Pill */}
        <View className="items-center pt-1">
          <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D1E0D6]">
            <Sparkles size={11} color="#355243" />
            <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
              Step 1 of 1 • Solace-AI Setup
            </Text>
          </View>
        </View>

        {/* Form Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          className="flex-1"
        >
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(380)}>
            {/* Interactive Concentric Aura Avatar Uploader */}
            <View className="items-center mb-5">
              <Pressable
                onPress={pickImage}
                disabled={avatarUploading}
                onPressIn={handleAvatarPressIn}
                onPressOut={handleAvatarPressOut}
                accessibilityRole="button"
                accessibilityLabel="Choose profile photo"
                className="relative"
              >
                <Animated.View
                  style={animatedAvatarStyle}
                  className="w-28 h-28 rounded-full bg-[#E5EDE8] items-center justify-center relative shadow-sm shadow-[#26362E]/10"
                >
                  <View className="w-22 h-22 rounded-full bg-[#C9DDD1] items-center justify-center overflow-hidden">
                    {avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        className="w-16 h-16 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-14 h-14 rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25">
                        <User size={24} color="#FAF8F5" />
                      </View>
                    )}
                  </View>
                </Animated.View>

                {/* Floating Camera Badge Pill */}
                <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#26362E] border-2 border-[#FAF8F5] items-center justify-center shadow-md">
                  {avatarUploading ? (
                    <ActivityIndicator size="small" color="#FAF8F5" />
                  ) : (
                    <Camera size={13} color="#FAF8F5" strokeWidth={2.4} />
                  )}
                </View>
              </Pressable>

              <Text className="text-[11px] font-medium text-[#707E76] mt-2">
                {avatarUploading
                  ? 'Saving your photo...'
                  : avatarUri
                    ? 'Tap to change photo'
                    : 'Tap to add profile photo'}
              </Text>
            </View>

            <Text
              accessibilityRole="header"
              className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight text-center leading-snug mb-1"
            >
              Let’s Get to Know You
            </Text>
            <Text className="text-xs text-[#707E76] text-center leading-relaxed font-normal px-4 mb-6">
              This gently adapts your daily check-ins, mindful rhythms, and local reminders. You can modify these at any time.
            </Text>

            {/* Field 1: Name */}
            <View className="mb-4">
              <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                What should we call you? *
              </Text>
              <View
                className={`flex-row items-center h-[50px] px-3.5 rounded-2xl bg-white border ${errors.name
                  ? 'border-[#B3261E] bg-[#FFFBFB]'
                  : isNameFocused
                    ? 'border-[#26362E]'
                    : 'border-[#E6E1D5]'
                  } shadow-sm shadow-[#26362E]/5`}
              >
                <User size={16} color={errors.name ? '#B3261E' : '#8A9790'} style={{ marginRight: 8 }} />
                <TextInput
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (errors.name) setErrors((e) => ({ ...e, name: '' }));
                  }}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  placeholder="Enter your name"
                  placeholderTextColor="#A9B3AC"
                  autoCapitalize="words"
                  autoCorrect={false}
                  className="flex-1 text-sm text-[#1E2522] font-medium"
                  style={{ outlineStyle: 'none', borderWidth: 0 }}
                />
              </View>
              {errors.name ? (
                <Text className="text-[11px] text-[#B3261E] mt-1 ml-1.5 font-medium">{errors.name}</Text>
              ) : null}
            </View>

            {/* Field 2: Birth Year (Optional) */}
            <View className="mb-5">
              <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                Birth Year (Optional)
              </Text>

              <View
                className={`flex-row items-center h-[50px] px-3.5 rounded-2xl bg-white border ${errors.birthYear
                  ? 'border-[#B3261E] bg-[#FFFBFB]'
                  : isYearFocused
                    ? 'border-[#26362E]'
                    : 'border-[#E6E1D5]'
                  } shadow-sm shadow-[#26362E]/5`}
              >
                {/* Tappable Calendar Icon */}
                {Platform.OS === 'web' ? (
                  <View className="relative mr-2">
                    <Calendar
                      size={16}
                      color={errors.birthYear ? '#B3261E' : '#8A9790'}
                    />
                    <TextInput
                      type="date"
                      value={birthYear ? `${birthYear}-01-01` : ''}
                      onChangeText={handleWebDateChange}
                      accessibilityLabel="Choose birth year"
                      style={{
                        position: 'absolute',
                        width: 24,
                        height: 24,
                        opacity: 0,
                      }}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowDatePicker(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="mr-2"
                  >
                    <Calendar
                      size={16}
                      color={errors.birthYear ? '#B3261E' : '#8A9790'}
                    />
                  </TouchableOpacity>
                )}

                <TextInput
                  value={birthYear}
                  onChangeText={(t) => {
                    setBirthYear(t);
                    if (errors.birthYear) setErrors((e) => ({ ...e, birthYear: '' }));
                  }}
                  onFocus={() => setIsYearFocused(true)}
                  onBlur={() => setIsYearFocused(false)}
                  placeholder="e.g. 1999"
                  placeholderTextColor="#A9B3AC"
                  keyboardType="number-pad"
                  maxLength={4}
                  className="flex-1 text-sm text-[#1E2522] font-medium"
                  style={{ outlineStyle: 'none', borderWidth: 0 }}
                />
              </View>

              {/* Native Date Picker Modal */}
              {showDatePicker && (
                <DateTimePicker
                  value={
                    birthYear && birthYear.length === 4
                      ? new Date(parseInt(birthYear, 10), 0, 1)
                      : new Date(2000, 0, 1) // Sensible default starting year
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={maximumBirthDate}
                  minimumDate={new Date(1900, 0, 1)}
                  onChange={handleDateChange}
                />
              )}

              {errors.birthYear ? (
                <Text className="text-[11px] text-[#B3261E] mt-1 ml-1.5 font-medium">
                  {errors.birthYear}
                </Text>
              ) : null}
            </View>

            {/* Field 3: Timezone Selection Chips */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2 px-1">
                <View className="flex-row items-center gap-1.5">
                  <Globe size={13} color="#54625A" />
                  <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
                    Your Timezone
                  </Text>
                </View>
                <Text className="text-[11px] text-[#7A8A80]">
                  {timezone.split('/')[1]?.replace(/_/g, ' ') || timezone}
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {TIMEZONES.map((tz) => {
                  const selected = tz === timezone;
                  const label = tz.split('/')[1].replace(/_/g, ' ');

                  return (
                    <Pressable
                      key={tz}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => { });
                        setTimezone(tz);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={tz.replace(/_/g, ' ')}
                      className={`px-3.5 py-2 rounded-full border transition-all ${selected
                        ? 'bg-[#26362E] border-[#26362E] shadow-sm shadow-[#26362E]/20'
                        : 'bg-white border-[#E8E2D6] active:bg-[#F2EDE2]'
                        }`}
                    >
                      <Text
                        className={`text-xs ${selected ? 'font-bold text-[#FAF8F5]' : 'font-medium text-[#506056]'
                          }`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Form Error Alert */}
            {formError ? (
              <View className="bg-[#FAF4F2] border border-[#F2DDD5] p-3 rounded-2xl flex-row items-center gap-2 mb-2">
                <AlertCircle size={15} color="#A83A2E" />
                <Text className="text-xs text-[#A83A2E] flex-1 font-medium leading-snug">{formError}</Text>
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>

        {/* Bottom CTA Action Button */}
        <View className="pt-2">
          <TouchableOpacity
            onPress={submit}
            disabled={submitting || avatarUploading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Complete profile and continue"
            className={`h-[54px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25 ${avatarUploading ? 'opacity-50' : ''
              }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FAF8F5" />
            ) : (
              <>
                <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
                  Enter Solace
                </Text>
                <ArrowRight size={16} color="#FAF8F5" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}