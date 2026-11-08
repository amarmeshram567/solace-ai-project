import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'solace.onboardingComplete.v1';

// Onboarding completion is a device-level preference, so AsyncStorage is enough.
// Auth tokens are never stored here (they go to SecureStore).
export async function isOnboardingComplete() {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingComplete() {
  await AsyncStorage.setItem(KEY, 'true');
}
