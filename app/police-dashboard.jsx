import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  FileText,
  LogOut,
  MapPin,
  Shield
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function PoliceDashboard() {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);




  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            // Clear any stored tokens
            await AsyncStorage.removeItem('policeToken');
            router.replace("/");
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }

    try {
      // Get the stored token (you'll need to store this when logging in)
      const token = await AsyncStorage.getItem('policeToken');
      
      const response = await axios.patch("http://172.20.10.9:3000/api/police/update-credentials", {
        currentPassword,
        newPassword,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        Alert.alert("Success", "Password updated successfully");
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Error", response.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      if (error.response?.status === 401) {
        Alert.alert("Error", "Current password is incorrect or session expired");
      } else {
        Alert.alert("Error", "Failed to update password. Please try again.");
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Icon size={24} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );

  const ReportCard = ({ report }) => (
    <TouchableOpacity style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportId}>
          <Text style={styles.reportIdText}>#{report.reportId}</Text>
        </View>
        <View style={[
          styles.reportStatus,
          { backgroundColor: getStatusColor(report.status) }
        ]}>
          <Text style={styles.reportStatusText}>{report.status}</Text>
        </View>
      </View>
      <Text style={styles.reportTitle}>{report.title}</Text>
      <View style={styles.reportFooter}>
        <View style={styles.reportLocation}>
          <MapPin size={14} color="#8E8E93" />
          <Text style={styles.reportLocationText}>{report.location}</Text>
        </View>
        <Text style={styles.reportTime}>
          {new Date(report.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#FF9500";
      case "in_progress":
        return "#007AFF";
      case "resolved":
        return "#32D74B";
      default:
        return "#8E8E93";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Logo</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={["#007AFF", "#5AC8FA"]}
          style={styles.dateTimeCard}
        >
          <View style={styles.dateTimeContent}>
            <Text style={styles.date}>{formatDate(currentDateTime)}</Text>
            <Text style={styles.time}>{formatTime(currentDateTime)}</Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <TouchableOpacity style={styles.myReportsButton} onPress={() => router.push("/my-reports")}>
          <View style={styles.myReportsContent}>
            <FileText size={20} color="#007AFF" />
            <Text style={styles.myReportsText}>View Reports</Text>
          </View>
          <ChevronRight size={20} color="#C7C7CC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.myReportsButton} onPress={handleChangePassword}>
          <View style={styles.myReportsContent}>
            <Shield size={20} color="#007AFF" />
            <Text style={styles.myReportsText}>Change Password</Text>
          </View>
          <ChevronRight size={20} color="#C7C7CC" />
        </TouchableOpacity>

      
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              placeholderTextColor="#8E8E93"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={true}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              placeholderTextColor="#8E8E93"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              placeholderTextColor="#8E8E93"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.submitButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateTimeCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    minHeight: 120,
  },
  dateTimeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 16,
  },
  time: {
    fontSize: 24,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.95)",
    flex: 1,
  },
  myReportsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  myReportsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  myReportsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginLeft: 12,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
  reportsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  reportsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  reportCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportId: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reportIdText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  reportStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportLocation: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportLocationText: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 4,
  },
  reportTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  notificationsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1a1a2e",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
