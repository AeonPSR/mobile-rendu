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
import { Colors, Fonts, Spacing } from '@/utils/config';
import { useApp } from '@/context/AppContext';
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

  const handleSignUp = async () => {
    // Validation
    if (!email.trim() || !password.trim() || !firstName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Password Error', passwordValidation.message);
      return;
    }

    const success = await signUp(email.trim(), password, firstName.trim(), lastName.trim());
    
    if (!success && state.error) {
      Alert.alert('Sign Up Failed', state.error);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join International Wallet</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={Colors.placeholder}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={Colors.placeholder}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor={Colors.placeholder}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.passwordHint}>
                Must be 8+ characters with uppercase, lowercase, and number
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, state.isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              // Skip authentication for now
              signUp('guest@example.com', 'password', 'Guest', 'User');
            }}
          >
            <Text style={styles.skipText}>Continue as Guest</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.linkText}>Sign In</Text>
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
    backgroundColor: Colors.background,
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
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
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
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordHint: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  button: {
    backgroundColor: Colors.primary,
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
    color: Colors.surface,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    color: Colors.primary,
  },
  skipButton: {
    backgroundColor: Colors.textSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  skipText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.surface,
  },
});