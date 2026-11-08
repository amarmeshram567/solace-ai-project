import { CloudLightning, CloudRain, Gift, Leaf, Minus, Sun, Wind, Zap } from 'lucide-react-native';
import { colors } from '../theme';

// Mood options shown in the check-in. Keys must match the server's MOOD_KEYS.
export const MOOD_META = {
  HAPPY: { label: 'Happy', Icon: Sun, tint: colors.warmYellow },
  CALM: { label: 'Calm', Icon: Leaf, tint: colors.mint },
  GRATEFUL: { label: 'Grateful', Icon: Gift, tint: colors.coral },
  NEUTRAL: { label: 'Neutral', Icon: Minus, tint: colors.disabled },
  ANXIOUS: { label: 'Anxious', Icon: Wind, tint: colors.skyBlue },
  SAD: { label: 'Sad', Icon: CloudRain, tint: colors.lavender },
  STRESSED: { label: 'Stressed', Icon: Zap, tint: colors.coral },
  OVERWHELMED: { label: 'Overwhelmed', Icon: CloudLightning, tint: colors.lavender },
};

export const MOOD_KEYS = Object.keys(MOOD_META);
