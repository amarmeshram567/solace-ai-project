import { Redirect, Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, MessageCircleHeart, LineChart, User } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useAuth } from '../../src/auth/AuthContext';
import { LoadingState } from '../../src/components/States';

cssInterop(Home, { className: 'style' });
cssInterop(Compass, { className: 'style' });
cssInterop(MessageCircleHeart, { className: 'style' });
cssInterop(LineChart, { className: 'style' });
cssInterop(User, { className: 'style' });

function TabIcon({ Icon, focused, title }) {
  return (
    <View className="items-center justify-center min-w-[56px] py-1">
      {/* Active Pill Indicator */}
      <View
        className={`w-11 h-7 rounded-full items-center justify-center transition-all ${focused ? 'bg-[#E5ECE7]' : 'bg-transparent'
          }`}
      >
        <Icon
          size={19}
          color={focused ? '#26362E' : '#9EA8A2'}
          strokeWidth={focused ? 2.4 : 1.7}
        />
      </View>

      {/* Label */}
      <Text
        numberOfLines={1}
        className={`text-[10px] mt-1 tracking-tight ${focused ? 'text-[#26362E] font-bold' : 'text-[#9EA8A2] font-medium'
          }`}
      >
        {title}
      </Text>

      {/* Active Dot */}
      {focused ? <View className="w-1 h-1 rounded-full bg-[#26362E] mt-0.5" /> : null}
    </View>
  );
}

export default function TabsLayout() {
  const { status, user } = useAuth();
  const insets = useSafeAreaInsets();

  if (status === 'loading') return <LoadingState />;
  if (status === 'signedOut') return <Redirect href="/(auth)/login" />;
  if (!user?.profileCompleted) return <Redirect href="/profile-setup" />;

  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, 14) : 10;
  const barHeight = Platform.OS === 'ios' ? 62 + bottomInset : 68;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        // React Navigation internally expects a style object for layout geometry
        tabBarStyle: {
          backgroundColor: '#FAF8F5',
          borderTopWidth: 1,
          borderTopColor: '#ECE7DD',
          height: barHeight,
          paddingTop: 6,
          paddingBottom: bottomInset,
          elevation: 0,
          shadowColor: '#26362E',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.03,
          shadowRadius: 14,
          maxWidth: Platform.OS === 'web' ? 420 : '100%',
          alignSelf: 'center',
          width: '100%',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Home} focused={focused} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Compass} focused={focused} title="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Zen Monk',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={MessageCircleHeart} focused={focused} title="Zen Monk" />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={LineChart} focused={focused} title="Progress" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={User} focused={focused} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}






