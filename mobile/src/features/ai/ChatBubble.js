import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bot, ShieldAlert, AlertCircle, Clock } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

cssInterop(Bot, { className: 'style' });
cssInterop(ShieldAlert, { className: 'style' });
cssInterop(AlertCircle, { className: 'style' });
cssInterop(Clock, { className: 'style' });

export default function ChatBubble({ message, onLongPress }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const isUser = message.role === 'USER';
  const isSafety = message.modelName === 'solace-safety-template';
  const isPending = Boolean(message.pending);
  const isFailed = Boolean(message.failed);

  const handlePressIn = () => {
    if (!reduceMotion && onLongPress) {
      scale.value = withSpring(0.975, { damping: 18, stiffness: 280, mass: 0.8 });
    }
  };

  const handlePressOut = () => {
    if (!reduceMotion && onLongPress) {
      scale.value = withSpring(1, { damping: 18, stiffness: 280, mass: 0.8 });
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
      onLongPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginVertical: 6,
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      {/* Zen Monk Avatar Anchor */}
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-[#E5EDE8] border border-[#D1E0D6] items-center justify-center mr-2 mt-1 shrink-0">
          <Bot size={15} color="#26362E" strokeWidth={2.2} />
        </View>
      )}

      {/* Touch Target + Animated Wrapper */}
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={360}
        accessibilityRole="text"
        accessibilityLabel={`${isUser ? 'You' : 'Zen Monk'} said: ${message.content}`}
        accessibilityHint={onLongPress ? 'Long press to delete or manage message' : undefined}
        style={{ maxWidth: '80%', flexShrink: 1 }}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              backgroundColor: isUser ? '#26362E' : isSafety ? '#FAF4F2' : '#FFFFFF',
              borderColor: isUser ? 'transparent' : isSafety ? '#F2DDD5' : '#E8E2D6',
              borderWidth: isUser ? 0 : 1,
              borderRadius: 20,
              borderBottomRightRadius: isUser ? 4 : 20,
              borderTopLeftRadius: !isUser ? 4 : 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
              opacity: isPending ? 0.65 : 1,
              shadowColor: '#26362E',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 3,
              elevation: 1,
            },
          ]}
        >
          {/* Safety Template Notice Header */}
          {isSafety && (
            <View className="flex-row items-center gap-1.5 mb-2 pb-1.5 border-b border-[#F2DDD5]">
              <View className="w-5 h-5 rounded-full bg-[#FCECE8] items-center justify-center">
                <ShieldAlert size={12} color="#A83A2E" />
              </View>
              <Text className="text-[10px] uppercase font-bold text-[#A83A2E] tracking-wider">
                Immediate Care Notice
              </Text>
            </View>
          )}

          {/* Message Content */}
          <Text
            style={{
              fontSize: 13,
              lineHeight: 21,
              color: isUser ? '#FAF8F5' : isSafety ? '#3B1F19' : '#1E2522',
            }}
          >
            {message.content}
          </Text>

          {/* Pending Delivery State */}
          {isPending && (
            <View className="flex-row items-center gap-1 mt-1.5 self-end">
              <Clock size={10} color={isUser ? '#C2D1C8' : '#8A9790'} />
              <Text
                className={`text-[10px] font-medium ${isUser ? 'text-[#C2D1C8]' : 'text-[#8A9790]'
                  }`}
              >
                Sending…
              </Text>
            </View>
          )}

          {/* Failed Delivery Notice */}
          {isFailed && (
            <View className="flex-row items-center gap-1 mt-2 pt-1 border-t border-[#F2DDD5]">
              <AlertCircle size={12} color="#A83A2E" />
              <Text className="text-[11px] font-medium text-[#A83A2E]">
                Not sent. Tap retry below.
              </Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}