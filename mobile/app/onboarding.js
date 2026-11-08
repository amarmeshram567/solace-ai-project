import React, { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  HeartHandshake,
  Bot,
  Sprout,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { markOnboardingComplete } from '../src/services/onboarding';
import { useNotification } from '../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(HeartHandshake, { className: 'style' });
cssInterop(Bot, { className: 'style' });
cssInterop(Sprout, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });

const SLIDES = [
  {
    key: 'understand',
    badge: 'Emotional Rhythm',
    Icon: HeartHandshake,
    bgOuter: '#E5EDE8',
    bgMid: '#C9DDD1',
    title: 'Understand Yourself',
    body: 'Notice how you feel each day. Gentle mood check-ins help you discover patterns and nurture peace over time.',
  },
  {
    key: 'companion',
    badge: 'Gentle Support',
    Icon: Bot,
    bgOuter: '#EAEBF2',
    bgMid: '#D6DAE6',
    title: 'Your Calm Companion',
    body: 'Reflect with Zen Monk, an empathetic AI presence, whenever you need a peaceful, non-judgmental space to think.',
  },
  {
    key: 'habits',
    badge: 'Daily Balance',
    Icon: Sprout,
    bgOuter: '#F3EDE2',
    bgMid: '#E6DECF',
    title: 'Build Restorative Habits',
    body: 'Guided box breathing, soothing affirmations, and micro-rituals designed to anchor your mind one breath at a time.',
  },
];

export default function Onboarding() {

  const { showNotification } = useNotification();

  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Responsive shell constraint for desktop/web
  const containerWidth = Math.min(width, 430);
  const isLast = index === SLIDES.length - 1;

  const goTo = (i) => {
    Haptics.selectionAsync().catch(() => { });
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  const finish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    await markOnboardingComplete();
    router.replace('/(auth)/login');

    showNotification({
      title: 'Onboarding Complete',
      message: 'You are now ready to start using Solace.',
      type: 'success',
    });

  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between">

        {/* Top Header / Skip Button */}
        <View className="h-14 px-6 flex-row items-center justify-between border-b border-transparent">
          <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3 py-1 rounded-full border border-[#D1E0D6]">
            <Sparkles size={11} color="#355243" />
            <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
              Welcome to Solace
            </Text>
          </View>

          <Pressable
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            hitSlop={12}
            disabled={isLast}
            className={`px-3 py-1.5 rounded-full ${isLast ? 'opacity-0' : 'active:bg-[#F2EDE2]'}`}
          >
            <Text className="text-xs font-semibold text-[#68776F] tracking-wide">
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Paged Carousel Stream */}
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          snapToInterval={containerWidth}
          decelerationRate="fast"
          getItemLayout={(_, i) => ({
            length: containerWidth,
            offset: containerWidth * i,
            index: i,
          })}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
            if (newIndex !== index) {
              Haptics.selectionAsync().catch(() => { });
              setIndex(newIndex);
            }
          }}
          renderItem={({ item }) => {
            const Icon = item.Icon;
            return (
              <View
                style={{ width: containerWidth }}
                className="flex-1 items-center justify-center px-8"
              >
                {/* Concentric Organic Aura Rings */}
                <View
                  style={{ backgroundColor: item.bgOuter }}
                  className="w-52 h-52 rounded-full items-center justify-center mb-8 relative shadow-sm"
                >
                  <View
                    style={{ backgroundColor: item.bgMid }}
                    className="w-38 h-38 rounded-full items-center justify-center"
                  >
                    <View className="w-24 h-24 rounded-full bg-[#26362E] items-center justify-center shadow-xl shadow-[#26362E]/25">
                      <Icon size={44} color="#FAF8F5" strokeWidth={1.8} />
                    </View>
                  </View>
                </View>

                {/* Subtitle Badge */}
                <View className="bg-white border border-[#E8E2D6] px-3.5 py-1 rounded-full mb-3 shadow-xs">
                  <Text className="text-[10px] uppercase font-bold text-[#6D7D74] tracking-widest">
                    {item.badge}
                  </Text>
                </View>

                {/* Title */}
                <Text className="text-[28px] font-serif font-bold text-[#1C2520] tracking-tight text-center mb-2.5 leading-snug">
                  {item.title}
                </Text>

                {/* Description Body */}
                <Text className="text-xs text-[#6F7E75] text-center leading-relaxed font-normal max-w-[310px]">
                  {item.body}
                </Text>
              </View>
            );
          }}
        />

        {/* Footer & Paging Indicators */}
        <View className="px-6 pb-6 pt-2">
          {/* Animated Indicators */}
          <View
            className="flex-row items-center justify-center gap-2 mb-6"
            accessibilityLabel={`Step ${index + 1} of ${SLIDES.length}`}
          >
            {SLIDES.map((s, i) => (
              <IndicatorPill key={s.key} active={i === index} />
            ))}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            onPress={isLast ? finish : () => goTo(index + 1)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Get started' : 'Continue'}
            className="h-[54px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25"
          >
            <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
              {isLast ? 'Get Started' : 'Continue'}
            </Text>
            <ArrowRight size={16} color="#FAF8F5" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Micro-Component: Smooth Expanding Spring Pill Indicator
function IndicatorPill({ active }) {
  const widthAnim = useSharedValue(active ? 24 : 7);

  React.useEffect(() => {
    widthAnim.value = withSpring(active ? 24 : 7, {
      damping: 18,
      stiffness: 160,
    });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: widthAnim.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`h-2 rounded-full ${active ? 'bg-[#26362E]' : 'bg-[#E0DAD0]'
        }`}
    />
  );
}