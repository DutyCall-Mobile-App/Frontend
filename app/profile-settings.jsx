import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Camera,
    Edit3,
    Mail,
    Phone,
    User,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function ProfileSettings() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Kavish Godage",
    email: "kavishgodage225@gmail.com",
    phone: "+94 77 123 4567",
    nic: "123456789V",
    address: "123 Main Street, Colombo 03, Sri Lanka",
  });

  const handleSave = () => {
    Alert.alert("Success", "Profile updated successfully!");
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Profile Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePictureContainer}>
            <Image
              source={{
                uri: "https://via.placeholder.com/120x120/007AFF/FFFFFF?text=KG",
              }}
              style={styles.profilePicture}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{profileData.name}</Text>
        </View>

        {/* Profile Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <Edit3 size={16} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <User size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={profileData.name}
                    onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.name}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <Mail size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email Address</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={profileData.email}
                    onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.email}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <Phone size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={profileData.phone}
                    onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.phone}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <User size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>NIC Number</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={profileData.nic}
                    onChangeText={(text) => setProfileData({ ...profileData, nic: text })}
                    placeholder="Enter your NIC number"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.nic}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <User size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Address</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.textInput, styles.multilineInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    value={profileData.address}
                    onChangeText={(text) => setProfileData({ ...profileData, address: text })}
                    placeholder="Enter your address"
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colors.text }]}>{profileData.address}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Account Security */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Security</Text>
          <View style={styles.infoContainer}>
            <TouchableOpacity style={styles.securityItem}>
              <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <User size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Change Password</Text>
                <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>Update your account password</Text>
              </View>
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.securityItem}>
              <View style={[styles.infoIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
                <User size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.text }]}>Two-Factor Authentication</Text>
                <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>Add extra security to your account</Text>
              </View>
              <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
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
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePictureContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  infoContainer: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  textInput: {
    fontSize: 16,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: "#8E8E93",
  },
  chevron: {
    fontSize: 18,
    color: "#C7C7CC",
    fontWeight: "300",
  },
});
