import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { cssInterop } from 'nativewind';

import ComingSoon from '../src/components/ComingSoon';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ArrowRight, { className: 'style' });

export default function NotFoundScreen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-[#F9F7F2] items-center justify-center">
      <View className="w-full h-full md:max-w-[430px] md:h-[94vh] md:max-h-[880px] md:rounded-[40px] md:overflow-hidden md:border md:border-[#E8E4DA] md:shadow-2xl md:shadow-[#26362E]/10 bg-[#FAF8F5] flex-1 justify-between p-6">
        <View className="h-10" />

        <ComingSoon
          feature="Page not found"
          phase="a valid destination"
          statusText="Route not found"
          description="We couldn't find the page you requested. It may have moved, or the address may be incorrect."
          footerText="Solace Space"
          accessibilityLabel="Page not found"
        />

        <View className="pt-4">
          <TouchableOpacity
            onPress={() => router.replace('/splash')}
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
