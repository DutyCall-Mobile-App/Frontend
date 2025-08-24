import {
  Bell,
  BookOpen,
  ChevronRight,
  CircleHelp as HelpCircle,
  MessageCircle,
  Phone,
  Shield,
  Star,
  User,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Settings() {
  const settingsItems = [
    {
      icon: User,
      title: "Profile",
      subtitle: "Kavish Godage",
      email: "kavishgodage225@gmail.com",
      type: "profile",
    },
    {
      icon: Bell,
      title: "Notification Settings",
      type: "normal",
    },
    {
      icon: Phone,
      title: "Emergency Contacts",
      type: "normal",
    },
    {
      icon: HelpCircle,
      title: "FAQs",
      type: "normal",
    },
    {
      icon: MessageCircle,
      title: "Contact Us",
      type: "normal",
    },
    {
      icon: BookOpen,
      title: "App Tutorial",
      type: "normal",
    },
    {
      icon: Shield,
      title: "Terms of Use",
      type: "normal",
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      type: "normal",
    },
    {
      icon: Star,
      title: "Rate App",
      type: "normal",
    },
  ];

  const renderSettingItem = (item, index) => {
    if (item.type === "profile") {
      return (
        <View key={index} style={styles.profileItem}>
          <View style={styles.profileIconContainer}>
            <item.icon size={20} color="#007AFF" />
          </View>
          <View style={styles.profileContent}>
            <Text style={styles.profileName}>{item.subtitle}</Text>
            <Text style={styles.profileEmail}>{item.email}</Text>
          </View>
          <ChevronRight size={20} color="#C7C7CC" />
        </View>
      );
    }

    return (
      <TouchableOpacity key={index} style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
          <item.icon size={20} color="#007AFF" />
        </View>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <ChevronRight size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          {settingsItems.map((item, index) => renderSettingItem(item, index))}
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
  },
  settingsContainer: {
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
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileContent: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  profileEmail: {
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
  settingTitle: {
    fontSize: 16,
    color: "#000000",
    flex: 1,
  },
});
