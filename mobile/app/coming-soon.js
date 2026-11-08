import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Sparkles, Compass, Clock, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import ComingSoon from '../src/components/ComingSoon';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Compass, { className: 'style' });
cssInterop(Clock, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });

export default function ComingSoonScreen() {
  const { feature = 'This mindful feature', phase = 'an upcoming release' } = useLocalSearchParams();
  const reduceMotion = useReducedMotion();

  const handleBack = () => {
    Haptics.selectionAsync().catch(() => { });
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container for Mobile & Web Centering */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between p-6">

        {/* Navigation & Status Header */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm"
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={20} color="#26362E" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D1E0D6]">
            <Sparkles size={12} color="#355243" />
            <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
              In Development
            </Text>
          </View>

          <View className="w-10 h-10" />
        </View>

        {/* Center Concentric Aura & Presentation (Velora Style) */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(420)}
          className="items-center px-4 my-auto"
        >
          {/* Concentric Organic Aura Rings */}
          <View className="w-44 h-44 rounded-full bg-[#E5EDE8] items-center justify-center mb-6 relative">
            <View className="w-32 h-32 rounded-full bg-[#C9DDD1] items-center justify-center">
              <View className="w-20 h-20 rounded-full bg-[#26362E] items-center justify-center shadow-xl shadow-[#26362E]/25">
                <Compass size={32} color="#FAF8F5" strokeWidth={2.2} />
              </View>
            </View>
          </View>

          {/* Phase Badge */}
          <View className="flex-row items-center gap-1 bg-[#F3EDE2] border border-[#E5DDCB] px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
            <Clock size={12} color="#715E41" />
            <Text className="text-[11px] font-semibold text-[#54442A] capitalize">
              Arriving in {String(phase)}
            </Text>
          </View>

          {/* Feature Title */}
          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight text-center mb-2 leading-snug">
            {String(feature)}
          </Text>

          {/* Descriptive Body */}
          <Text className="text-xs text-[#6F7E75] text-center leading-relaxed font-normal px-4 max-w-[320px]">
            We are gently shaping this mindful practice to bring you deeper stillness and balance. It will open naturally in your solace-ai soon.
          </Text>
        </Animated.View>

        {/* Bottom CTA Action Button */}
        <View className="pt-4">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Return to Solace"
            className="h-[52px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-lg shadow-[#26362E]/25"
          >
            <Text className="text-sm font-semibold text-[#FAF8F5] tracking-wide">
              Return to Solace
            </Text>
            <ArrowRight size={16} color="#FAF8F5" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}