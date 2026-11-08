import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    useReducedMotion,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

cssInterop(Sparkles, { className: 'style' });
cssInterop(CheckCircle2, { className: 'style' });
cssInterop(AlertCircle, { className: 'style' });
cssInterop(X, { className: 'style' });

const ICON_MAP = {
    success: {
        icon: CheckCircle2,
        bgOuter: '#E5EDE8', // Pale Sage
        bgCore: '#26362E',  // Forest Green
        color: '#26362E',
    },
    mindful: {
        icon: Sparkles,
        bgOuter: '#F3EDE2', // Warm Sand
        bgCore: '#715E41',
        color: '#715E41',
    },
    alert: {
        icon: AlertCircle,
        bgOuter: '#FAF4F2', // Terracotta Blush
        bgCore: '#A83A2E',
        color: '#A83A2E',
    },
};

export default function NotificationBanner({
    visible,
    title,
    message,
    type = 'success',
    onDismiss,
    duration = 3400,
}) {
    const insets = useSafeAreaInsets();
    const reduceMotion = useReducedMotion();
    const translateY = useSharedValue(-140);
    const opacity = useSharedValue(0);

    const meta = ICON_MAP[type] ?? ICON_MAP.success;
    const Icon = meta.icon;

    useEffect(() => {
        if (visible) {
            Haptics.notificationAsync(
                type === 'alert'
                    ? Haptics.NotificationFeedbackType.Warning
                    : Haptics.NotificationFeedbackType.Success
            ).catch(() => { });

            // Slide down from top
            translateY.value = withSpring(0, {
                damping: 17,
                stiffness: 240,
                mass: 0.8,
            });
            opacity.value = withTiming(1, { duration: 200 });

            const timer = setTimeout(() => {
                dismiss();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            translateY.value = -140;
            opacity.value = 0;
        }
    }, [visible, duration]);

    const dismiss = () => {
        translateY.value = withTiming(-140, { duration: 240 }, () => {
            if (onDismiss) runOnJS(onDismiss)();
        });
        opacity.value = withTiming(0, { duration: 200 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    if (!visible) return null;

    // Top offset calculated from native status bar / dynamic notch
    const topInset = Math.max(insets.top + (Platform.OS === 'web' ? 14 : 8), 16);

    return (
        <View
            pointerEvents="box-none"
            style={[styles.fixedOverlay, { top: topInset }]}
        >
            <Animated.View
                style={[animatedStyle, styles.cardWrapper]}
            >
                <Pressable
                    onPress={dismiss}
                    accessibilityRole="alert"
                    accessibilityLabel={`${title}: ${message}`}
                    className="w-full bg-white border border-[#E9E4D8] rounded-[24px] p-3.5 flex-row items-center justify-between shadow-lg shadow-[#26362E]/15"
                >
                    {/* Left: Concentric Aura Icon + Copy */}
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                        <View
                            style={{ backgroundColor: meta.bgOuter }}
                            className="w-10 h-10 rounded-full items-center justify-center relative shadow-xs"
                        >
                            <View
                                style={{ backgroundColor: meta.bgCore }}
                                className="w-6 h-6 rounded-full items-center justify-center shadow-xs"
                            >
                                <Icon size={13} color="#FAF8F5" strokeWidth={2.4} />
                            </View>
                        </View>

                        <View className="flex-1">
                            <Text className="text-[10px] uppercase font-bold text-[#6D7D74] tracking-wider">
                                {title}
                            </Text>
                            <Text
                                numberOfLines={2}
                                className="text-xs text-[#1C2520] font-medium leading-snug mt-0.5"
                            >
                                {message}
                            </Text>
                        </View>
                    </View>

                    {/* Right: Close Action */}
                    <Pressable
                        onPress={dismiss}
                        hitSlop={8}
                        className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#EAE4D7] items-center justify-center"
                    >
                        <X size={12} color="#718077" strokeWidth={2.4} />
                    </Pressable>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    fixedOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 99999,
        elevation: 999,
    },
    cardWrapper: {
        width: '92%',
        maxWidth: 420,
    },
});