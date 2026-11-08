import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Search,
  MapPin,
  Compass,
  CheckCircle2,
  ExternalLink,
  LifeBuoy,
  Globe,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

import { ErrorState, LoadingState } from '../../src/components/States';
import { useRemote } from '../../src/hooks/useRemote';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ChevronLeft, { className: 'style' });
cssInterop(Search, { className: 'style' });
cssInterop(MapPin, { className: 'style' });
cssInterop(Compass, { className: 'style' });
cssInterop(CheckCircle2, { className: 'style' });
cssInterop(ExternalLink, { className: 'style' });
cssInterop(LifeBuoy, { className: 'style' });
cssInterop(Globe, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(AlertTriangle, { className: 'style' });
cssInterop(LocateFixed, { className: 'style' });

function useDebounced(value, ms = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function Therapists() {

  const { showNotification } = useNotification();

  const reduceMotion = useReducedMotion();

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateNote, setLocateNote] = useState('');

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCityFocused, setIsCityFocused] = useState(false);

  const dSearch = useDebounced(search.trim());
  const dCity = useDebounced(city.trim());

  const params = new URLSearchParams({ limit: '30' });
  if (dSearch) params.set('q', dSearch);
  if (dCity) params.set('city', dCity);
  if (verifiedOnly) params.set('verified', 'true');

  const { status, data, error, reload } = useRemote(`/therapists?${params.toString()}`);

  const useMyCity = async () => {
    setLocateNote('');
    setLocating(true);
    Haptics.selectionAsync().catch(() => { });
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocateNote('Location permission was declined. You can type your city instead.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const name = place?.city ?? place?.subregion ?? place?.region ?? '';
      if (!name) {
        setLocateNote('Could not identify your city. Please enter it manually.');
        return;
      }
      setCity(name);
      setLocateNote(`Filtering providers in ${name}. Your coordinates are never stored.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

      showNotification({
        title: 'Location Detected',
        message: `Your city has been detected as ${name}.`,
        type: 'success',
      })

    } catch {
      setLocateNote('Location service unavailable right now. Please type your city.');
      showNotification({
        title: 'Location Failed',
        message: 'Could not detect your city. Please enter it manually.',
        type: 'alert',
      })
    } finally {
      setLocating(false);
    }
  };

  const contact = async (url) => {
    if (!url?.startsWith('https://')) return;
    Haptics.selectionAsync().catch(() => { });
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Could not open link', 'Please copy the address and open in your browser.');

      showNotification({
        title: 'Opening Link',
        message: 'The practitioner website is being opened in your browser.',
        type: 'success',
      })

    } catch {
      Alert.alert('Could not open link', 'Please try again in a moment.');
      showNotification({
        title: 'Opening Failed',
        message: 'Could not open the practitioner website.',
        type: 'alert',
      });
    }
  };

  const items = data?.items ?? [];
  const hasSample = items.some((t) => t.isSample);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas Viewport */}
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 flex-col">

        {/* Navigation & Header */}
        <View className="px-6 pt-4 pb-3 bg-[#FAF8F5] border-b border-[#EFEBE1]">
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

            <View className="flex-row items-center gap-1.5 bg-[#E5EDE8] px-3.5 py-1 rounded-full border border-[#D1E0D6]">
              <Compass size={12} color="#355243" />
              <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
                Support Network
              </Text>
            </View>

            <View className="w-10 h-10" />
          </View>

          <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
            Find a Therapist
          </Text>
          <Text className="text-xs text-[#707E76] mt-0.5 leading-relaxed font-normal">
            Connect with certified care professionals when you need human guidance.
          </Text>
        </View>

        {/* Scrollable Provider Directory */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 48 }}
          className="flex-1"
        >
          {/* 1. Crisis Warning & Safety Banner */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360)}
            className="mb-5"
          >
            <View className="bg-[#FAF4F2] border border-[#F2DDD5] p-5 rounded-[28px] shadow-xs">
              <View className="flex-row items-center gap-2 mb-1.5">
                <LifeBuoy size={16} color="#A83A2E" />
                <Text className="text-[10px] uppercase font-bold text-[#A83A2E] tracking-wider">
                  Immediate Care Notice
                </Text>
              </View>

              <Text className="text-xs text-[#7A4E46] leading-relaxed mb-3">
                Therapists provide scheduled support. If you are experiencing acute distress or danger right now, access emergency hotlines immediately.
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/crisis-support')}
                activeOpacity={0.85}
                className="h-[42px] px-4 rounded-full bg-[#A83A2E] flex-row items-center justify-center gap-2 self-start"
              >
                <Text className="text-xs font-bold text-[#FAF8F5]">Open Crisis Support</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {hasSample ? (
            <View className="bg-[#F3EDE2] border border-[#E6DECF] p-4 rounded-2xl flex-row items-center gap-2.5 mb-5">
              <AlertTriangle size={15} color="#9C6B32" />
              <Text className="text-[11px] text-[#695743] flex-1 leading-relaxed">
                Some listings below are sample demonstration entries for testing and not active clinical practices.
              </Text>
            </View>
          ) : null}

          {/* 2. Search & Location Filters Card */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.duration(360).delay(60)}
            className="mb-6"
          >
            <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
              <View className="flex-row items-center gap-2 mb-3">
                <Search size={15} color="#26362E" />
                <Text className="text-xs font-bold text-[#26362E] uppercase tracking-wider">
                  Search Directory
                </Text>
              </View>

              {/* Name or Specialty Field */}
              <View className="mb-3.5">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Specialty or Name
                </Text>
                <View
                  className={`flex-row items-center h-[48px] px-3.5 rounded-2xl bg-[#FAF8F5] border ${isSearchFocused ? 'border-[#26362E] bg-white' : 'border-[#E6E1D5]'
                    }`}
                >
                  <Search size={15} color="#8A9790" style={{ marginRight: 8 }} />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="e.g. CBT, Anxiety, Trauma, Hindi"
                    placeholderTextColor="#A9B3AC"
                    autoCapitalize="words"
                    maxLength={80}
                    className="flex-1 text-xs text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0 }}
                  />
                </View>
              </View>

              {/* City Field */}
              <View className="mb-3">
                <Text className="text-[11px] uppercase tracking-wider font-semibold text-[#54625A] mb-1.5 ml-1">
                  Location / City
                </Text>
                <View
                  className={`flex-row items-center h-[48px] px-3.5 rounded-2xl bg-[#FAF8F5] border ${isCityFocused ? 'border-[#26362E] bg-white' : 'border-[#E6E1D5]'
                    }`}
                >
                  <MapPin size={15} color="#8A9790" style={{ marginRight: 8 }} />
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    onFocus={() => setIsCityFocused(true)}
                    onBlur={() => setIsCityFocused(false)}
                    placeholder="e.g. Pune, Mumbai, Delhi"
                    placeholderTextColor="#A9B3AC"
                    autoCapitalize="words"
                    maxLength={80}
                    className="flex-1 text-xs text-[#1E2522]"
                    style={{ outlineStyle: 'none', borderWidth: 0 }}
                  />
                </View>
              </View>

              {/* Geolocation Button */}
              <TouchableOpacity
                onPress={useMyCity}
                disabled={locating}
                activeOpacity={0.8}
                className="h-[44px] rounded-full border border-[#D5CEC0] bg-[#FAF8F5] flex-row items-center justify-center gap-2 mb-3"
              >
                {locating ? (
                  <ActivityIndicator size="small" color="#26362E" />
                ) : (
                  <>
                    <LocateFixed size={14} color="#26362E" />
                    <Text className="text-xs font-semibold text-[#26362E]">Detect My City</Text>
                  </>
                )}
              </TouchableOpacity>

              {locateNote ? (
                <Text className="text-[11px] text-[#697A71] text-center mb-3 px-1 leading-snug">
                  {locateNote}
                </Text>
              ) : null}

              {/* Verified Only Switch Pill */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => { });
                  setVerifiedOnly((v) => !v);
                }}
                className={`flex-row items-center justify-between p-3 rounded-2xl border transition-all ${verifiedOnly
                  ? 'bg-[#E5EDE8] border-[#26362E]'
                  : 'bg-[#FAF8F5] border-[#E8E2D6]'
                  }`}
              >
                <View className="flex-row items-center gap-2">
                  <CheckCircle2
                    size={16}
                    color={verifiedOnly ? '#26362E' : '#8A9790'}
                  />
                  <Text
                    className={`text-xs ${verifiedOnly ? 'font-bold text-[#26362E]' : 'font-medium text-[#506056]'
                      }`}
                  >
                    Verified Providers Only
                  </Text>
                </View>

                <View
                  className={`w-5 h-5 rounded-full items-center justify-center border ${verifiedOnly ? 'bg-[#26362E] border-[#26362E]' : 'border-[#BDC7C0]'
                    }`}
                >
                  {verifiedOnly ? <CheckCircle2 size={12} color="#FAF8F5" /> : null}
                </View>
              </Pressable>
            </View>
          </Animated.View>

          {/* 3. Provider Listings Stream */}
          <View>
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E]">
                Available Practitioners
              </Text>
              {data && items.length > 0 ? (
                <Text className="text-xs text-[#8A9790] font-medium">
                  {data.total} listings
                </Text>
              ) : null}
            </View>

            {status === 'loading' && !data ? (
              <View className="py-12">
                <LoadingState message="Scanning certified practitioners…" />
              </View>
            ) : null}

            {status === 'error' && !data ? (
              <ErrorState message={error} onRetry={reload} />
            ) : null}

            {data && items.length === 0 ? (
              <View className="py-12 items-center bg-white rounded-3xl border border-[#E9E4D8] px-6">
                <Compass size={24} color="#8A9790" />
                <Text className="text-sm font-serif font-bold text-[#2A3730] mt-2 mb-1">
                  No practitioners found
                </Text>
                <Text className="text-xs text-[#7E8D84] text-center leading-relaxed">
                  Try widening your specialty search criteria or clearing city constraints.
                </Text>
              </View>
            ) : null}

            <View className="gap-3.5">
              {items.map((t, index) => {
                const canContact = t.contactUrl?.startsWith('https://');

                return (
                  <Animated.View
                    key={t.id}
                    entering={
                      reduceMotion
                        ? undefined
                        : FadeInDown.duration(360).delay(Math.min(index * 40, 250))
                    }
                  >
                    <View className="bg-white border border-[#E9E4D8] p-5 rounded-[28px] shadow-sm shadow-[#26362E]/5">
                      <View className="flex-row items-center justify-between mb-2">
                        {/* Status Badge */}
                        <View
                          className={`flex-row items-center gap-1 px-2.5 py-0.5 rounded-full ${t.isVerified ? 'bg-[#E5EDE8]' : 'bg-[#F2EFE8]'
                            }`}
                        >
                          {t.isVerified ? (
                            <CheckCircle2 size={11} color="#355243" />
                          ) : null}
                          <Text
                            className={`text-[10px] font-bold uppercase tracking-wider ${t.isVerified ? 'text-[#355243]' : 'text-[#7D8C84]'
                              }`}
                          >
                            {t.isVerified ? 'Verified' : 'Sample Listing'}
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1 bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#ECE5D8]">
                          <MapPin size={10} color="#607066" />
                          <Text className="text-[10px] font-semibold text-[#607066]">
                            {t.city}, {t.region}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-[18px] font-serif font-bold text-[#1C2520] mb-1">
                        {t.name}
                      </Text>

                      <Text className="text-xs font-semibold text-[#3D5246] mb-2">
                        {t.specialization}
                      </Text>

                      {/* Linguistic & Consultation Badges */}
                      <View className="gap-1.5 mb-4">
                        <View className="flex-row items-center gap-1.5">
                          <Globe size={11} color="#7E8D84" />
                          <Text className="text-[11px] text-[#637269]">
                            Languages: {t.languages?.join(', ') || 'Not specified'}
                          </Text>
                        </View>

                        {t.consultation ? (
                          <Text className="text-[11px] text-[#7E8D84] leading-snug">
                            {t.consultation}
                          </Text>
                        ) : null}
                      </View>

                      {/* Contact External Action */}
                      {canContact ? (
                        <TouchableOpacity
                          onPress={() => contact(t.contactUrl)}
                          activeOpacity={0.85}
                          className="h-[46px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-2 shadow-sm"
                        >
                          <Text className="text-xs font-semibold text-[#FAF8F5]">
                            Visit Practitioner Website
                          </Text>
                          <ExternalLink size={13} color="#FAF8F5" />
                        </TouchableOpacity>
                      ) : (
                        <View className="h-[44px] rounded-full bg-[#F4F1EA] items-center justify-center">
                          <Text className="text-xs text-[#8A9790]">
                            No direct website provided
                          </Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}