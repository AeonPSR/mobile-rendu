import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export class HapticService {
  static async light() {
    try {
      if (isNative) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async medium() {
    try {
      if (isNative) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async heavy() {
    try {
      if (isNative) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async success() {
    try {
      if (isNative) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async warning() {
    try {
      if (isNative) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async error() {
    try {
      if (isNative) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async selection() {
    try {
      if (isNative) await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
}

// Export a singleton instance for convenience
export const hapticService = {
  impactLight: () => HapticService.light(),
  impactMedium: () => HapticService.medium(),
  impactHeavy: () => HapticService.heavy(),
  notificationSuccess: () => HapticService.success(),
  notificationWarning: () => HapticService.warning(),
  notificationError: () => HapticService.error(),
  selectionChanged: () => HapticService.selection(),
};

export default HapticService;