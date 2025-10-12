import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    Shield,
    Trash2,
    Wifi,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function PrivacySettings() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  
  // Privacy states
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [crashReporting, setCrashReporting] = useState(true);

  const permissionSettings = [
    {
      icon: Wifi,
      title: "Location Services",
      subtitle: "Allow app to access your location",
      type: "toggle",
      value: locationEnabled,
      onValueChange: setLocationEnabled,
    },
    {
      icon: Eye,
      title: "Camera Access",
      subtitle: "Allow app to take photos and videos",
      type: "toggle",
      value: cameraEnabled,
      onValueChange: setCameraEnabled,
    },
    {
      icon: EyeOff,
      title: "Microphone Access",
      subtitle: "Allow app to record audio",
      type: "toggle",
      value: microphoneEnabled,
      onValueChange: setMicrophoneEnabled,
    },
  ];

  const dataSettings = [
    {
      icon: Wifi,
      title: "Wi-Fi Only Upload",
      subtitle: "Upload media only when connected to Wi-Fi",
      type: "toggle",
      value: wifiOnly,
      onValueChange: setWifiOnly,
    },
    {
      icon: Shield,
      title: "Data Collection",
      subtitle: "Allow collection of usage data to improve the app",
      type: "toggle",
      value: dataCollection,
      onValueChange: setDataCollection,
    },
    {
      icon: Shield,
      title: "Analytics",
      subtitle: "Help us understand how you use the app",
      type: "toggle",
      value: analyticsEnabled,
      onValueChange: setAnalyticsEnabled,
    },
    {
      icon: Shield,
      title: "Crash Reporting",
      subtitle: "Automatically send crash reports to help fix issues",
      type: "toggle",
      value: crashReporting,
      onValueChange: setCrashReporting,
    },
  ];

  const securityActions = [
    {
      icon: Lock,
      title: "Change Password",
      subtitle: "Update your account password",
      type: "action",
      action: () => Alert.alert("Change Password", "Password change feature coming soon!"),
    },
    {
      icon: Shield,
      title: "Two-Factor Authentication",
      subtitle: "Add extra security to your account",
      type: "action",
      action: () => Alert.alert("2FA", "Two-factor authentication setup coming soon!"),
    },
    {
      icon: Trash2,
      title: "Delete Account",
      subtitle: "Permanently delete your account and data",
      type: "action",
      action: () => {
        Alert.alert(
          "Delete Account",
          "Are you sure you want to delete your account? This action cannot be undone.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => Alert.alert("Account Deleted", "Your account has been deleted.") },
          ]
        );
      },
    },
  ];

  const renderSettingItem = (item, index) => {
    if (item.type === "toggle") {
      return (
        <View key={index} style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
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

    if (item.type === "action") {
      return (
        <TouchableOpacity key={index} style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={item.action}>
          <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
            <item.icon size={20} color="#007AFF" />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity key={index} style={[styles.settingItem, { borderBottomColor: colors.border }]}>
        <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
          <item.icon size={20} color="#007AFF" />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
        <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderSection = (title, items) => (
    <View key={title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
        {items.map((item, index) => renderSettingItem(item, index))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permissions */}
        {renderSection("Permissions", permissionSettings)}

        {/* Data & Privacy */}
        {renderSection("Data & Privacy", dataSettings)}

        {/* Security Actions */}
        {renderSection("Security", securityActions)}

        {/* Privacy Notice */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Privacy Notice</Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.privacyNotice}>
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                We take your privacy seriously. Your personal information is encrypted and stored securely. 
                We only collect data necessary to provide our services and improve your experience.
              </Text>
              <TouchableOpacity style={styles.privacyButton}>
                <Text style={styles.privacyButtonText}>Read Full Privacy Policy</Text>
              </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingTop: 20,
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
  chevron: {
    fontSize: 18,
    color: "#C7C7CC",
    fontWeight: "300",
  },
  privacyNotice: {
    padding: 16,
    alignItems: "center",
  },
  privacyText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  privacyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  privacyButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
