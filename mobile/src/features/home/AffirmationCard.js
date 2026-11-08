import React, { useState } from 'react';
import { Share, Text, View, TouchableOpacity } from 'react-native';
import {
  Bookmark,
  BookmarkCheck,
  Quote,
  RotateCw,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

cssInterop(Quote, { className: 'style' });
cssInterop(RotateCw, { className: 'style' });
cssInterop(Bookmark, { className: 'style' });
cssInterop(BookmarkCheck, { className: 'style' });
cssInterop(Share2, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });

export default function AffirmationCard({
  affirmation,
  onRefresh,
  onToggleSave,
}) {
  const reduceMotion = useReducedMotion();
  const [busy, setBusy] = useState(false);

  // Rotation animation value for refresh action
  const spinDegrees = useSharedValue(0);

  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch {
      // Quiet failover; errors handled upstream
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = () => {
    Haptics.selectionAsync().catch(() => { });
    if (!reduceMotion) {
      spinDegrees.value = withSequence(
        withTiming(spinDegrees.value + 360, {
          duration: 650,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    }
    run(onRefresh);
  };

  const handleToggleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    run(() => onToggleSave(!affirmation.saved));
  };

  const handleShare = () => {
    Haptics.selectionAsync().catch(() => { });
    Share.share({
      message: `"${affirmation.text}" — Reflecting with Solace AI`,
    }).catch(() => { });
  };

  const spinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinDegrees.value}deg` }],
  }));

  return (
    <View
      accessibilityLabel="Daily affirmation reflection"
      className="w-full bg-[#F3EDE2] border border-[#E6DECF] p-6 rounded-[32px] shadow-sm shadow-[#26362E]/5 relative overflow-hidden"
    >
      {/* Background Organic Ambient Aura */}
      <View className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/40 pointer-events-none" />
      <View className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-[#E5EDE8]/50 pointer-events-none" />

      {/* Header Row: Title & Concentric Aura Quote Crest */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2.5">
          {/* Concentric Aura Mark */}
          <View className="w-10 h-10 rounded-full bg-[#E5EDE8] items-center justify-center relative shadow-xs">
            <View className="w-7 h-7 rounded-full bg-[#26362E] items-center justify-center">
              <Quote size={13} color="#FAF8F5" strokeWidth={2.4} />
            </View>
          </View>

          <View>
            <View className="flex-row items-center gap-1">
              <Sparkles size={10} color="#715E41" />
              <Text className="text-[10px] uppercase font-bold text-[#715E41] tracking-widest">
                Mindful Presence
              </Text>
            </View>
            <Text className="text-xs font-serif font-bold text-[#2A2318] tracking-tight">
              A Thought for Today
            </Text>
          </View>
        </View>

        {/* Live Saved Indicator Pill */}
        {affirmation.saved ? (
          <View className="flex-row items-center gap-1 bg-[#26362E] px-2.5 py-1 rounded-full">
            <BookmarkCheck size={11} color="#FAF8F5" />
            <Text className="text-[9px] font-bold text-[#FAF8F5] uppercase tracking-wider">
              Saved
            </Text>
          </View>
        ) : null}
      </View>

      {/* Affirmation Text (Editorial Serif) */}
      <Animated.Text
        key={affirmation.text}
        entering={reduceMotion ? undefined : FadeIn.duration(320)}
        accessibilityLiveRegion="polite"
        className="text-[22px] font-serif font-bold text-[#1C2520] leading-[33px] tracking-tight mb-6"
      >
        "{affirmation.text}"
      </Animated.Text>

      {/* Interactive Bottom Actions Bar */}
      <View className="flex-row items-center justify-between pt-3 border-t border-[#E5DAC6]">
        <Text className="text-[11px] text-[#7E715C] font-medium tracking-tight">
          Reflect & absorb
        </Text>

        <View className="flex-row items-center gap-2">
          {/* Action 1: Refresh with Spin */}
          <ActionPill
            label="Get a different affirmation"
            disabled={busy}
            onPress={handleRefresh}
          >
            <Animated.View style={spinAnimatedStyle}>
              <RotateCw size={17} color="#26362E" strokeWidth={2.2} />
            </Animated.View>
          </ActionPill>

          {/* Action 2: Bookmark / Save */}
          <ActionPill
            label={affirmation.saved ? 'Remove from saved' : 'Save affirmation'}
            disabled={busy}
            active={affirmation.saved}
            onPress={handleToggleSave}
          >
            {affirmation.saved ? (
              <BookmarkCheck size={17} color="#FAF8F5" strokeWidth={2.2} />
            ) : (
              <Bookmark size={17} color="#26362E" strokeWidth={2.2} />
            )}
          </ActionPill>

          {/* Action 3: Share */}
          <ActionPill label="Share affirmation" onPress={handleShare}>
            <Share2 size={17} color="#26362E" strokeWidth={2.2} />
          </ActionPill>
        </View>
      </View>
    </View>
  );
}

function ActionPill({ label, onPress, disabled, active, children }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!reduceMotion && !disabled) {
      scale.value = withSpring(0.92, { damping: 16, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion && !disabled) {
      scale.value = withSpring(1, { damping: 16, stiffness: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={animatedStyle}
        className={`w-10 h-10 rounded-full items-center justify-center border transition-all ${active
          ? 'bg-[#26362E] border-[#26362E] shadow-sm shadow-[#26362E]/20'
          : 'bg-white border-[#DCD3C1] active:bg-[#F2EDE2]'
          } ${disabled ? 'opacity-40' : 'opacity-100'}`}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}