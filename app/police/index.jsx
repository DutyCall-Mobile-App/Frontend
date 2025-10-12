// Frontend/app/police/index.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from "../../services/apiService";
import { AlertCircle, CheckCircle, Clock } from "lucide-react-native";

// ✅ Placeholder avatar
const avatar = require("../../assets/images/react-logo.png");

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

export default function PoliceDashboard() {
  const router = useRouter();

  // States
  const [isOnline, setIsOnline] = useState(true);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [countdown, setCountdown] = useState("Loading...");
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0 });
  const [priorityReports, setPriorityReports] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [officerDetails, setOfficerDetails] = useState({
    name: "",
    badgeNumber: "",
    district: "",
    profileImage: "",
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosCountdown, setSOSCountdown] = useState(5);

  // Shift times (could be fetched from backend later)
  const shiftStart = "08:00";
  const shiftEnd = "20:00";

  // Duty countdown logic
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const today = new Date();
      const [startHour, startMin] = shiftStart.split(":").map(Number);
      const [endHour, endMin] = shiftEnd.split(":").map(Number);

      const shiftStartTime = new Date(today);
      shiftStartTime.setHours(startHour, startMin, 0, 0);
      const shiftEndTime = new Date(today);
      shiftEndTime.setHours(endHour, endMin, 0, 0);

      if (now >= shiftStartTime && now < shiftEndTime) {
        setIsOnDuty(true);
        const diffMs = shiftEndTime - now;
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setCountdown(`${hours}h ${minutes}m remaining`);
      } else {
        setIsOnDuty(false);
        setCountdown("Shift ended");
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [shiftStart, shiftEnd]);

  // Fetch officer details
  useEffect(() => {
    const fetchOfficerDetails = async () => {
      try {
        const details = await ApiService.getOfficerDetails();
        if (details) {
          setOfficerDetails({
            name: details.name || "Officer",
            badgeNumber: details.badgeNumber || "N/A",
            district: details.district || "N/A",
            profileImage: details.profileImage || "",
            status: details.status || "active",
          });
        }
      } catch (err) {
        console.error("Error fetching officer details:", err);
      }
    };
    fetchOfficerDetails();
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [priority, recent, reportStats] = await Promise.all([
        ApiService.getPriorityReports(),
        ApiService.getRecentReports(),
        ApiService.getReportStats(),
      ]);

      setPriorityReports(priority);
      setRecentReports(recent);
      setStats({
        pending: reportStats.pending || 0,
        inProgress: reportStats.inProgress || 0,
        resolved: reportStats.resolved || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // SOS logic
  const handleSOSPress = () => {
    setShowSOSModal(true);
    setSOSCountdown(5);
    const timer = setInterval(() => {
      setSOSCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowSOSModal(false);
          router.push("/police-screens/emergency-sos");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    setShowSOSModal(false);
  };

  const handleNotificationPress = () => {
    Alert.alert("Notifications", "Coming soon!");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* 🚨 HEADER */}
        <TouchableOpacity style={styles.header} onPress={() => router.push("/police/profile")}>
          <View style={styles.officerInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={officerDetails.profileImage ? { uri: officerDetails.profileImage } : avatar}
                style={styles.avatar}
              />
              <View style={[styles.statusDot, { backgroundColor: isOnline ? "green" : "red" }]} />
            </View>
            <View style={styles.officerText}>
              <Text style={styles.officerName}>{officerDetails.name}</Text>
              <Text style={styles.officerBadge}>
                Badge #{officerDetails.badgeNumber} • District {officerDetails.district}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationIcon} onPress={()=> router.push("/screens/PoliceDashboardScreen")}>
            <MaterialIcons name="chat" size={24} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* 🟢 STATUS BANNER */}
        <View style={styles.statusBanner}>
          <View style={styles.onDutySection}>
            <View style={[styles.dutyDot, { backgroundColor: isOnDuty ? "green" : "red" }]} />
            <Text style={styles.dutyText}>On Duty</Text>
          </View>
          <View style={styles.shiftInfo}>
            <Text style={styles.shiftTimeText}>Shift: {shiftStart} – {shiftEnd}</Text>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>

        {/* 📊 STATS */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#ffcdd2" }]}>
            <MaterialIcons name="hourglass-empty" size={24} color="#c62828" />
            <Text style={styles.statCount}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#fff9c4" }]}>
            <MaterialIcons name="settings" size={24} color="#f57f17" />
            <Text style={styles.statCount}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#c8e6c9" }]}>
            <MaterialIcons name="check-circle" size={24} color="#2e7d32" />
            <Text style={styles.statCount}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* 🔴 PRIORITY REPORTS */}
        <View style={styles.prioritySection}>
          <View style={styles.priorityHeader}>
            <Text style={styles.sectionTitle}>Priority Reports</Text>
            <View style={styles.urgentTag}>
              <MaterialIcons name="error" size={16} color="red" />
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          </View>
          <View style={styles.priorityCardsContainer}>
            {priorityReports.length > 0 ? (
              priorityReports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={[
                    styles.reportCard,
                    { backgroundColor: report.priority === "HIGH" ? "#ffcdd2" : "#fff9c4" },
                  ]}
                  onPress={() => router.push(`/police-screens/report-details?id=${report.id}`)}
                >
                  <View style={styles.reportTopRow}>
                    <View
                      style={[
                        styles.priorityTag,
                        {
                          backgroundColor: report.priority === "HIGH" ? "#ffcdd2" : "#fff9c4",
                          borderColor: report.priority === "HIGH" ? "#e53935" : "#f57f17",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: report.priority === "HIGH" ? "#c62828" : "#f57f17",
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      >
                        {report.priority}
                      </Text>
                    </View>
                    <View style={styles.reportIdContainer}>
                      <Text style={styles.reportId}>#{report.id}</Text>
                      <MaterialIcons name="location-on" size={16} color="#777" />
                    </View>
                  </View>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportMeta}>
                    Reported by: {report.reporter} • {report.timeAgo}
                  </Text>
                  <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={16} color="#777" />
                    <Text style={styles.reportLocation}>{report.location}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: report.priority === "HIGH" ? "#e53935" : "#f57f17" },
                    ]}
                  >
                    <Text style={styles.actionButtonText}>
                      {report.priority === "HIGH" ? "Respond" : "Review"}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No priority reports</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/police/reports?filter=priority")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialIcons name="arrow-forward-ios" size={14} color="#1a73e8" />
          </TouchableOpacity>
        </View>

        {/* 📜 RECENT REPORTS */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <View style={styles.recentCardsContainer}>
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={[
                    styles.recentCard,
                    { backgroundColor: report.status === "approved" ? "#c8e6c9" : "#fff" },
                  ]}
                  onPress={() => router.push(`/police-screens/report-details?id=${report.id}`)}
                >
                  <View style={styles.recentHeader}>
                    <View
                      style={[
                        styles.recentPriorityTag,
                        {
                          backgroundColor:
                            report.priority === "HIGH"
                              ? "#ffcdd2"
                              : report.priority === "LOW"
                              ? "#f5f5f5"
                              : "#c8e6c9",
                          borderColor:
                            report.priority === "HIGH"
                              ? "#e53935"
                              : report.priority === "LOW"
                              ? "#ccc"
                              : "#2e7d32",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            report.priority === "HIGH"
                              ? "#c62828"
                              : report.priority === "LOW"
                              ? "#777"
                              : "#2e7d32",
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      >
                        {report.priority}
                      </Text>
                    </View>
                    <Text style={styles.recentId}>#{report.id}</Text>
                  </View>
                  <View style={styles.recentContent}>
                    <Text style={styles.recentTitle}>{report.title}</Text>
                    <Text style={styles.recentMeta}>
                      Reported by: {report.reporter} • {report.timeAgo}
                    </Text>
                  </View>
                  <View style={styles.recentActions}>
                    {report.status === "approved" && (
                      <MaterialIcons name="check-circle" size={20} color="#2e7d32" />
                    )}
                    <MaterialIcons name="keyboard-arrow-right" size={24} color="#777" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent reports</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/police/reports")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialIcons name="arrow-forward-ios" size={14} color="#1a73e8" />
          </TouchableOpacity>
        </View>

        {/* ⚡ QUICK ACTIONS */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/police/reports?filter=assigned")}
            >
              <MaterialIcons name="assignment" size={28} color="#1a73e8" />
              <Text style={styles.actionLabel}>Assigned to Me</Text>
              <Text style={styles.actionSubtext}>View your active reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, styles.emergencyCard]} onPress={handleSOSPress}>
              <MaterialIcons name="emergency" size={28} color="#fff" />
              <Text style={[styles.actionLabel, { color: "#fff" }]}>Emergency</Text>
              <Text style={[styles.actionSubtext, { color: "#fff" }]}>Call for backup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/police-screens/police-report-form")}
            >
              <MaterialIcons name="description" size={28} color="#1a73e8" />
              <Text style={styles.actionLabel}>New Report</Text>
              <Text style={styles.actionSubtext}>Create incident report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/police-screens/gather-evidence")}
            >
              <MaterialIcons name="photo-camera" size={28} color="#1a73e8" />
              <Text style={styles.actionLabel}>Gather Evidence</Text>
              <Text style={styles.actionSubtext}>Capture photos, audio, location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SOS MODAL */}
        <Modal visible={showSOSModal} transparent animationType="fade">
          <View style={styles.sosModalOverlay}>
            <View style={styles.sosModalContent}>
              <View style={styles.sosWarningIcon}>
                <MaterialIcons name="warning" size={40} color="#FF3B30" />
              </View>
              <Text style={styles.sosModalTitle}>Emergency SOS</Text>
              <Text style={styles.sosModalText}>SOS will be sent in {sosCountdown} seconds</Text>
              <TouchableOpacity style={styles.cancelSOSButton} onPress={cancelSOS}>
                <Text style={styles.cancelSOSText}>CANCEL SOS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (keep all existing styles from your original file)
  // Only add missing ones if needed — your original styles are complete
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007aff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Include all other styles from your original file...
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a73e8",
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  officerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    width: 50,
    height: 50,
    marginRight: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  officerText: {
    justifyContent: "center",
  },
  officerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  officerBadge: {
    fontSize: 12,
    color: "white",
  },
  notificationIcon: {
    padding: 5,
  },
  statusBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#c8e6c9",
  },
  onDutySection: {
    flexDirection: "row",
    alignItems: "center",
  },
  dutyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dutyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e7d32",
  },
  shiftInfo: {
    alignItems: "flex-end",
  },
  shiftTimeText: {
    fontSize: 14,
    color: "#555",
  },
  countdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a73e8",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCount: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 6,
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  prioritySection: {
    padding: 16,
  },
  priorityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  urgentTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffcdd2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 14,
    color: "red",
    marginLeft: 4,
    fontWeight: "600",
  },
  priorityCardsContainer: {
    gap: 12,
  },
  reportCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportId: {
    fontSize: 12,
    color: "#777",
    marginRight: 4,
  },
  reportTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  reportMeta: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reportLocation: {
    fontSize: 12,
    color: "#777",
    marginLeft: 4,
  },
  actionButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  recentSection: {
    padding: 16,
  },
  recentCardsContainer: {
    gap: 12,
  },
  recentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recentHeader: {
    width: 80,
    marginRight: 12,
  },
  recentPriorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  recentId: {
    fontSize: 12,
    color: "#777",
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  recentMeta: {
    fontSize: 12,
    color: "#555",
  },
  recentActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
  },
  viewAllText: {
    color: "#1a73e8",
    fontWeight: "600",
    marginRight: 6,
  },
  quickActionsSection: {
    padding: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emergencyCard: {
    backgroundColor: "#e53935",
    elevation: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#333",
  },
  actionSubtext: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  sosModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  sosModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%",
  },
  sosWarningIcon: {
    marginBottom: 16,
  },
  sosModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  sosModalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  cancelSOSButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelSOSText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});