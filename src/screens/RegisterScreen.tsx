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
import { validateEmail, validatePassword } from '@/utils/helpers';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { signUp, state } = useApp();
  const { colors } = useTheme();

  const handleSignUp = async () => {
    console.log('🔥 REGISTER: handleSignUp called');
    hapticService.impactLight();
    
    // Validation
    if (!email.trim() || !password.trim() || !firstName.trim()) {
      console.log('❌ REGISTER: Validation failed - missing fields');
      hapticService.notificationError();
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      console.log('❌ REGISTER: Email validation failed');
      hapticService.notificationError();
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log('❌ REGISTER: Password validation failed');
      hapticService.notificationError();
      Alert.alert('Password Error', passwordValidation.message);
      return;
    }

    console.log('✅ REGISTER: Validation passed, calling signUp...');
    const success = await signUp(email.trim(), password, firstName.trim(), lastName.trim());
    console.log('📝 REGISTER: signUp result:', success);
    
    if (success) {
      console.log('✅ REGISTER: Success!');
      hapticService.notificationSuccess();
    } else {
      console.log('❌ REGISTER: Failed:', state.error);
      hapticService.notificationError();
      if (state.error) {
        Alert.alert('Sign Up Failed', state.error);
      }
    }
  };

  const navigateToLogin = () => {
    hapticService.selectionChanged();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join International Wallet</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>First Name *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Password *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[styles.passwordHint, { color: colors.textSecondary }]}>
                Must be 8+ characters with uppercase, lowercase, and number
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                state.isLoading && styles.buttonDisabled
              ]}
              onPress={handleSignUp}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.surface }]}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: colors.textSecondary }]}
            onPress={() => {
              hapticService.impactMedium();
              // Skip authentication for now
              signUp('guest@example.com', 'password', 'Guest', 'User');
            }}
          >
            <Text style={[styles.skipText, { color: colors.surface }]}>Continue as Guest</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
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
  passwordHint: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: Spacing.sm,
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