import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

cssInterop(ChevronLeft, { className: 'style' });

export default function BackHeader({
  title,
  subtitle,
  rightAction,
  onBack,
  fallbackRoute = '/(tabs)',
}) {
  const handleBack = () => {
    Haptics.selectionAsync().catch(() => { });
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute);
    }
  };

  return (
    <View className="w-full flex-row items-center justify-between py-2 px-1 mb-2 bg-transparent">
      {/* 1. Left: Circular Tactile Back Button */}
      <TouchableOpacity
        onPress={handleBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-xs shadow-[#26362E]/5 active:bg-[#F2EDE2]"
      >
        <ChevronLeft size={20} color="#26362E" strokeWidth={2.2} />
      </TouchableOpacity>

      {/* 2. Center: Mindful Title & Subtitle */}
      <View className="flex-1 items-center justify-center px-3">
        {title ? (
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            className="text-[17px] font-serif font-bold text-[#1C2520] tracking-tight text-center"
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            numberOfLines={1}
            className="text-[10px] uppercase font-bold text-[#6D7D74] tracking-widest text-center mt-0.5"
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* 3. Right: Optional Action or Empty Balance Counterweight */}
      <View className="w-10 h-10 items-center justify-center">
        {rightAction ? (
          rightAction
        ) : (
          <View className="w-10 h-10" pointerEvents="none" />
        )}
      </View>
    </View>
  );
}