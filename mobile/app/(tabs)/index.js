import React, { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Sparkles } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import ScreenContainer from '../../src/components/ScreenContainer';
import { ErrorState, LoadingState } from '../../src/components/States';
import { useAuth } from '../../src/auth/AuthContext';
import { useHome } from '../../src/features/home/useHome';
import LevelCard from '../../src/features/home/LevelCard';
import AffirmationCard from '../../src/features/home/AffirmationCard';
import CheckInCard from '../../src/features/home/CheckInCard';
import WellnessMoves from '../../src/features/home/WellnessMoves';
import { firstName, greetingFor, longDate } from '../../src/utils/format';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(Bell, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });

export default function Home() {

  const { showNotification } = useNotification();

  const { authedRequest, user: authUser, loadAvatar } = useAuth();
  const { status, data, error, reload, patchData } = useHome();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    loadAvatar().catch((err) => {
      showNotification({
        title: 'Photo Could Not Load',
        message: err?.message || 'Could not load your profile photo.',
        type: 'alert',
      });
    });
  }, [loadAvatar, showNotification]);

  if (status === 'loading' && !data) {
    return <LoadingState message="Gathering your mindful solace…" />;
  }
  if (status === 'error' && !data) {
    return (
      <ErrorState
        title="Solace-ai unavailable"
        message={error || 'Could not load your daily updates. Please check your connection.'}
        onRetry={reload}
      />
    );
  }

  const { user, date, level, streak, affirmation } = data;

  const avatarUri = authUser?.avatarUrl ?? null;

  const refreshAffirmation = async () => {
    const next = await authedRequest('/affirmations/daily/refresh', { method: 'POST' });
    patchData({ affirmation: next });

    showNotification({
      title: 'Affirmation Refreshed',
      message: 'Your daily affirmation has been refreshed with a new one.',
      type: 'success',
    })

  };

  const toggleSave = async (saved) => {
    const next = await authedRequest('/affirmations/daily/save', {
      method: 'POST',
      body: { saved },
    });
    patchData({ affirmation: next });

    showNotification({
      title: saved ? 'Affirmation Saved' : 'Affirmation Unsaved',
      message: saved
        ? 'This affirmation has been added to your saved affirmations.'
        : 'This affirmation has been removed from your saved affirmations.',
      type: saved ? 'success' : 'mindful',
    })

  };

  return (
    <ScreenContainer
      scroll={true}
      contentStyle={{ paddingBottom: 110 }} // Clearance for floating tab pill bar
      className="gap-6"
    >
      {/* 1. Velora Header: Long Date, Action Pills, & Editorial Greeting */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(400)}
        className="w-full pt-1"
      >
        {/* Top Meta Bar */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-1.5">
            <Sparkles size={12} color="#526F60" />
            <Text className="text-[11px] uppercase font-bold text-[#526F60] tracking-widest">
              {longDate(date)}
            </Text>
          </View>

          <View className="flex-row items-center gap-2.5">
            {/* Notification Bell Button */}
            <HeaderActionPill
              label="Reminders and notifications"
              onPress={() => router.push('/notifications/settings')}
            >
              <Bell size={17} color="#26362E" strokeWidth={2} />
              {/* Optional Unread Notification Dot */}
              <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#A83A2E] border border-[#FAF8F5]" />
            </HeaderActionPill>

            {/* Profile Avatar Crest */}
            <HeaderActionPill
              label="Open your profile"
              onPress={() => router.push('/(tabs)/profile')}
              isAvatar
            >
              <View className="w-6 h-6 rounded-full bg-[#E5EDE8] items-center justify-center border border-[#D0DFD6] overflow-hidden">
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-7 h-7 rounded-full bg-[#26362E] items-center justify-center shadow-xs">
                    <Text className="text-xs font-serif font-bold text-[#FAF8F5]">
                      {firstName(user.name).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </HeaderActionPill>
          </View>
        </View>

        {/* Serif Editorial Greeting */}
        <View className="px-0.5">
          <Text
            accessibilityRole="header"
            className="text-[28px] font-serif font-bold text-[#1C2520] tracking-tight leading-[36px]"
          >
            {greetingFor(user.timezone)}, {firstName(user.name)}
          </Text>
          <Text className="text-xs text-[#718279] mt-1 font-normal leading-relaxed">
            Take a gentle, quiet pause for yourself today.
          </Text>
        </View>
      </Animated.View>

      {/* 2. Self-Love Journey Level & Streak Card */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(400).delay(60)}
        className="w-full"
      >
        <LevelCard level={level} streak={streak} />
      </Animated.View>

      {/* 3. Daily Affirmation Reflection Card */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(400).delay(120)}
        className="w-full"
      >
        <AffirmationCard
          affirmation={affirmation}
          onRefresh={refreshAffirmation}
          onToggleSave={toggleSave}
        />
      </Animated.View>

      {/* 4. Quick Daily Mood Check-In Card */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(400).delay(180)}
        className="w-full"
      >
        <CheckInCard />
      </Animated.View>

      {/* 5. Wellness Moves 2x2 Grid Section */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(400).delay(240)}
        className="w-full"
      >
        <WellnessMoves />
      </Animated.View>
    </ScreenContainer>
  );
}

function HeaderActionPill({ label, onPress, isAvatar, children }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!reduceMotion) {
      scale.value = withSpring(0.92, { damping: 16, stiffness: 280, mass: 0.8 });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion) {
      scale.value = withSpring(1, { damping: 16, stiffness: 280, mass: 0.8 });
    }
  };

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => { });
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={animatedStyle}
        className={
          isAvatar
            ? ''
            : 'w-9 h-9 rounded-full bg-white border border-[#E9E4D8] items-center justify-center relative shadow-xs shadow-[#26362E]/5'
        }
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}


