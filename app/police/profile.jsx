// Frontend/app/police/profile.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import ApiService from "../../services/apiService";
import { useFocusEffect } from "@react-navigation/native";

export default function OfficerProfile() {
  const router = useRouter();
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assignedReportsCount, setAssignedReportsCount] = useState(0);

  // Fetch officer details and assigned reports count on mount/focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const loadOfficerDetails = async () => {
        try {
          const details = await ApiService.getOfficerDetails();
          if (details && details.role === "policeman") {
            if (isActive) {
              setOfficer({
                id: details._id,
                name: details.name || "Officer",
                badgeNumber: details.badgeNumber || "N/A",
                district: details.district || "N/A",
                status: details.status || "active",
                profileImage: details.profileImage || null,
                lastLogin: details.lastLogin || null,
              });
            }
            // Fetch assigned reports count
            const reports = await ApiService.getAllReportsForPolice(
              details._id
            );
            if (isActive) setAssignedReportsCount(reports.length || 0);
          } else {
            Alert.alert("Error", "Not authorized as police officer");
            router.replace("/login");
          }
        } catch (error) {
          console.error("Failed to load profile:", error);
          Alert.alert("Error", "Failed to load profile. Please log in again.");
          router.replace("/login");
        } finally {
          if (isActive) setLoading(false);
        }
      };
      loadOfficerDetails();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(["token", "role", "userId"]);
            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const toggleDutyStatus = async () => {
    if (!officer) return;
    const newStatus = officer.status === "on-duty" ? "off-duty" : "on-duty";
    setUpdatingStatus(true);

    try {
      // Update status via backend (you can add this endpoint later)
      // For now, update locally + show confirmation
      setOfficer((prev) => ({ ...prev, status: newStatus }));
      Alert.alert(
        "Status Updated",
        `You are now ${newStatus === "on-duty" ? "on duty" : "off duty"}.`
      );
    } catch (error) {
      console.error("Status update failed:", error);
      Alert.alert("Error", "Failed to update status. Please try again.");
      // Revert on error
      setOfficer((prev) => ({
        ...prev,
        status: prev.status === "on-duty" ? "off-duty" : "on-duty",
      }));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "on-duty":
        return { text: "On Duty", color: "#4CAF50" };
      case "off-duty":
        return { text: "Off Duty", color: "#F44336" };
      default:
        return { text: "Active", color: "#2196F3" };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!officer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const statusDisplay = getStatusDisplay(officer.status);

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              officer.profileImage
                ? { uri: officer.profileImage }
                : require("../../assets/images/react-logo.png")
            }
            style={styles.avatar}
          />
          <View
            style={[styles.statusDot, { backgroundColor: statusDisplay.color }]}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.officerName}>{officer.name}</Text>
          <Text style={styles.roleText}>Police Officer</Text>
          {officer.lastLogin && (
            <Text style={styles.lastLoginText}>
              Last Login: {new Date(officer.lastLogin).toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      {/* Officer Details */}
      <View style={styles.detailsCard}>
        <DetailRow label="Badge Number" value={officer.badgeNumber} />
        <DetailRow label="District" value={officer.district} />
        <DetailRow label="Assigned Reports" value={assignedReportsCount} />
        <View style={styles.statusRow}>
          <Text style={styles.label}>Status</Text>
          <Pressable
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusDisplay.color}20` },
            ]}
            onPress={toggleDutyStatus}
            disabled={updatingStatus}
          >
            {updatingStatus ? (
              <ActivityIndicator size="small" color={statusDisplay.color} />
            ) : (
              <Text style={[styles.statusText, { color: statusDisplay.color }]}>
                {statusDisplay.text}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/police-screens/assigned-reports")}
        >
          <MaterialIcons name="assignment" size={20} color="#1a73e8" />
          <Text style={styles.actionText}>View Assigned Reports</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={20} color="#1a73e8" />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

// Reusable detail row component
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#f44336",
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#e0e0e0",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#f8f9fa",
  },
  headerText: {
    justifyContent: "center",
  },
  officerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  roleText: {
    fontSize: 16,
    color: "#666",
  },
  lastLoginText: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 90,
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    color: "#1a73e8",
    fontWeight: "600",
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f44336",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
  },
  backText: {
    fontSize: 16,
    color: "#1a73e8",
    fontWeight: "600",
    marginLeft: 8,
  },
});
