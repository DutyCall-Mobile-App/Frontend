// app/onboard/screen1.jsx
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../utils/theme';

export default function OnboardScreen1() {
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1e3a5f' : '#E3F2FD' }]}>
        <Ionicons name="warning-outline" size={80} color="#1877F2" />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>Report Local Issues</Text>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Easily report any public safety or civic concerns directly to the authorities.
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
    backgroundColor: '#E3F2FD',
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

