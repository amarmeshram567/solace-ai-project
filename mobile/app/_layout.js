import '../global.css';

import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/auth/AuthContext';
import { useNotificationLinks } from '../src/services/notifications';
import { NotificationProvider } from '../src/notification/NotificationContext';

// Splash is the entry point; it decides where the user navigates next.
export const unstable_settings = { initialRouteName: 'splash' };

export default function RootLayout() {
  useNotificationLinks();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#F3EFE8' }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationProvider>
            <StatusBar style="dark" backgroundColor="transparent" translucent />

            {/* Web Viewport Centered Frame Wrapper */}
            <View className="flex-1 w-full bg-[#F3EFE8] items-center justify-center">
              <View className="w-full h-full md:max-w-[430px] md:h-[96vh] md:max-h-[900px] md:rounded-[44px] md:overflow-hidden md:border md:border-[#E5DFD1] md:shadow-2xl md:shadow-[#26362E]/15 bg-[#FAF8F5] relative">
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#FAF8F5' },
                    animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
                    animationDuration: 260,
                    gestureEnabled: true,
                  }}
                >
                  {/* Entry Flows */}
                  <Stack.Screen name="splash" options={{ animation: 'fade' }} />
                  <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                  <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />

                  {/* Sub Flows & Runners */}
                  <Stack.Screen
                    name="breathing"
                    options={{ animation: 'fade_from_bottom' }}
                  />
                  <Stack.Screen
                    name="activities"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="assessments"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="mood"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="notifications"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="therapists"
                    options={{ animation: 'slide_from_right' }}
                  />
                  <Stack.Screen
                    name="crisis-support"
                    options={{ animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="settings"
                    options={{ animation: 'slide_from_right' }}
                  />
                </Stack>
              </View>
            </View>
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


