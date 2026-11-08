import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Wind,
  ClipboardList,
  Moon,
  Search,
  ChevronRight,
  BookOpen,
  Sparkles,
  Heart,
  Compass,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Wind, { className: 'style' });
cssInterop(ClipboardList, { className: 'style' });
cssInterop(Moon, { className: 'style' });
cssInterop(Search, { className: 'style' });
cssInterop(ChevronRight, { className: 'style' });
cssInterop(BookOpen, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Heart, { className: 'style' });
cssInterop(Compass, { className: 'style' });

// Screenshot Velora Inspired Muted Pastel Palette
const TILE_THEMES = [
  {
    bg: 'bg-[#E5EDE8]', // Pale Sage
    border: 'border-[#D4E1D8]',
    iconBg: 'bg-[#D6E3DA]',
    iconColor: '#385244',
  },
  {
    bg: 'bg-[#F3EDE2]', // Warm Sand / Oat
    border: 'border-[#E6DEC9]',
    iconBg: 'bg-[#E8DFC9]',
    iconColor: '#6B5738',
  },
  {
    bg: 'bg-[#EAEBF2]', // Soft Muted Blue / Lavender
    border: 'border-[#D8DAE6]',
    iconBg: 'bg-[#DCDFEA]',
    iconColor: '#454C68',
  },
  {
    bg: 'bg-[#FBECE6]', // Soft Terracotta Blush
    border: 'border-[#F2DDD5]',
    iconBg: 'bg-[#F3DDD3]',
    iconColor: '#7A4839',
  },
];

export default function Explore() {
  const router = useRouter();
  const resources = useRemote('/wellness/resources');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredResources = resources.data?.filter(
    (r) =>
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas for Web/Tablet preview + edge-to-edge phone layout */}
      <View className="w-full h-full md:max-w-[440px] md:h-[95vh] md:max-h-[890px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1">

        {/* Top Header Bar */}
        <View className="px-6 pt-4 pb-3 bg-[#FAF8F5] border-b border-[#EFEBE1]">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-2">
              <Compass size={20} color="#26362E" />
              <Text className="text-[11px] uppercase tracking-[3px] font-bold text-[#6D7D74]">
                Solace-AI
              </Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-[#EFECE3] items-center justify-center border border-[#E3DDD1]">
              <Sparkles size={14} color="#26362E" />
            </View>
          </View>

          <Text className="text-[28px] font-serif font-bold text-[#1C2520] tracking-tight">
            Explore Mind
          </Text>
          <Text className="text-xs text-[#707E76] mt-0.5">
            Gentle tools and mindful practices to steady your heart.
          </Text>

          {/* Search Bar */}
          <View
            className={`flex-row items-center h-[46px] px-3.5 rounded-2xl bg-white border mt-4 ${isSearchFocused ? 'border-[#26362E]' : 'border-[#E5DFD1]'
              } shadow-sm shadow-[#26362E]/5`}
          >
            <Search size={16} color={isSearchFocused ? '#26362E' : '#8A9790'} style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search practices, calm guides, articles..."
              placeholderTextColor="#9EA8A1"
              className="flex-1 text-xs text-[#202923]"
              style={{ outlineStyle: 'none', borderWidth: 0 }}
            />
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 40 }}
        >
          {/* Section 1: Quick Action Tiles (Like Screenshot Screen 2) */}
          <View className="mb-6">
            <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E] mb-3">
              Daily Modalities
            </Text>

            <View className="flex-row gap-3">
              {/* Breathe Tile */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => { });
                  router.push('/breathing');
                }}
                accessibilityRole="button"
                accessibilityLabel="Breathe"
                className="flex-1 bg-[#E5EDE8] border border-[#D5E1D9] p-3.5 rounded-3xl min-h-[110px] justify-between active:scale-[0.98]"
              >
                <View className="w-9 h-9 rounded-full bg-white/80 items-center justify-center">
                  <Wind size={18} color="#2D4638" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#203127]">Breathe</Text>
                  <Text className="text-[10px] text-[#4E6859] mt-0.5">5 min reset</Text>
                </View>
              </Pressable>

              {/* Self-Check Tile */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => { });
                  router.push('/assessments');
                }}
                accessibilityRole="button"
                accessibilityLabel="Self-check"
                className="flex-1 bg-[#F3EDE2] border border-[#E5DDCB] p-3.5 rounded-3xl min-h-[110px] justify-between active:scale-[0.98]"
              >
                <View className="w-9 h-9 rounded-full bg-white/80 items-center justify-center">
                  <ClipboardList size={18} color="#5F4B2E" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#3B2F1C]">Self-Check</Text>
                  <Text className="text-[10px] text-[#715E41] mt-0.5">Mood check-in</Text>
                </View>
              </Pressable>

              {/* Activities Tile */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => { });
                  router.push('/activities');
                }}
                accessibilityRole="button"
                accessibilityLabel="Activities"
                className="flex-1 bg-[#EAEBF2] border border-[#D5D8E4] p-3.5 rounded-3xl min-h-[110px] justify-between active:scale-[0.98]"
              >
                <View className="w-9 h-9 rounded-full bg-white/80 items-center justify-center">
                  <Moon size={18} color="#3E4562" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#242A41]">Sleep Calm</Text>
                  <Text className="text-[10px] text-[#555C7A] mt-0.5">Wind down</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Section 2: Featured Hero Banner Card (Like Screenshot Screen 2 & 3) */}
          <View className="mb-7">
            <View className="bg-[#26362E] rounded-3xl p-5 relative overflow-hidden shadow-lg shadow-[#26362E]/20">
              {/* Layered Organic Hills Background Deco */}
              <View className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-white/5" />
              <View className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-[#8FA89B]/15" />

              <View className="flex-row items-center gap-1.5 mb-2.5">
                <Heart size={13} color="#A3C2B1" />
                <Text className="text-[10px] uppercase tracking-[2px] font-semibold text-[#A3C2B1]">
                  Featured Pathway
                </Text>
              </View>

              <Text className="text-[21px] font-serif font-bold text-[#FAF8F5] leading-snug">
                Reduce Stress & Recenter
              </Text>
              <Text className="text-xs text-[#A9B8AF] mt-1.5 leading-relaxed pr-6">
                A gentle guided series to help you release tension and ground yourself in moments of chaos.
              </Text>

              <View className="flex-row items-center justify-between mt-5 pt-3 border-t border-white/10">
                <View className="flex-row items-center gap-3">
                  <Text className="text-[11px] text-[#D0DDD5]">7 Sessions</Text>
                  <Text className="text-[11px] text-[#7E9689]">•</Text>
                  <Text className="text-[11px] text-[#D0DDD5]">10 min each</Text>
                </View>

                <Pressable
                  onPress={() => router.push('/breathing')}
                  className="flex-row items-center gap-1.5 bg-[#FAF8F5] px-4 py-2 rounded-full active:opacity-90 shadow-sm"
                >
                  <Text className="text-xs font-bold text-[#26362E]">Begin</Text>
                  <ChevronRight size={14} color="#26362E" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Section 3: Curated Resources List */}
          <View>
            <View className="flex-row items-center justify-between mb-3.5">
              <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E]">
                Guided Resources
              </Text>
              <Text className="text-xs text-[#8A9790]">
                {filteredResources?.length || 0} practices
              </Text>
            </View>

            {resources.status === 'loading' && !resources.data ? (
              <View className="py-8">
                <LoadingState message="Curating gentle resources..." />
              </View>
            ) : null}

            {resources.status === 'error' && !resources.data ? (
              <ErrorState message={resources.error} onRetry={resources.reload} />
            ) : null}

            {filteredResources && filteredResources.length === 0 && searchQuery ? (
              <View className="py-8 items-center bg-[#F4F1EA] rounded-3xl border border-[#E7E2D5]">
                <BookOpen size={24} color="#8A9790" />
                <Text className="text-xs font-medium text-[#67776F] mt-2">
                  No resources matching "{searchQuery}"
                </Text>
              </View>
            ) : null}

            <View className="gap-3">
              {filteredResources?.map((r, i) => {
                const theme = TILE_THEMES[i % TILE_THEMES.length];
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => { });
                      router.push(`/resources/${r.id}`);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${r.title}: ${r.summary}`}
                    className={`p-4 rounded-3xl border ${theme.border} ${theme.bg} active:scale-[0.99] transition-all shadow-sm shadow-[#26362E]/5`}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-[10px] uppercase tracking-wider font-bold text-[#55655C]">
                            Practice #{i + 1}
                          </Text>
                        </View>
                        <Text className="text-base font-serif font-bold text-[#1C2520] mb-1">
                          {r.title}
                        </Text>
                        <Text className="text-xs text-[#526158] leading-relaxed" numberOfLines={2}>
                          {r.summary}
                        </Text>
                      </View>

                      <View className={`w-9 h-9 rounded-full ${theme.iconBg} items-center justify-center self-center`}>
                        <ChevronRight size={17} color={theme.iconColor} />
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}