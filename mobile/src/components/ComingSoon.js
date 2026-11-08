import React from 'react';
import { Text, View } from 'react-native';
import { Compass, Clock, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

cssInterop(Compass, { className: 'style' });
cssInterop(Clock, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });

export default function ComingSoon({
  feature = 'This mindful feature',
  phase = 'an upcoming release',
  statusText = `Arriving in ${phase}`,
  description = `This mindful experience is currently being shaped for ${phase}. Nothing is scored or saved here yet as we prepare your quiet space.`,
  footerText = 'In Gentle Progress',
  accessibilityLabel = `${feature} is arriving in ${phase}`,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <View
      className="flex-1 items-center justify-center px-6 py-8"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.duration(420)}
        className="items-center w-full max-w-[340px]"
      >
        {/* 1. Concentric Organic Aura Rings */}
        <View className="w-44 h-44 rounded-full bg-[#E5EDE8] items-center justify-center mb-6 relative shadow-xs">
          <View className="w-32 h-32 rounded-full bg-[#C9DDD1] items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-[#26362E] items-center justify-center shadow-lg shadow-[#26362E]/25">
              <Compass size={32} color="#FAF8F5" strokeWidth={2.2} />
            </View>
          </View>
        </View>

        {/* 2. Phase Pill Badge */}
        <View className="flex-row items-center gap-1.5 bg-[#F3EDE2] border border-[#E5DDCB] px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
          <Clock size={12} color="#715E41" />
          <Text className="text-[11px] font-semibold text-[#54442A] capitalize tracking-wide">
            {statusText}
          </Text>
        </View>

        {/* 3. Feature Heading */}
        <Text
          accessibilityRole="header"
          className="text-[25px] font-serif font-bold text-[#1C2520] tracking-tight text-center mb-2 leading-snug"
        >
          {feature}
        </Text>

        {/* 4. Serene Explanatory Text */}
        <Text className="text-xs text-[#6F7E75] text-center leading-relaxed font-normal px-2">
          {description}
        </Text>

        {/* 5. Ambient Solace Tag */}
        <View className="flex-row items-center gap-1.5 mt-5 bg-[#FAF8F5] border border-[#E8E2D6] px-3 py-1 rounded-full">
          <Sparkles size={11} color="#526F60" />
          <Text className="text-[10px] uppercase font-bold text-[#526F60] tracking-widest">
            {footerText}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}