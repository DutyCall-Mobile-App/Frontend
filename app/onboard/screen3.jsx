// app/onboard/screen3.jsx
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';

export default function OnboardScreen3() {
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#5f4a1e' : '#FFF3E0' }]}>
        <Ionicons name="sync-outline" size={80} color="#FF9800" />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>Track Report Status</Text>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Stay updated on every step of your report and receive real-time notifications.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

