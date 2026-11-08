import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

cssInterop(AlertCircle, { className: 'style' });

export default function TextField({
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  rightAction,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  className = '',
  style,
  onFocus,
  onBlur,
  ...inputProps
}) {
  const reduceMotion = useReducedMotion();
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (!reduceMotion) {
      focusProgress.value = withTiming(1, { duration: 180 });
    }
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (!reduceMotion) {
      focusProgress.value = withTiming(0, { duration: 180 });
    }
    onBlur?.(e);
  };

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? '#B3261E'
      : focusProgress.value > 0.5
        ? '#26362E'
        : '#E6E1D5',
  }));

  return (
    <View className={`w-full mb-3.5 ${className}`} style={style}>
      {/* 1. Upper Label Header & Optional Hint */}
      {label ? (
        <View className="flex-row items-center justify-between mb-1.5 px-1">
          <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A]">
            {label}
          </Text>
          {hint && !error ? (
            <Text className="text-[10px] text-[#86948C] font-normal">
              {hint}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* 2. Input Container Shell with Micro-Borders */}
      <Animated.View
        style={borderAnimatedStyle}
        className={`w-full flex-row items-center rounded-2xl bg-white border transition-all ${multiline ? 'py-2.5 px-3.5 min-h-[96px] items-start' : 'h-[50px] px-3.5'
          } ${error
            ? 'bg-[#FFFBFB] shadow-none'
            : isFocused
              ? 'shadow-sm shadow-[#26362E]/10 bg-white'
              : 'shadow-xs shadow-[#26362E]/5'
          }`}
      >
        {/* Optional Left Icon Slot */}
        {LeftIcon ? (
          <View className={`mr-2.5 ${multiline ? 'mt-1' : ''}`}>
            <LeftIcon
              size={17}
              color={error ? '#B3261E' : isFocused ? '#26362E' : '#8A9790'}
            />
          </View>
        ) : null}

        {/* Core Input Field (Zero Web Outlines) */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#A9B3AC"
          multiline={multiline}
          numberOfLines={numberOfLines}
          accessibilityLabel={label}
          accessibilityHint={hint}
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-xs text-[#1E2522] font-medium leading-relaxed"
          style={{
            outlineStyle: 'none',
            borderWidth: 0,
            paddingVertical: Platform.OS === 'ios' ? 0 : 4,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          {...inputProps}
        />

        {/* Optional Right Action Slot (Password eye, clear, or unit tag) */}
        {rightAction ? (
          <View className={`ml-2 ${multiline ? 'mt-1' : ''}`}>
            {rightAction}
          </View>
        ) : null}
      </Animated.View>

      {/* 3. Subtle Error Banner */}
      {error ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(200)}
          className="flex-row items-center gap-1 mt-1.5 ml-1"
          accessibilityLiveRegion="polite"
        >
          <AlertCircle size={12} color="#B3261E" />
          <Text className="text-[11px] text-[#B3261E] font-medium leading-none">
            {error}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

cssInterop(TextField, { className: 'style' });