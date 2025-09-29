import { useRouter } from "expo-router";
import {
  Bell,
  BookOpen,
  ChevronRight,
  CircleHelp as HelpCircle,
  Lock,
  MessageCircle,
  Moon,
  Phone,
  Shield,
  Star,
  Sun,
  User,
  Volume2,
  Wifi
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Appearance,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Settings() {
  const router = useRouter();
  
  // State for toggle switches
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);

  // Dark theme colors
  const colors = {
    light: {
      background: "#F2F2F7",
      surface: "#FFFFFF",
      text: "#000000",
      textSecondary: "#8E8E93",
      border: "#F2F2F7",
      header: "#FFFFFF",
    },
    dark: {
      background: "#000000",
      surface: "#1C1C1E",
      text: "#FFFFFF",
      textSecondary: "#8E8E93",
      border: "#2C2C2E",
      header: "#1C1C1E",
    },
  };

  const currentColors = darkMode ? colors.dark : colors.light;

  // Apply dark mode to the app
  useEffect(() => {
    if (darkMode) {
      // Apply dark theme styles
      Appearance.setColorScheme('dark');
    } else {
      // Apply light theme styles
      Appearance.setColorScheme('light');
    }
  }, [darkMode]);

  const profileData = {
    icon: User,
    title: "Profile",
    subtitle: "Kavish Godage",
    email: "kavishgodage225@gmail.com",
    phone: "+94 77 123 4567",
    type: "profile",
    action: () => router.push("/profile-settings"),
  };

  const notificationSettings = [
    {
      icon: Bell,
      title: "Push Notifications",
      subtitle: "Receive alerts for new reports",
      type: "toggle",
      value: notificationsEnabled,
      onValueChange: setNotificationsEnabled,
    },
    {
      icon: Volume2,
      title: "Sound & Vibration",
      subtitle: "Play sounds for notifications",
      type: "toggle",
      value: soundEnabled,
      onValueChange: setSoundEnabled,
    },
  ];

  const privacySettings = [
    {
      icon: Lock,
      title: "Location Services",
      subtitle: "Allow app to access your location",
      type: "toggle",
      value: locationEnabled,
      onValueChange: setLocationEnabled,
    },
    {
      icon: Wifi,
      title: "Wi-Fi Only Upload",
      subtitle: "Upload media only on Wi-Fi",
      type: "toggle",
      value: wifiOnly,
      onValueChange: setWifiOnly,
    },
  ];

  const appearanceSettings = [
    {
      icon: darkMode ? Moon : Sun,
      title: "Dark Mode",
      subtitle: darkMode ? "Dark theme enabled" : "Light theme enabled",
      type: "toggle",
      value: darkMode,
      onValueChange: setDarkMode,
    },
  ];

  const supportSettings = [
    {
      icon: Phone,
      title: "Emergency Contacts",
      subtitle: "Manage emergency contacts",
      type: "normal",
      action: () => router.push("/emergency-contacts"),
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "Get help with the app",
      type: "normal",
      action: () => router.push("/help-support"),
    },
    {
      icon: MessageCircle,
      title: "Contact Us",
      subtitle: "Send feedback or report issues",
      type: "normal",
      action: () => router.push("/contact-us"),
    },
    {
      icon: BookOpen,
      title: "App Tutorial",
      subtitle: "Learn how to use the app",
      type: "normal",
      action: () => router.push("/app-tutorial"),
    },
  ];

  const legalSettings = [
    {
      icon: Shield,
      title: "Terms of Service",
      subtitle: "Read our terms and conditions",
      type: "normal",
      action: () => router.push("/terms-service"),
    },
    {
      icon: Lock,
      title: "Privacy Policy",
      subtitle: "How we protect your data",
      type: "normal",
      action: () => router.push("/privacy-policy"),
    },
    {
      icon: Star,
      title: "Rate App",
      subtitle: "Rate us on the App Store",
      type: "normal",
      action: () => router.push("/rate-app"),
    },
  ];

  const appInfo = {
    version: "1.0.0",
    build: "2024.01.15",
    lastUpdated: "January 15, 2024",
  };

  const renderSettingItem = (item, index, colors) => {
    if (item.type === "profile") {
      return (
        <TouchableOpacity key={index} style={styles.profileItem} onPress={item.action}>
          <View style={styles.profileIconContainer}>
            <item.icon size={20} color="#007AFF" />
          </View>
          <View style={styles.profileContent}>
            <Text style={[styles.profileName, { color: colors.text }]}>{item.subtitle}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>{item.phone}</Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      );
    }

    if (item.type === "toggle") {
      return (
        <View key={index} style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingIconContainer}>
            <item.icon size={20} color="#007AFF" />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: "#D1D1D6", true: "#32D74B" }}
            thumbColor="#FFFFFF"
          />
        </View>
      );
    }

    return (
      <TouchableOpacity 
        key={index} 
        style={[styles.settingItem, { borderBottomColor: colors.border }]}
        onPress={item.action}
      >
        <View style={styles.settingIconContainer}>
          <item.icon size={20} color="#007AFF" />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderSection = (title, items, colors) => (
    <View key={title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
        {items.map((item, index) => renderSettingItem(item, index, colors))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={[styles.header, { backgroundColor: currentColors.header }]}>
        <Text style={[styles.title, { color: currentColors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        {renderSection("Account", [profileData], currentColors)}

        {/* Notifications Section */}
        {renderSection("Notifications", notificationSettings, currentColors)}

        {/* Privacy & Security Section */}
        {renderSection("Privacy & Security", privacySettings, currentColors)}

        {/* Appearance Section */}
        {renderSection("Appearance", appearanceSettings, currentColors)}

        {/* Support Section */}
        {renderSection("Support", supportSettings, currentColors)}

        {/* Legal Section */}
        {renderSection("Legal", legalSettings, currentColors)}

        {/* App Information */}
        <View style={styles.appInfoSection}>
          <Text style={[styles.appInfoTitle, { color: currentColors.textSecondary }]}>App Information</Text>
          <View style={[styles.appInfoContainer, { backgroundColor: currentColors.surface }]}>
            <View style={styles.appInfoItem}>
              <Text style={[styles.appInfoLabel, { color: currentColors.textSecondary }]}>Version</Text>
              <Text style={[styles.appInfoValue, { color: currentColors.text }]}>{appInfo.version}</Text>
            </View>
            <View style={styles.appInfoItem}>
              <Text style={[styles.appInfoLabel, { color: currentColors.textSecondary }]}>Build</Text>
              <Text style={[styles.appInfoValue, { color: currentColors.text }]}>{appInfo.build}</Text>
            </View>
            <View style={styles.appInfoItem}>
              <Text style={[styles.appInfoLabel, { color: currentColors.textSecondary }]}>Last Updated</Text>
              <Text style={[styles.appInfoValue, { color: currentColors.text }]}>{appInfo.lastUpdated}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileContent: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: "#8E8E93",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  appInfoSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  appInfoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  appInfoContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  appInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
});
