// Fallback haptic service that doesn't require expo-haptics
// This prevents dependency conflicts while maintaining the same API
export class HapticService {
  static async light() {
    try {
      // Future: Add expo-haptics when dependencies are resolved
      // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('Haptic: Light impact');
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async medium() {
    try {
      // Future: await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Haptic: Medium impact');
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async heavy() {
    try {
      // Future: await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      console.log('Haptic: Heavy impact');
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async success() {
    try {
      // Future: await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('Haptic: Success notification');
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async warning() {
    try {
      // Future: await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      console.log('Haptic: Warning notification');
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async error() {
    try {
      // Future: await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log('Haptic: Error notification');
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  static async selection() {
    try {
      // Future: await Haptics.selectionAsync();
      console.log('Haptic: Selection changed');
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