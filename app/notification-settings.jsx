import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Bell,
    BellOff,
    Calendar,
    Clock,
    Mail,
    MessageSquare,
    Phone,
    Volume2,
} from "lucide-react-native";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function NotificationSettings() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  
  // Notification states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [reportUpdates, setReportUpdates] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const notificationTypes = [
    {
      icon: Bell,
      title: "Push Notifications",
      subtitle: "Receive notifications on your device",
      type: "toggle",
      value: pushNotifications,
      onValueChange: setPushNotifications,
    },
    {
      icon: Mail,
      title: "Email Notifications",
      subtitle: "Get updates via email",
      type: "toggle",
      value: emailNotifications,
      onValueChange: setEmailNotifications,
    },
    {
      icon: MessageSquare,
      title: "SMS Notifications",
      subtitle: "Receive text message alerts",
      type: "toggle",
      value: smsNotifications,
      onValueChange: setSmsNotifications,
    },
  ];

  const alertSettings = [
    {
      icon: Volume2,
      title: "Sound",
      subtitle: "Play sound for notifications",
      type: "toggle",
      value: soundEnabled,
      onValueChange: setSoundEnabled,
    },
    {
      icon: Phone,
      title: "Vibration",
      subtitle: "Vibrate for notifications",
      type: "toggle",
      value: vibrationEnabled,
      onValueChange: setVibrationEnabled,
    },
  ];

  const notificationCategories = [
    {
      icon: Bell,
      title: "Report Updates",
      subtitle: "Updates on your submitted reports",
      type: "toggle",
      value: reportUpdates,
      onValueChange: setReportUpdates,
    },
    {
      icon: BellOff,
      title: "Emergency Alerts",
      subtitle: "Critical safety and emergency notifications",
      type: "toggle",
      value: emergencyAlerts,
      onValueChange: setEmergencyAlerts,
    },
    {
      icon: Calendar,
      title: "System Updates",
      subtitle: "App updates and maintenance notifications",
      type: "toggle",
      value: systemUpdates,
      onValueChange: setSystemUpdates,
    },
    {
      icon: Mail,
      title: "Marketing Emails",
      subtitle: "Newsletters and promotional content",
      type: "toggle",
      value: marketingEmails,
      onValueChange: setMarketingEmails,
    },
  ];

  const quietHours = [
    {
      icon: Clock,
      title: "Quiet Hours",
      subtitle: "10:00 PM - 7:00 AM",
      type: "normal",
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
        <Text style={[styles.title, { color: colors.text }]}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Types */}
        {renderSection("Notification Types", notificationTypes)}

        {/* Alert Settings */}
        {renderSection("Alert Settings", alertSettings)}

        {/* Notification Categories */}
        {renderSection("Notification Categories", notificationCategories)}

        {/* Quiet Hours */}
        {renderSection("Schedule", quietHours)}

        {/* Notification Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preview</Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.previewContainer}>
              <View style={[styles.previewNotification, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <View style={styles.previewIcon}>
                  <Bell size={16} color="#FFFFFF" />
                </View>
                <View style={styles.previewContent}>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>New Report Update</Text>
                  <Text style={[styles.previewSubtitle, { color: colors.textSecondary }]}>Your report has been reviewed</Text>
                </View>
              </View>
              <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                This is how notifications will appear on your device
              </Text>
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
  previewContainer: {
    padding: 16,
    alignItems: "center",
  },
  previewNotification: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: "100%",
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  previewSubtitle: {
    fontSize: 12,
    color: "#8E8E93",
  },
  previewText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
});
