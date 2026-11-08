import { Platform } from 'react-native';
import { colors } from './colors';

export { colors };

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 22,
};

export const radius = {
  card: 22,
  button: 16,
  pill: 999,
  small: 14,
};

export const typography = {
  heading: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.35,
  },
  body: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.15,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
  },
};

export const shadow = {
  shadowColor: '#514C3D',
  shadowOpacity: 0.055,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 5 },
  elevation: 2,
};
