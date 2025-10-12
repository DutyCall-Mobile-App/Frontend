// app/register.jsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import API from './utils/api'; // <- if utils is inside /app. If not, change to ../utils/api
import { useTheme } from './context/ThemeContext';
import { getTheme } from './utils/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  };

  // validators
  const validateName = (t) => {
    setName(t);
    if (!t) setNameError('Name is required');
    else if (t.length < 2) setNameError('Name must be at least 2 characters');
    else if (t.length > 50) setNameError('Name must be less than 50 characters');
    else setNameError('');
  };

  const validateEmail = (t) => {
    setEmail(t);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!t) setEmailError('Email is required');
    else if (!re.test(t)) setEmailError('Please enter a valid email');
    else setEmailError('');
  };

  const validatePassword = (t) => {
    setPassword(t);
    if (!t) setPasswordError('Password is required');
    else if (t.length < 6) setPasswordError('Password must be at least 6 characters');
    else if (t.length > 100) setPasswordError('Password must be less than 100 characters');
    else setPasswordError('');
  };

  const isFormValid = () =>
    name && email && password && !nameError && !emailError && !passwordError;

  const handleRegister = async () => {
    if (!isFormValid()) {
      if (!name) setNameError('Name is required');
      if (!email) setEmailError('Email is required');
      if (!password) setPasswordError('Password is required');
      showToast('Please fix the errors', 'error');
      return;
    }

    setLoading(true);
    try {
      // expects: { data: { token, role } }
      const res = await API.post('/auth/register', { name, email, password, role });
      const { token, role: userRole } = res?.data?.data || {};

      if (!token || !userRole) {
        throw new Error('Invalid response from server');
      }

      await AsyncStorage.multiSet([
        ['token', token],
        ['role', userRole],
        ['onboardingCompleted', 'true'],
      ]);

      showToast('Registration successful!', 'success');

      setTimeout(() => {
        if (userRole === 'policeman') {
          // matches your auth gate & alias route
          router.replace('/police-dashboard');
        } else {
          // opens (tabs)/index
          router.replace('/');
        }
      }, 400);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: isDarkMode ? colors.surface : '#E3F2FD' }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1877F2" />
          </TouchableOpacity>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? colors.surface : '#E3F2FD' }]}>
            <Ionicons name="person-add" size={48} color="#1877F2" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign up to get started</Text>
        </View>

        {/* Form */}
        <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }, !!nameError && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={validateName}
                style={[styles.input, { color: colors.text }]}
                autoCapitalize="words"
              />
              {!!name && !nameError && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
            </View>
            {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }, !!emailError && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={validateEmail}
                style={[styles.input, { color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {!!email && !emailError && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />}
            </View>
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }, !!passwordError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={validatePassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: colors.text }]}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          </View>

          {/* Role */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Select Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }, role === 'user' && styles.roleCardActive]}
                onPress={() => setRole('user')}
              >
                <View style={[styles.roleIcon, { backgroundColor: colors.surface }, role === 'user' && styles.roleIconActive]}>
                  <Ionicons name="person" size={26} color={role === 'user' ? '#1877F2' : colors.textSecondary} />
                </View>
                <Text style={[styles.roleTitle, { color: colors.text }, role === 'user' && styles.roleTextActive]}>User</Text>
                <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>Regular user account</Text>
                {role === 'user' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }, role === 'policeman' && styles.roleCardActive]}
                onPress={() => setRole('policeman')}
              >
                <View style={[styles.roleIcon, { backgroundColor: colors.surface }, role === 'policeman' && styles.roleIconActive]}>
                  <Ionicons name="shield-checkmark" size={26} color={role === 'policeman' ? '#1877F2' : colors.textSecondary} />
                </View>
                <Text style={[styles.roleTitle, { color: colors.text }, role === 'policeman' && styles.roleTextActive]}>Policeman</Text>
                <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>Law enforcement</Text>
                {role === 'policeman' && (
                  <View className="selectedBadge" style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, (!isFormValid() || loading) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!isFormValid() || loading}
          >
            <Ionicons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Login</Text>
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
            size={22}
            color="#fff"
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30 },
  header: { alignItems: 'center', marginBottom: 25, position: 'relative' },
  backButton: { position: 'absolute', left: 10, top: 0, padding: 6, borderRadius: 10, backgroundColor: '#E3F2FD' },
  iconContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#666' },
  formContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.2, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#fafafa' },
  inputError: { borderColor: '#E53935', backgroundColor: '#FFEBEE' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#333' },
  errorText: { color: '#E53935', fontSize: 12, marginTop: 3, marginLeft: 4 },
  roleContainer: { flexDirection: 'row', gap: 12 },
  roleCard: { flex: 1, backgroundColor: '#fafafa', borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12, padding: 14, alignItems: 'center', position: 'relative' },
  roleCardActive: { backgroundColor: '#E3F2FD', borderColor: '#1877F2' },
  roleIcon: { width: 55, height: 55, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  roleIconActive: { backgroundColor: '#fff' },
  roleTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  roleTextActive: { color: '#1877F2' },
  roleDescription: { fontSize: 12, color: '#666', textAlign: 'center' },
  selectedBadge: { position: 'absolute', top: 6, right: 6 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1877F2', paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  buttonDisabled: { backgroundColor: '#ccc', opacity: 0.6 },
  buttonIcon: { marginRight: 6 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18, alignItems: 'center' },
  loginText: { fontSize: 14, color: '#666' },
  loginLink: { fontSize: 14, color: '#1877F2', fontWeight: '600' },
  toast: { position: 'absolute', top: 45, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 },
  toastSuccess: { backgroundColor: '#4CAF50' },
  toastError: { backgroundColor: '#E53935' },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8, flex: 1 },
});
