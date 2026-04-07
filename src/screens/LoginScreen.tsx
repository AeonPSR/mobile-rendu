import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { Fonts, Spacing } from '@/utils/config';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { hapticService } from '@/services/hapticService';
import { validateEmail } from '@/utils/helpers';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, state } = useApp();
  const { colors } = useTheme();

  const handleSignIn = async () => {
    hapticService.impactLight();
    
    // Validation
    if (!email.trim() || !password.trim()) {
      hapticService.notificationError();
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      hapticService.notificationError();
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const success = await signIn(email.trim(), password);
    
    if (success) {
      hapticService.notificationSuccess();
    } else {
      hapticService.notificationError();
      if (state.error) {
        Alert.alert('Sign In Failed', state.error);
      }
    }
  };

  const navigateToRegister = () => {
    hapticService.selectionChanged();
    navigation.navigate('Register');
  };

  const handleGuestLogin = () => {
    hapticService.impactMedium();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' as never }],
    });
    // Simulate successful login without backend
    signIn('guest@example.com', 'password');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to your wallet</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                state.isLoading && styles.buttonDisabled
              ]}
              onPress={handleSignIn}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.surface }]}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: colors.textSecondary }]}
            onPress={handleGuestLogin}
          >
            <Text style={[styles.skipText, { color: colors.surface }]}>Continue as Guest</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    marginBottom: Spacing.sm,
  },
  input: {
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: Fonts.regular,
    borderWidth: 1,
  },
  button: {
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  linkText: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  skipButton: {
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  skipText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
});