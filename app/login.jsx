// app/login.jsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import API from './utils/api';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  };

  // Basic validation
  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) setEmailError('Email is required');
    else if (!emailRegex.test(text)) setEmailError('Please enter a valid email');
    else setEmailError('');
  };

  const validatePassword = (text) => {
    setPassword(text);
    if (!text) setPasswordError('Password is required');
    else if (text.length < 6) setPasswordError('Password must be at least 6 characters');
    else setPasswordError('');
  };

  const isFormValid = useMemo(
    () => email && password && !emailError && !passwordError,
    [email, password, emailError, passwordError]
  );

  // If already logged in, route immediately
  useEffect(() => {
    (async () => {
      try {
        const [token, role] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('role'),
        ]);
        if (token && role) {
          // Go where they belong
          if (role === 'policeman') {
            router.replace('/police-dashboard');
          } else {
            router.replace('/'); // Home tab in (tabs)
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [router]);

  const handleLogin = async () => {
    // Guard
    if (!email) {
      setEmailError('Email is required');
      showToast('Please enter your email', 'error');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      showToast('Please enter your password', 'error');
      return;
    }
    if (!isFormValid) {
      showToast('Please fix the errors', 'error');
      return;
    }

    setLoading(true);
    try {
      // Your backend should return { data: { token, role } }
      const res = await API.post('/auth/login', { email, password });
      const { token, role } = res.data?.data || {};

      if (!token || !role) {
        throw new Error('Invalid response from server');
      }

      await AsyncStorage.multiSet([
        ['token', token],
        ['role', role],
      ]);

      showToast('Login successful!', 'success');

      // Route by role
      setTimeout(() => {
        if (role === 'policeman') {
          router.replace('/police-dashboard');
        } else {
          router.replace('/'); // points to (tabs)/index
        }
      }, 400);
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Login failed';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={50} color="#1877F2" />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, emailError && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={validateEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {!!email && !emailError && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              )}
            </View>
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={validatePassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          </View>

          {/* Single Login button (role handled by server response) */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, (!isFormValid || loading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          {/* Optional: Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            {/* If you have a Register route, change to router.push('/register') */}
           <TouchableOpacity onPress={() => router.push('/register')}>
  <Text style={styles.registerLink}>Register</Text>
</TouchableOpacity>

          </View>
        </View>
      </ScrollView>

      {/* Toast */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            toastType === 'success' ? styles.toastSuccess : styles.toastError,
            { opacity: toastOpacity },
          ]}
        >
          <Ionicons
            name={toastType === 'success' ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color="#fff"
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  formContainer: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#ddd',
    borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#f9f9f9',
  },
  inputError: { borderColor: '#E53935', backgroundColor: '#FFEBEE' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333' },
  errorText: { color: '#E53935', fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, marginBottom: 12,
  },
  primaryButton: { backgroundColor: '#1877F2' },
  buttonDisabled: { backgroundColor: '#ccc', opacity: 0.6 },
  buttonIcon: { marginRight: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, alignItems: 'center' },
  registerText: { fontSize: 14, color: '#666' },
  registerLink: { fontSize: 14, color: '#1877F2', fontWeight: '600' },
  toast: {
    position: 'absolute', top: 50, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    paddingHorizontal: 16, borderRadius: 12, elevation: 6, shadowColor: '#000',
    shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  toastSuccess: { backgroundColor: '#4CAF50' },
  toastError: { backgroundColor: '#E53935' },
  toastText: { color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 10, flex: 1 },
});
