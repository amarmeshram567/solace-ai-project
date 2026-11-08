import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { Wind } from 'lucide-react-native';

const SMALL = 0.65;
const LARGE = 1.0;
const SIZE = 240;

export default function BreathingCircle({
  phase,
  remaining,
  running,
  reduceMotion: reduceMotionProp,
  label,
  duration = 4,
}) {
  const systemReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(reduceMotionProp || systemReducedMotion);

  // Multi-tier Concentric Auras
  const scale = useSharedValue(SMALL);
  const ringScaleMid = useSharedValue(0.78);
  const ringScaleOuter = useSharedValue(0.92);
  const auraOpacity = useSharedValue(0.45);
  const holdPulse = useSharedValue(1);

  useEffect(() => {
    if (phase === 'ready' || phase === 'completed') {
      cancelAnimation(scale);
      cancelAnimation(ringScaleMid);
      cancelAnimation(ringScaleOuter);
      cancelAnimation(holdPulse);
      cancelAnimation(auraOpacity);

      scale.value = withTiming(SMALL, { duration: 300 });
      ringScaleMid.value = withTiming(0.78, { duration: 300 });
      ringScaleOuter.value = withTiming(0.92, { duration: 300 });
      auraOpacity.value = withTiming(0.45, { duration: 300 });
      holdPulse.value = 1;
      return;
    }

    if (reduceMotion) {
      const isExpanded = phase === 'inhale' || phase === 'hold';
      scale.value = isExpanded ? LARGE : SMALL;
      ringScaleMid.value = isExpanded ? 1.15 : 0.78;
      ringScaleOuter.value = isExpanded ? 1.3 : 0.92;
      auraOpacity.value = isExpanded ? 0.85 : 0.45;
      return;
    }

    if (!running) {
      cancelAnimation(scale);
      cancelAnimation(ringScaleMid);
      cancelAnimation(ringScaleOuter);
      cancelAnimation(holdPulse);
      return;
    }

    const durationMs = Math.max(300, duration * 1000);

    if (phase === 'inhale') {
      cancelAnimation(holdPulse);
      holdPulse.value = 1;

      scale.value = withTiming(LARGE, {
        duration: durationMs,
        easing: Easing.bezier(0.35, 0, 0.25, 1),
      });
      ringScaleMid.value = withTiming(1.18, {
        duration: durationMs,
        easing: Easing.bezier(0.35, 0, 0.25, 1),
      });
      ringScaleOuter.value = withTiming(1.36, {
        duration: durationMs,
        easing: Easing.bezier(0.35, 0, 0.25, 1),
      });
      auraOpacity.value = withTiming(0.85, { duration: durationMs });
    } else if (phase === 'exhale') {
      cancelAnimation(holdPulse);
      holdPulse.value = 1;

      scale.value = withTiming(SMALL, {
        duration: durationMs,
        easing: Easing.bezier(0.35, 0, 0.25, 1),
      });
      ringScaleMid.value = withTiming(0.78, {
        duration: durationMs,
        easing: Easing.bezier(0.35, 0, 0.25, 1),
      });
      ringScaleOuter.value = withTiming(0.92, {
        duration: durationMs,
        easing: Easing.bezier(0.35, 0, 0.25, 1),
      });
      auraOpacity.value = withTiming(0.45, { duration: durationMs });
    } else if (phase === 'hold') {
      holdPulse.value = withRepeat(
        withSequence(
          withTiming(1.025, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [phase, running, reduceMotion, duration]);

  useEffect(() => {
    return () => {
      cancelAnimation(scale);
      cancelAnimation(ringScaleMid);
      cancelAnimation(ringScaleOuter);
      cancelAnimation(holdPulse);
      cancelAnimation(auraOpacity);
    };
  }, [scale, ringScaleMid, ringScaleOuter, holdPulse, auraOpacity]);

  const coreCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * holdPulse.value }],
  }));

  const midAuraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScaleMid.value * holdPulse.value }],
    opacity: auraOpacity.value * 0.75,
  }));

  const outerAuraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScaleOuter.value * holdPulse.value }],
    opacity: auraOpacity.value * 0.45,
  }));

  return (
    <View style={styles.container} accessibilityLiveRegion="polite" accessibilityLabel={label}>
      {/* 1. Outer Pale Sage Ripple */}
      <Animated.View style={[styles.outerRipple, outerAuraStyle]} />

      {/* 2. Mid Celadon Ripple */}
      <Animated.View style={[styles.midRipple, midAuraStyle]} />

      {/* 3. Center Deep Forest Green Core Orb */}
      <Animated.View style={[styles.coreOrb, coreCircleStyle]}>
        <View style={styles.orbInnerBorder} />
      </Animated.View>

      {/* 4. Center Number or Wind Icon */}
      <View style={styles.centerTextContainer} pointerEvents="none">
        {phase !== 'ready' && phase !== 'completed' && remaining > 0 ? (
          <Text style={styles.countdownText}>{remaining}</Text>
        ) : (
          <Wind size={34} color="#FAF8F5" strokeWidth={1.8} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE + 60,
    height: SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRipple: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: '#E5EDE8',
    borderWidth: 1,
    borderColor: '#D5E2DA',
  },
  midRipple: {
    position: 'absolute',
    width: 216,
    height: 216,
    borderRadius: 108,
    backgroundColor: '#C9DDD1',
    borderWidth: 1,
    borderColor: '#B8D1C2',
  },
  coreOrb: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#26362E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#26362E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  orbInnerBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  centerTextContainer: {
    position: 'absolute',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 42,
    fontFamily: 'serif',
    fontWeight: '700',
    color: '#FAF8F5',
    lineHeight: 46,
  },
});