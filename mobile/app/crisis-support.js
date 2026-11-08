import React from 'react';
import {
  Linking,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  PhoneCall,
  HeartHandshake,
  Building2,
  LifeBuoy,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';
import { useNotification } from '../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(PhoneCall, { className: 'style' });
cssInterop(HeartHandshake, { className: 'style' });
cssInterop(Building2, { className: 'style' });
cssInterop(LifeBuoy, { className: 'style' });
cssInterop(ShieldAlert, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });

export default function CrisisSupport() {

  const { showNotification } = useNotification();

  const reduceMotion = useReducedMotion();

  const handleCallEmergency = (number = '112') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    Linking.openURL(`tel:${number}`).catch(() => { });

    showNotification({
      title: 'Calling Emergency Services',
      message: `Attempting to call ${number} for immediate assistance.`,
      type: 'alert',
    })

  };

  const handleBack = () => {
    Haptics.selectionAsync().catch(() => { });
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container for Web/Tablet preview + edge-to-edge phone layout */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col justify-between">

        {/* Navigation & Safety Header */}
        <View className="px-6 pt-4 pb-3 bg-[#FAF8F5] border-b border-[#EFEBE1]">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={20} color="#26362E" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5 bg-[#FCECE8] px-3.5 py-1 rounded-full border border-[#F2DDD5]">
              <LifeBuoy size={12} color="#A83A2E" />
              <Text className="text-[10px] font-bold text-[#A83A2E] uppercase tracking-wider">
                Immediate Support
              </Text>
            </View>

            <View className="w-10 h-10" />
          </View>

          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight leading-snug">
            You Don't Have to Carry This Alone
          </Text>
          <Text className="text-xs text-[#707E76] mt-1 font-normal leading-relaxed">
            Solace is a gentle reflection tool, not an emergency service. If you are feeling unsafe or overwhelmed, please reach for human care right now.
          </Text>
        </View>

        {/* Scrollable Action Guides */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 }}
          className="flex-1"
        >
          {/* 1. Direct Emergency Call Hero Card */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360)}
            className="mb-5"
          >
            <View className="bg-[#FAF4F2] border border-[#F2DDD5] p-5 rounded-[28px] shadow-sm">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-9 h-9 rounded-full bg-[#FCECE8] items-center justify-center">
                  <ShieldAlert size={18} color="#A83A2E" />
                </View>
                <View>
                  <Text className="text-base font-serif font-bold text-[#3B1F19]">
                    Emergency Services
                  </Text>
                  <Text className="text-[10px] uppercase font-bold text-[#965A4F] tracking-wider">
                    Immediate Response
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-[#7A4E46] leading-relaxed mb-4">
                In India, dial <Text className="font-bold text-[#3B1F19]">112</Text> for rapid police, fire, or ambulance assistance. If you are outside India, call your local national helpline right away.
              </Text>

              <TouchableOpacity
                onPress={() => handleCallEmergency('112')}
                activeOpacity={0.85}
                className="h-[50px] rounded-full bg-[#A83A2E] flex-row items-center justify-center gap-2.5 shadow-md shadow-[#A83A2E]/20"
                accessibilityRole="button"
                accessibilityLabel="Call 112 emergency services"
              >
                <PhoneCall size={16} color="#FAF8F5" />
                <Text className="text-xs font-bold text-[#FAF8F5] tracking-wide">
                  Call National Emergency (112)
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* 2. Structured Immediate Steps */}
          <View className="mb-5">
            <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E] mb-3 ml-1">
              Actions You Can Take Right Now
            </Text>

            <View className="gap-3">
              {/* Reach Out to Loved One */}
              <View className="bg-white border border-[#E9E4D8] p-4 rounded-3xl flex-row items-start gap-3.5 shadow-xs">
                <View className="w-10 h-10 rounded-2xl bg-[#E5EDE8] items-center justify-center mt-0.5">
                  <HeartHandshake size={18} color="#2D4638" />
                </View>
                <View className="flex-1 pr-1">
                  <Text className="text-sm font-serif font-bold text-[#1C2520] mb-0.5">
                    Connect With Someone You Trust
                  </Text>
                  <Text className="text-xs text-[#526158] leading-relaxed">
                    Call or text a family member, close friend, or neighbor. Ask them to sit with you or stay on the line until you feel anchored.
                  </Text>
                </View>
              </View>

              {/* Nearest Emergency Hospital */}
              <View className="bg-white border border-[#E9E4D8] p-4 rounded-3xl flex-row items-start gap-3.5 shadow-xs">
                <View className="w-10 h-10 rounded-2xl bg-[#F3EDE2] items-center justify-center mt-0.5">
                  <Building2 size={18} color="#695743" />
                </View>
                <View className="flex-1 pr-1">
                  <Text className="text-sm font-serif font-bold text-[#1C2520] mb-0.5">
                    Visit the Nearest Hospital
                  </Text>
                  <Text className="text-xs text-[#526158] leading-relaxed">
                    Walk into the nearest hospital emergency room. Medical teams are trained around the clock to keep you safe and provide immediate stabilizing care.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Verification Notice */}
          <View className="bg-[#FAF8F5] border border-[#E8E2D6] p-4 rounded-2xl flex-row items-center gap-2.5">
            <ShieldCheck size={14} color="#7A8A81" />
            <Text className="text-[11px] text-[#7A8A81] leading-relaxed flex-1">
              Additional verified 24/7 mental health helpline numbers (such as Tele-MANAS) will be published directly here once certified for release.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Return Action */}
        <View className="px-6 py-4 bg-[#FAF8F5] border-t border-[#EFEBE1]">
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