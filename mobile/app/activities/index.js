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
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  Wind,
  Heart,
  Moon,
  Compass,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Clock, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(ChevronRight, { className: 'style' });
cssInterop(Flame, { className: 'style' });
cssInterop(Wind, { className: 'style' });
cssInterop(Heart, { className: 'style' });
cssInterop(Moon, { className: 'style' });
cssInterop(Compass, { className: 'style' });

const CATEGORY_META = {
  MINDFULNESS: {
    title: 'Mindfulness',
    subtitle: 'Cultivate stillness and breath in the present moment',
    Icon: Wind,
    bg: 'bg-[#E5EDE8]',
    border: 'border-[#D4E1D8]',
    iconBg: 'bg-[#D6E3DA]',
    iconColor: '#385244',
  },
  SELF_LOVE: {
    title: 'Self-love',
    subtitle: 'Nurture your self-compassion and inner dialogue',
    Icon: Heart,
    bg: 'bg-[#FBECE6]',
    border: 'border-[#F2DDD5]',
    iconBg: 'bg-[#F3DDD3]',
    iconColor: '#7A4839',
  },
  STRESS_RELIEF: {
    title: 'Stress Relief',
    subtitle: 'Gently dissolve tension and regulate your body',
    Icon: Compass,
    bg: 'bg-[#EAEBF2]',
    border: 'border-[#D8DAE6]',
    iconBg: 'bg-[#DCDFEA]',
    iconColor: '#454C68',
  },
  BETTER_SLEEP: {
    title: 'Better Sleep',
    subtitle: 'Restful practices to wind down for peaceful slumber',
    Icon: Moon,
    bg: 'bg-[#F3EDE2]',
    border: 'border-[#E6DEC9]',
    iconBg: 'bg-[#E8DFC9]',
    iconColor: '#6B5738',
  },
};

const DEFAULT_THEME = {
  title: 'All Activities',
  subtitle: 'Gentle, structured steps to restore calm balance',
  Icon: Sparkles,
  bg: 'bg-[#FAF8F5]',
  border: 'border-[#EAE5D8]',
  iconBg: 'bg-[#EFECE3]',
  iconColor: '#26362E',
};

export default function ActivityList() {
  const { category } = useLocalSearchParams();
  const reduceMotion = useReducedMotion();

  const catKey =
    typeof category === 'string' && CATEGORY_META[category] ? category : undefined;
  const currentCategory = catKey ? CATEGORY_META[catKey] : DEFAULT_THEME;
  const { Icon: HeaderIcon } = currentCategory;

  const list = useRemote(`/wellness/activities${catKey ? `?category=${catKey}` : ''}`);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Container for Mobile & Web Center Lock */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col">

        {/* Navigation & Category Header */}
        <View className="px-6 pt-4 pb-4 bg-[#FAF8F5] border-b border-[#EFEBE1]">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-white border border-[#E4DEC9] items-center justify-center shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ChevronLeft size={20} color="#26362E" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3 py-1 rounded-full border border-[#D1E0D6]">
              <HeaderIcon size={12} color="#355243" />
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                {currentCategory.title}
              </Text>
            </View>

            <View className="w-10 h-10 rounded-full bg-transparent" />
          </View>

          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
            {currentCategory.title}
          </Text>
          <Text className="text-xs text-[#707E76] mt-0.5 leading-relaxed">
            {currentCategory.subtitle}
          </Text>
        </View>

        {/* Scrollable List Body */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 }}
        >
          {list.status === 'loading' && !list.data ? (
            <View className="py-16">
              <LoadingState message="Curating gentle sessions…" />
            </View>
          ) : null}

          {list.status === 'error' && !list.data ? (
            <ErrorState message={list.error} onRetry={list.reload} />
          ) : null}

          {list.data?.length === 0 ? (
            <View className="py-12 items-center bg-[#F4F1EA] rounded-3xl border border-[#E7E2D5] px-6 mt-4">
              <View className="w-12 h-12 rounded-full bg-white items-center justify-center mb-3 shadow-sm">
                <Sparkles size={20} color="#7E8D84" />
              </View>
              <Text className="text-sm font-serif font-bold text-[#2A3730] mb-1">
                No activities yet
              </Text>
              <Text className="text-xs text-[#7E8D84] text-center leading-relaxed">
                Check back shortly for newly added practices in this space.
              </Text>
            </View>
          ) : null}

          <View className="gap-3.5">
            {list.data?.map((a, i) => {
              const meta = CATEGORY_META[a.category] || DEFAULT_THEME;
              const { Icon: CardIcon } = meta;

              return (
                <Animated.View
                  key={a.id}
                  entering={
                    reduceMotion
                      ? undefined
                      : FadeInDown.duration(380).delay(Math.min(i * 50, 300))
                  }
                >
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => { });
                      router.push(`/activities/${a.id}`);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${a.title}, about ${Math.round(a.durationSec / 60)} minutes`}
                    className={`p-5 rounded-[28px] border ${meta.border} ${meta.bg} active:scale-[0.99] transition-all shadow-sm shadow-[#26362E]/5`}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 pr-2">
                        {/* Meta Tags Row */}
                        <View className="flex-row items-center gap-2 mb-1.5">
                          <View
                            className={`w-6 h-6 rounded-full ${meta.iconBg} items-center justify-center`}
                          >
                            <CardIcon size={12} color={meta.iconColor} />
                          </View>
                          <Text className="text-[10px] uppercase tracking-wider font-bold text-[#55655C]">
                            {meta.title}
                          </Text>
                        </View>

                        <Text className="text-[17px] font-serif font-bold text-[#1C2520] mb-1 leading-snug">
                          {a.title}
                        </Text>
                        <Text
                          className="text-xs text-[#526158] leading-relaxed mb-3.5"
                          numberOfLines={2}
                        >
                          {a.description}
                        </Text>

                        {/* Duration & XP Badges */}
                        <View className="flex-row items-center gap-2.5">
                          <View className="flex-row items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-black/5">
                            <Clock size={11} color="#3C4B42" />
                            <Text className="text-[11px] font-medium text-[#3C4B42]">
                              ~{Math.round(a.durationSec / 60)} min
                            </Text>
                          </View>

                          <View className="flex-row items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full border border-black/5">
                            <Flame size={11} color="#9C6B32" />
                            <Text className="text-[11px] font-medium text-[#9C6B32]">
                              +{a.xpReward} XP
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Directional Arrow Pill */}
                      <View className="w-9 h-9 rounded-full bg-white/80 items-center justify-center self-center shadow-xs">
                        <ChevronRight size={17} color="#26362E" />
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}