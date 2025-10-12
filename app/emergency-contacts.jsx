import { useRouter } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    Building,
    Car,
    Flame,
    Heart,
    Phone,
    Shield,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function EmergencyContacts() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  const [favorites, setFavorites] = useState(["1990", "119"]);

  const emergencyServices = [
    {
      id: "police",
      icon: Shield,
      title: "Police Emergency",
      number: "119",
      description: "Report crimes, accidents, and security threats",
      color: "#FF3B30",
    },
    {
      id: "ambulance",
      icon: Heart,
      title: "Ambulance Service",
      number: "110",
      description: "Medical emergencies and ambulance requests",
      color: "#FF3B30",
    },
    {
      id: "fire",
      icon: Flame,
      title: "Fire Department",
      number: "110",
      description: "Fire emergencies and rescue services",
      color: "#FF9500",
    },
    {
      id: "traffic",
      icon: Car,
      title: "Traffic Police",
      number: "1919",
      description: "Traffic violations and road accidents",
      color: "#007AFF",
    },
    {
      id: "coastguard",
      icon: Building,
      title: "Coast Guard",
      number: "1919",
      description: "Maritime emergencies and coastal incidents",
      color: "#007AFF",
    },
    {
      id: "disaster",
      icon: AlertTriangle,
      title: "Disaster Management",
      number: "117",
      description: "Natural disasters and emergency relief",
      color: "#FF9500",
    },
  ];

  const governmentServices = [
    {
      id: "president",
      icon: Users,
      title: "President's Office",
      number: "011-2354354",
      description: "Presidential Secretariat",
      color: "#8E8E93",
    },
    {
      id: "prime",
      icon: Users,
      title: "Prime Minister's Office",
      number: "011-2320000",
      description: "Prime Minister's Secretariat",
      color: "#8E8E93",
    },
    {
      id: "ministry",
      icon: Building,
      title: "Ministry of Health",
      number: "011-2691111",
      description: "Health Ministry Hotline",
      color: "#32D74B",
    },
    {
      id: "education",
      icon: Building,
      title: "Ministry of Education",
      number: "011-2784847",
      description: "Education Ministry",
      color: "#007AFF",
    },
  ];

  const handleCall = (number, title) => {
    Alert.alert(
      "Call Emergency Service",
      `Are you sure you want to call ${title} at ${number}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(`tel:${number}`).catch(() => {
              Alert.alert("Error", "Unable to make phone call");
            });
          },
        },
      ]
    );
  };

  const toggleFavorite = (number) => {
    setFavorites((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number)
        : [...prev, number]
    );
  };

  const renderContactItem = (contact) => (
    <View key={contact.id} style={[styles.contactItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.contactIcon, { backgroundColor: `${contact.color}15` }]}>
        <contact.icon size={24} color={contact.color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>{contact.title}</Text>
        <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>{contact.description}</Text>
        <Text style={[styles.contactNumber, { color: contact.color }]}>
          {contact.number}
        </Text>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(contact.number)}
        >
          <Text style={[
            styles.favoriteText,
            { color: favorites.includes(contact.number) ? "#FF3B30" : colors.textSecondary }
          ]}>
            {favorites.includes(contact.number) ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: contact.color }]}
          onPress={() => handleCall(contact.number, contact.title)}
        >
          <Phone size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title, contacts) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
        {contacts.map(renderContactItem)}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Emergency Contacts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        

        {/* Quick Access */}
        <View style={styles.quickAccess}>
          <Text style={[styles.quickAccessTitle, { color: colors.text }]}>Quick Access</Text>
          <View style={styles.quickButtons}>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: "#FF3B30" }]}
              onPress={() => handleCall("119", "Police Emergency")}
            >
              <Shield size={20} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>Police</Text>
              <Text style={styles.quickButtonNumber}>119</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: "#FF3B30" }]}
              onPress={() => handleCall("110", "Ambulance")}
            >
              <Heart size={20} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>Ambulance</Text>
              <Text style={styles.quickButtonNumber}>110</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: "#FF9500" }]}
              onPress={() => handleCall("110", "Fire Department")}
            >
              <Flame size={20} color="#FFFFFF" />
              <Text style={styles.quickButtonText}>Fire</Text>
              <Text style={styles.quickButtonNumber}>110</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Services */}
        {renderSection("Emergency Services", emergencyServices)}

        {/* Government Services */}
        {renderSection("Government Services", governmentServices)}

        {/* Important Notes */}
        <View style={styles.notesSection}>
          <Text style={[styles.notesTitle, { color: colors.text }]}>Important Notes</Text>
          <View style={[styles.notesContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.noteItem, { color: colors.textSecondary }]}>
              • Keep emergency numbers saved in your phone's contacts
            </Text>
            <Text style={[styles.noteItem, { color: colors.textSecondary }]}>
              • Stay calm and provide clear information when calling
            </Text>
            <Text style={[styles.noteItem, { color: colors.textSecondary }]}>
              • Know your exact location when reporting emergencies
            </Text>
            <Text style={[styles.noteItem, { color: colors.textSecondary }]}>
              • For non-emergency police matters, call your local police station
            </Text>
            <Text style={[styles.noteItem, { color: colors.textSecondary }]}>
              • Save these numbers in your phone's emergency contacts
            </Text>
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
  emergencyNotice: {
    flexDirection: "row",
    backgroundColor: "#FFEBEE",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  quickAccess: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
  },
  quickButtonNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
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
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteText: {
    fontSize: 20,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  notesContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  noteItem: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 22,
    marginBottom: 8,
  },
});
