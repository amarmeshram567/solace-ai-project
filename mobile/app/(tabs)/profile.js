import { useEffect, useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import {
  Camera,
  ChevronRight,
  Lock,
  Bell,
  HeartHandshake,
  ShieldCheck,
  LifeBuoy,
  Info,
  LogOut,
  Edit2,
  Check,
  X,
  Sparkles,
  Globe,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../../src/auth/AuthContext';
import { ApiError } from '../../src/services/api';
import { useNotification } from '../../src/notification/NotificationContext';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(Camera, { className: 'style' });
cssInterop(ChevronRight, { className: 'style' });
cssInterop(Lock, { className: 'style' });
cssInterop(Bell, { className: 'style' });
cssInterop(HeartHandshake, { className: 'style' });
cssInterop(ShieldCheck, { className: 'style' });
cssInterop(LifeBuoy, { className: 'style' });
cssInterop(Info, { className: 'style' });
cssInterop(LogOut, { className: 'style' });
cssInterop(Edit2, { className: 'style' });
cssInterop(Check, { className: 'style' });
cssInterop(X, { className: 'style' });
cssInterop(Sparkles, { className: 'style' });
cssInterop(Globe, { className: 'style' });

export default function Profile() {

  const { showNotification } = useNotification();

  const router = useRouter();
  const { user, updateProfile, loadAvatar, uploadAvatar, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const avatarUri = user?.avatarUrl ?? null;

  useEffect(() => {
    let active = true;
    loadAvatar().catch((err) => {
      if (active) {
        showNotification({
          title: 'Photo Could Not Load',
          message: err instanceof ApiError ? err.message : 'Could not load your profile photo.',
          type: 'alert',
        });
      }
    });
    return () => {
      active = false;
    };
  }, [loadAvatar, showNotification]);

  const save = async () => {
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setEditing(false);
      showNotification({
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
        type: 'success',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.');
      showNotification({
        title: 'Update Failed',
        message: err.message || 'Could not save your profile. Please try again.',
        type: 'alert',
      });
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    setAvatarSaving(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showNotification({
          title: 'Photo Access Needed',
          message: 'Allow photo library access to choose a profile photo.',
          type: 'alert',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        base64: true,
      });
      if (result.canceled || !result.assets[0]) return;

      await uploadAvatar(result.assets[0]);
      showNotification({
        title: 'Photo Updated',
        message: 'Your profile photo has been saved.',
        type: 'success',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    } catch (err) {
      showNotification({
        title: 'Photo Upload Failed',
        message: err instanceof ApiError ? err.message : 'Could not upload your photo. Please try again.',
        type: 'alert',
      });
    } finally {
      setAvatarSaving(false);
    }
  };

  const handlePickImage = () => {
    Haptics.selectionAsync().catch(() => { });
    if (Platform.OS === 'web') {
      pickImage();
      return;
    }

    Alert.alert('Profile Photo', 'Choose a photo to personalize your mindful solace.', [
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };


  const handleSignOut = () => {
    const performSignOut = async () => {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
        await signOut();

        showNotification({
          title: 'Signed Out',
          message: 'You have been signed out from this device.',
          type: 'mindful',
        });

      } catch (err) {
        console.error('Sign out error:', err);
        showNotification({
          title: 'Sign Out Failed',
          message: err.message || 'Could not sign out. Please try again.',
          type: 'alert',
        });
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to pause your session?')) {
        performSignOut();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to pause your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: performSignOut,
      },
    ]);
  };




  const initials = (user?.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      {/* Responsive Canvas for Web/Tablet preview + edge-to-edge phone layout */}
      <View className="w-full h-full md:max-w-[440px] md:h-[95vh] md:max-h-[890px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1">

        {/* Top Header */}
        <View className="px-6 pt-4 pb-3 bg-[#FAF8F5] border-b border-[#EFEBE1] flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-1.5 mb-1">
              <Sparkles size={14} color="#526F60" />
              <Text className="text-[10px] uppercase tracking-[3px] font-bold text-[#6D7D74]">
                Soloce-ai Space
              </Text>
            </View>
            <Text className="text-[26px] font-serif font-bold text-[#1C2520] tracking-tight">
              Your Profile
            </Text>
          </View>

          {/* Quick status badge */}
          <View className="bg-[#E5EDE8] border border-[#D1E0D6] px-3 py-1 rounded-full">
            <Text className="text-[10px] font-bold text-[#355243] uppercase tracking-wider">
              Active Member
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 48 }}
        >
          {/* 1. Hero Profile Card with Avatar */}
          <View className="bg-white rounded-3xl p-6 border border-[#E9E4D8] shadow-sm shadow-[#26362E]/5 items-center mb-6 relative">
            {/* Avatar with Camera Trigger */}
            <View className="relative mb-4">
              <View className="w-24 h-24 rounded-full bg-[#E5EDE8] border-2 border-[#D5E1D9] items-center justify-center overflow-hidden shadow-inner">
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Text className="text-3xl font-serif font-bold text-[#26362E] tracking-wider">
                    {initials}
                  </Text>
                )}
              </View>

              {/* Floating Camera Button */}
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={avatarSaving}
                activeOpacity={0.8}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#26362E] items-center justify-center border-2 border-[#FAF8F5] shadow-md shadow-black/15"
                accessibilityLabel="Change profile photo"
              >
                {avatarSaving ? (
                  <ActivityIndicator size="small" color="#FAF8F5" />
                ) : (
                  <Camera size={14} color="#FAF8F5" strokeWidth={2.2} />
                )}
              </TouchableOpacity>
            </View>

            {/* User Info / Edit Name Box */}
            {editing ? (
              <View className="w-full gap-3 mt-1">
                <View className="h-[48px] px-4 rounded-2xl bg-[#FAF8F5] border border-[#26362E] justify-center">
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#A9B3AC"
                    autoCapitalize="words"
                    className="text-sm text-[#1C2520] font-medium"
                    style={{ outlineStyle: 'none', borderWidth: 0 }}
                  />
                </View>
                {error ? (
                  <Text className="text-xs text-[#B3261E] ml-1">{error}</Text>
                ) : null}

                <View className="flex-row gap-2 mt-1">
                  <TouchableOpacity
                    onPress={save}
                    disabled={saving}
                    className="flex-1 h-[42px] rounded-full bg-[#26362E] flex-row items-center justify-center gap-1.5 shadow-sm"
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FAF8F5" />
                    ) : (
                      <>
                        <Check size={14} color="#FAF8F5" />
                        <Text className="text-xs font-semibold text-[#FAF8F5]">Save</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setEditing(false);
                      setName(user?.name ?? '');
                      setError('');
                    }}
                    className="h-[42px] px-5 rounded-full border border-[#DCD5C5] bg-[#F4EFE6]/50 items-center justify-center"
                  >
                    <Text className="text-xs font-medium text-[#64726A]">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[20px] font-serif font-bold text-[#1C2520]">
                    {user?.name || 'Mindful Soul'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setName(user?.name ?? '');
                      setEditing(true);
                    }}
                    className="w-7 h-7 rounded-full bg-[#F4F0E8] items-center justify-center"
                    accessibilityLabel="Edit name"
                  >
                    <Edit2 size={12} color="#45544B" />
                  </TouchableOpacity>
                </View>

                <Text className="text-xs text-[#7B8B82] mt-0.5 font-normal">
                  {user?.email || 'user@example.com'}
                </Text>

                {/* Timezone Pill */}
                {user?.timezone ? (
                  <View className="flex-row items-center gap-1.5 bg-[#F2EFE8] px-3 py-1 rounded-full mt-3 border border-[#E5DFD1]">
                    <Globe size={11} color="#65756C" />
                    <Text className="text-[11px] text-[#65756C] font-medium">
                      {user.timezone.replace(/_/g, ' ')}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* 2. Account & Support List Section */}
          <View className="mb-6">
            <Text className="text-xs uppercase tracking-wider font-semibold text-[#57665E] mb-3 ml-1">
              Account & Support
            </Text>

            <View className="bg-white rounded-3xl border border-[#E9E4D8] overflow-hidden shadow-sm shadow-[#26362E]/5">
              <ProfileMenuRow
                icon={Lock}
                label="Change Password"
                subtitle="Keep your mindful space secure"
                href="/settings/change-password"
              />
              <ProfileMenuRow
                icon={Bell}
                label="Reminders & Notifications"
                subtitle="Daily breathwork & focus alerts"
                href="/notifications/settings"
              />
              <ProfileMenuRow
                icon={HeartHandshake}
                label="Find a Therapist"
                subtitle="Licensed human professional support"
                href="/therapists"
              />
              <ProfileMenuRow
                icon={ShieldCheck}
                label="Privacy & Data Control"
                subtitle="Your journal logs & encrypted history"
                href="/settings/privacy"
              />
              <ProfileMenuRow
                icon={LifeBuoy}
                label="Crisis Support"
                subtitle="Immediate emergency helplines"
                href="/crisis-support"
                isDestructive
              />
              <ProfileMenuRow
                icon={Info}
                label="About & Guidance"
                subtitle="Learn more about Solace & version"
                href="/about"
                isLast
              />
            </View>
          </View>

          {/* 3. Log Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            className="h-[52px] rounded-full border border-[#E4D1CC] bg-[#FBF0ED] flex-row items-center justify-center gap-2 shadow-sm"
          >
            <LogOut size={16} color="#A83A2E" />
            <Text className="text-xs font-bold text-[#A83A2E] tracking-wide">
              Sign Out from Device
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );


  function ProfileMenuRow({ icon: Icon, label, subtitle, href, isDestructive, isLast }) {
    return (
      <Link href={href} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          className={`flex-row items-center justify-between p-4 active:bg-[#F9F7F2] ${!isLast ? 'border-b border-[#F0EBE0]' : ''
            }`}
        >
          <View className="flex-row items-center gap-3.5 flex-1 pr-3">
            <View
              className={`w-9 h-9 rounded-2xl items-center justify-center ${isDestructive ? 'bg-[#FBECE8]' : 'bg-[#EBF2EE]'
                }`}
            >
              <Icon size={17} color={isDestructive ? '#A83A2E' : '#2D4436'} />
            </View>

            <View className="flex-1">
              <Text
                className={`text-xs font-semibold ${isDestructive ? 'text-[#A83A2E]' : 'text-[#1C2520]'
                  }`}
              >
                {label}
              </Text>
              {subtitle ? (
                <Text className="text-[10px] text-[#86948B] mt-0.5 leading-snug">
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          <ChevronRight size={16} color="#A8B4AC" />
        </Pressable>
      </Link>
    );
  }

}