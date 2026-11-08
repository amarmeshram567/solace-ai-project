import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  BookOpen,
  Sparkles,
  Check,
  ShieldCheck,
  Bookmark,
  Share2,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(BookOpen, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Check, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(Bookmark, { className: 'style' });
cssInterop(Share2, { className: 'style' });

export default function ResourceDetail() {

  const { showNotification } = useNotification();

  const { id } = useLocalSearchParams();
  const resource = useRemote(`/wellness/resources/${id}`);
  const reduceMotion = useReducedMotion();
  const [ticked, setTicked] = useState({});

  if (resource.status === 'loading' && !resource.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <LoadingState message="Opening mindful practice…" />
      </SafeAreaView>
    );
  }

  if (resource.status === 'error' && !resource.data) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
        <ErrorState message={resource.error} onRetry={resource.reload} />
      </SafeAreaView>
    );
  }

  const toggle = (key) => {
    Haptics.selectionAsync().catch(() => { });
    setTicked((t) => ({ ...t, [key]: !t[key] }));

    showNotification({
      title: 'Resource Marked',
      message: 'This resource has been marked as completed.',
      type: 'success',
    });

  };

  const { title, summary, sections = [] } = resource.data || {};

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container for Mobile & Web Centering */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col">

        {/* Navigation Bar */}
        <View className="px-6 pt-4 pb-3 bg-[#FAF8F5] border-b border-[#EFEBE1] flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm"
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={20} color="#26362E" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D1E0D6]">
            <BookOpen size={12} color="#355243" />
            <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
              Wellness Guide
            </Text>
          </View>

          <View className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm">
            <Bookmark size={16} color="#26362E" />
          </View>
        </View>

        {/* Scrollable Resource Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 }}
          className="flex-1"
        >
          {/* Hero Title & Abstract Banner */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360)}
            className="mb-6"
          >
            <View className="bg-[#26362E] rounded-[30px] p-6 relative overflow-hidden shadow-lg shadow-[#26362E]/20">
              {/* Organic Decorative Curves */}
              <View className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-white/5" />
              <View className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-[#8FA89B]/15" />

              <View className="flex-row items-center gap-1.5 mb-2.5">
                <Sparkles size={13} color="#A3C2B1" />
                <Text className="text-[10px] uppercase tracking-[2.5px] font-bold text-[#A3C2B1]">
                  Mindful Reading
                </Text>
              </View>

              <Text className="text-[23px] font-serif font-bold text-[#FAF8F5] leading-snug mb-2">
                {title}
              </Text>
              <Text className="text-xs text-[#B2C2B8] leading-relaxed">
                {summary}
              </Text>
            </View>
          </Animated.View>

          {/* Sections Flow */}
          <View className="gap-4 mb-6">
            {sections.map((section, si) => (
              <Animated.View
                key={section.heading}
                entering={
                  reduceMotion
                    ? undefined
                    : FadeInDown.duration(360).delay(Math.min(si * 50, 250))
                }
              >
                <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="w-2 h-2 rounded-full bg-[#26362E]" />
                    <Text
                      accessibilityRole="header"
                      className="text-[18px] font-serif font-bold text-[#1C2520] leading-snug"
                    >
                      {section.heading}
                    </Text>
                  </View>

                  <Text className="text-xs text-[#526158] leading-relaxed font-normal mb-3">
                    {section.body}
                  </Text>

                  {/* Interactive Steps Checklist */}
                  {section.steps?.length ? (
                    <View className="pt-3 border-t border-[#F0EBE0] gap-2.5">
                      <Text className="text-[10px] uppercase tracking-wider font-bold text-[#7A8A81] mb-0.5">
                        Guided Practice Steps
                      </Text>

                      {section.steps.map((step, i) => {
                        const key = `${si}-${i}`;
                        const done = Boolean(ticked[key]);

                        return (
                          <Pressable
                            key={key}
                            onPress={() => toggle(key)}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: done }}
                            accessibilityLabel={step}
                            className={`flex-row items-start gap-3 p-3 rounded-2xl border transition-all ${done
                              ? 'bg-[#E5EDE8] border-[#D1E0D6]'
                              : 'bg-[#FAF8F5] border-[#E8E2D6] active:bg-[#F2EDE2]'
                              }`}
                          >
                            {/* Custom Circular Checkbox */}
                            <View
                              className={`w-5 h-5 rounded-full items-center justify-center border mt-0.5 ${done
                                ? 'bg-[#26362E] border-[#26362E]'
                                : 'border-[#9EA8A2] bg-white'
                                }`}
                            >
                              {done ? (
                                <Check size={11} color="#FAF8F5" strokeWidth={3} />
                              ) : null}
                            </View>

                            <Text
                              className={`text-xs flex-1 leading-relaxed ${done
                                ? 'text-[#68786F] line-through font-normal'
                                : 'text-[#202923] font-medium'
                                }`}
                            >
                              {step}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Gentle Disclaimer Banner */}
          <View className="p-4 rounded-3xl bg-[#F4F1EA] border border-[#E7E2D5] flex-row items-center gap-2.5">
            <ShieldCheck size={15} color="#7E8D84" />
            <Text className="text-[11px] text-[#7E8D84] leading-relaxed flex-1">
              Solace offers general wellness ideas. These reflections are not a substitute for clinical psychological care.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}