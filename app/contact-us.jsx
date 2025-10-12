import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Building,
    Clock,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function ContactUs() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "support@dutycall.lk",
      action: () => Linking.openURL("mailto:support@dutycall.lk"),
      color: "#007AFF",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+94 11 234 5678",
      action: () => Linking.openURL("tel:+94112345678"),
      color: "#32D74B",
    },
    {
      icon: MapPin,
      title: "Address",
      value: "123 Main Street, Colombo 03, Sri Lanka",
      action: () => Linking.openURL("https://maps.google.com/?q=Colombo+03+Sri+Lanka"),
      color: "#FF9500",
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon - Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 1:00 PM",
      action: null,
      color: "#8E8E93",
    },
  ];

  const teamMembers = [
    {
      name: "Kavish Godage",
      role: "CEO & Founder",
      email: "kavish@dutycall.lk",
      phone: "+94 77 123 4567",
    },
    {
      name: "Sarah Perera",
      role: "Technical Director",
      email: "sarah@dutycall.lk",
      phone: "+94 77 234 5678",
    },
    {
      name: "Rajesh Kumar",
      role: "Customer Support Manager",
      email: "rajesh@dutycall.lk",
      phone: "+94 77 345 6789",
    },
    {
      name: "Priya Silva",
      role: "Operations Manager",
      email: "priya@dutycall.lk",
      phone: "+94 77 456 7890",
    },
  ];

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    Alert.alert(
      "Message Sent",
      "Thank you for your message! We'll get back to you within 24 hours.",
      [
        {
          text: "OK",
          onPress: () => {
            setFormData({ name: "", email: "", subject: "", message: "" });
          },
        },
      ]
    );
  };

  const renderContactItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.contactItem, { borderBottomColor: colors.border }]}
      onPress={item.action}
      disabled={!item.action}
    >
      <View style={[styles.contactIcon, { backgroundColor: `${item.color}15` }]}>
        <item.icon size={24} color={item.color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.contactValue, { color: colors.textSecondary }]}>{item.value}</Text>
      </View>
      {item.action && <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>}
    </TouchableOpacity>
  );

  const renderTeamMember = (member, index) => (
    <View key={index} style={[styles.teamMember, { borderBottomColor: colors.border }]}>
      <View style={[styles.memberAvatar, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
        <Users size={20} color="#007AFF" />
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
        <Text style={styles.memberRole}>{member.role}</Text>
        <Text style={[styles.memberContact, { color: colors.textSecondary }]}>{member.email}</Text>
        <Text style={[styles.memberContact, { color: colors.textSecondary }]}>{member.phone}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Contact Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Get in Touch</Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            {contactInfo.map(renderContactItem)}
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Send us a Message</Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Subject</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={formData.subject}
                  onChangeText={(text) => setFormData({ ...formData, subject: text })}
                  placeholder="What's this about?"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Message</Text>
                <TextInput
                  style={[styles.textInput, styles.messageInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  value={formData.message}
                  onChangeText={(text) => setFormData({ ...formData, message: text })}
                  placeholder="Tell us how we can help you..."
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

       

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About DutyCall</Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.companyInfo}>
              <View style={[styles.companyIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <Building size={24} color="#007AFF" />
              </View>
              <View style={styles.companyDetails}>
                <Text style={[styles.companyName, { color: colors.text }]}>DutyCall Technologies</Text>
                <Text style={[styles.companyDescription, { color: colors.textSecondary }]}>
                  We are a technology company dedicated to improving public safety and civic engagement 
                  in Sri Lanka through innovative mobile applications.
                </Text>
                <Text style={[styles.companyMission, { color: colors.textSecondary }]}>
                  Our mission is to bridge the gap between citizens and government services, 
                  making it easier for people to report issues and get help when they need it most.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Response Time */}
        <View style={[styles.responseTime, { backgroundColor: isDarkMode ? '#1e3a5f' : '#E3F2FD' }]}>
          <MessageCircle size={20} color="#007AFF" />
          <Text style={[styles.responseTimeText, { color: isDarkMode ? '#64B5F6' : '#007AFF' }]}>
            We typically respond to all inquiries within 24 hours during business days.
          </Text>
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
  contactValue: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  chevron: {
    fontSize: 18,
    color: "#C7C7CC",
    fontWeight: "300",
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  messageInput: {
    minHeight: 100,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  teamMember: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  memberContact: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 2,
  },
  companyInfo: {
    flexDirection: "row",
    padding: 16,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  companyDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    marginBottom: 12,
  },
  companyMission: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    fontStyle: "italic",
  },
  responseTime: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  responseTimeText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
