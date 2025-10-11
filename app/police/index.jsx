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
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Placeholder avatar image - replace with real officer photo later
const avatar = require("../../assets/images/react-logo.png"); // 👈 Update path to real officer avatar later

export default function PoliceDashboard() {
  // 🟢 State for online status - will be fetched from backend later
  const [isOnline, setIsOnline] = useState(true); // 👈 Default: online. Later: fetch from API or Firebase

  // 🔔 Placeholder for notification press - will show real notifications later
  const handleNotificationPress = () => {
    Alert.alert("Notifications", "Coming soon!"); // 👈 Replace with real notification screen later
  };
  // 🕒 Hardcoded shift times for now — will fetch from backend later
  const shiftStart = "08:00";
  const shiftEnd = "20:00";

  // ⏳ State for countdown text
  const [countdown, setCountdown] = useState("Loading...");

  // 🟢 State for duty status
  const [isOnDuty, setIsOnDuty] = useState(false);

  // 🔄 Update countdown every second
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const today = new Date();

      // Parse shift times (assume same day)
      const [startHour, startMin] = shiftStart.split(":").map(Number);
      const [endHour, endMin] = shiftEnd.split(":").map(Number);

      const shiftStartTime = new Date(today);
      shiftStartTime.setHours(startHour, startMin, 0, 0);

      const shiftEndTime = new Date(today);
      shiftEndTime.setHours(endHour, endMin, 0, 0);

      // Handle overnight shifts if needed (not required for 08–20)
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

    // Run immediately
    calculateCountdown();

    // Update every second
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [shiftStart, shiftEnd]); // 👈 Later: replace with [officerShift] from backend
  // 🟡 MOCK DATA — Replace with real API call when backend is ready
  const fetchOfficerStats = async () => {
    // Simulate network delay (optional)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 👇 HARD-CODED MOCK VALUES (matches your prototype)
    return {
      pending: 12,
      inProgress: 8,
      resolved: 45,
    };
  };

  // 📊 State for stats
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  // 🔁 Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        // 👉 TODAY: Use mock data
        const data = await fetchOfficerStats();

        // 🔜 FUTURE: UNCOMMENT BELOW & DELETE MOCK WHEN BACKEND IS READY
        // const data = await apiService.getOfficerStats(); // ← from services/apiService.js

        setStats(data);
      } catch (error) {
        console.error("Failed to load officer stats:", error);
        // Optional: show error toast
      }
    };

    loadStats();
  }, []); // 🔜 FUTURE: Add dependency like [officerId] if needed
  // 🔴 MOCK DATA — Replace with real API call when backend is ready
  const fetchPriorityReports = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockReports = [
      {
        id: "R2025-0089",
        title: "Domestic Violence Report",
        priority: "HIGH",
        reporter: "Sarah M.",
        timeAgo: "15 min ago",
        location: "Oak Street, District 12",
        icon: "location-on", // MaterialIcons name
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        id: "R2025-0087",
        title: "Vehicle Theft",
        priority: "MED",
        reporter: "John D.",
        timeAgo: "32 min ago",
        location: "Main Plaza",
        icon: "directions-car",
        createdAt: new Date(Date.now() - 32 * 60 * 1000),
      },
      {
        id: "R2025-0090",
        title: "Suspicious Activity",
        priority: "HIGH",
        reporter: "Alice K.",
        timeAgo: "5 min ago",
        location: "5th Avenue",
        icon: "visibility",
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    ];

    // Sort: HIGH first, then MED; newest first within each
    const sorted = mockReports.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MED: 1 };
      return (
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        b.createdAt - a.createdAt
      );
    });

    return sorted.slice(0, 2);
  };

  // 📊 State
  const [priorityReports, setPriorityReports] = useState([]);

  // 🔁 Load on mount
  useEffect(() => {
    const loadPriorityReports = async () => {
      try {
        // 👉 TODAY: Use mock
        const reports = await fetchPriorityReports();

        // 🔜 FUTURE: UNCOMMENT BELOW WHEN BACKEND IS READY
        // const reports = await apiService.getOfficerPriorityReports(); // e.g., /reports/priority?limit=2

        setPriorityReports(reports);
      } catch (error) {
        console.error("Failed to load priority reports:", error);
      }
    };

    loadPriorityReports();
  }, []);
  // 📜 MOCK RECENT REPORTS — Replace with real API when backend is ready
  const fetchRecentReports = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockReports = [
      {
        id: "R2025-0086",
        title: "Noise Complaint",
        priority: "LOW",
        reporter: "Maria L.",
        timeAgo: "1 hour ago",
        location: "Main Street",
        status: "pending",
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        id: "R2025-0085",
        title: "Lost Property",
        priority: "LOW",
        reporter: "Robert K.",
        timeAgo: "2 hours ago",
        location: "Central Mall",
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "R2025-0084",
        title: "Traffic Violation",
        priority: "RESOLVED",
        reporter: "Jennifer S.",
        timeAgo: "3 hours ago",
        location: "Highway 10",
        status: "resolved",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: "R2025-0083",
        title: "Public Nuisance",
        priority: "LOW",
        reporter: "David P.",
        timeAgo: "4 hours ago",
        location: "Park Lane",
        status: "inProgress",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ];

    // Sort by newest first
    const sorted = mockReports.sort((a, b) => b.createdAt - a.createdAt);
    return sorted;
  };

  // 📊 State
  const [recentReports, setRecentReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);

  // 🔁 Load on mount
  useEffect(() => {
    const loadRecentReports = async () => {
      try {
        // 👉 TODAY: Use mock
        const allReports = await fetchRecentReports();

        // 🔜 FUTURE: UNCOMMENT BELOW WHEN BACKEND IS READY
        // const allReports = await apiService.getOfficerReports(); // e.g., /reports?sort=createdAt&limit=10

        setRecentReports(allReports.slice(0, 3)); // Show top 3
        setTotalReports(allReports.length);
      } catch (error) {
        console.error("Failed to load recent reports:", error);
      }
    };

    loadRecentReports();
  }, []);
  // SOS State
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosCountdown, setSOSCountdown] = useState(5);

  // SOS Handler
  const handleSOSPress = () => {
    setShowSOSModal(true);
    setSOSCountdown(5);

    const timer = setInterval(() => {
      setSOSCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowSOSModal(false);
          router.push("/police-screens/emergency-sos"); // Navigate to SOS screen
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cancel SOS
  const cancelSOS = () => {
    setShowSOSModal(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🚨 HEADER SECTION */}
        <TouchableOpacity
          style={styles.header}
          onPress={() => router.push("/police/profile")} // 👈 Navigate to profile tab when header is tapped
        >
          {/* LEFT: Officer Info */}
          <View style={styles.officerInfo}>
            {/* Avatar Container with Status Dot */}
            <View style={styles.avatarContainer}>
              <Image source={avatar} style={styles.avatar} />
              {/* 🟢/🔴 Online Status Indicator - positioned on avatar outline */}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? "green" : "red" },
                ]}
              />
            </View>
            <View style={styles.officerText}>
              <Text style={styles.officerName}>Officer Johnson</Text>
              <Text style={styles.officerBadge}>Badge #4729 • District 12</Text>
            </View>
          </View>

          {/* RIGHT: Notification Icon */}
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={handleNotificationPress} // 👈 Will open notification list later
          >
            <MaterialIcons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
        {/* 🟢 STATUS BANNER - On Duty + Shift Countdown */}
        <View style={styles.statusBanner}>
          {/* Left: On Duty Indicator */}
          <View style={styles.onDutySection}>
            {/* Green/Red Dot */}
            <View
              style={[
                styles.dutyDot,
                {
                  backgroundColor: isOnDuty ? "green" : "red",
                },
              ]}
            />
            <Text style={styles.dutyText}>On Duty</Text>
          </View>

          {/* Right: Shift Info + Countdown */}
          <View style={styles.shiftInfo}>
            {/* 👇 Later: Replace hardcoded shift with data from backend */}
            <Text style={styles.shiftTimeText}>
              Shift: {shiftStart} – {shiftEnd}
            </Text>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>
        {/* 📊 STATS CARDS — Pending | In Progress | Resolved */}
        <View style={styles.statsContainer}>
          {/* Card 1: Pending */}
          <View style={[styles.statCard, { backgroundColor: "#ffcdd2" }]}>
            <MaterialIcons name="hourglass-empty" size={24} color="#c62828" />
            <Text style={styles.statCount}>
              {/* 🔜 FUTURE: Replace mock with real data from backend */}
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          {/* Card 2: In Progress */}
          <View style={[styles.statCard, { backgroundColor: "#fff9c4" }]}>
            <MaterialIcons name="settings" size={24} color="#f57f17" />
            <Text style={styles.statCount}>
              {/* 🔜 FUTURE: Replace mock with real data from backend */}
              {stats.inProgress}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>

          {/* Card 3: Resolved */}
          <View style={[styles.statCard, { backgroundColor: "#c8e6c9" }]}>
            <MaterialIcons name="check-circle" size={24} color="#2e7d32" />
            <Text style={styles.statCount}>
              {/* 🔜 FUTURE: Replace mock with real data from backend */}
              {stats.resolved}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
        {/* 🔴 PRIORITY REPORTS SECTION */}
        <View style={styles.prioritySection}>
          {/* Header: Title + Urgent Tag */}
          <View style={styles.priorityHeader}>
            <Text style={styles.sectionTitle}>Priority Reports</Text>
            <View style={styles.urgentTag}>
              <MaterialIcons name="error" size={16} color="red" />
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          </View>

          {/* Cards Container */}
          <View style={styles.priorityCardsContainer}>
            {priorityReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={[
                  styles.reportCard,
                  {
                    backgroundColor:
                      report.priority === "HIGH" ? "#ffcdd2" : "#fff9c4",
                  },
                ]}
                onPress={() =>
                  router.push(`/police-screens/report-details?id=${report.id}`)
                }
              >
                {/* Top Row: Priority Tag + Report ID + Location Pin */}
                <View style={styles.reportTopRow}>
                  <View
                    style={[
                      styles.priorityTag,
                      {
                        backgroundColor:
                          report.priority === "HIGH" ? "#ffcdd2" : "#fff9c4",
                        borderColor:
                          report.priority === "HIGH" ? "#e53935" : "#f57f17",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          report.priority === "HIGH" ? "#c62828" : "#f57f17",
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

                {/* Title */}
                <Text style={styles.reportTitle}>{report.title}</Text>

                {/* Meta: Reporter + Time */}
                <Text style={styles.reportMeta}>
                  Reported by: {report.reporter} • {report.timeAgo}
                </Text>

                {/* Location */}
                <View style={styles.locationRow}>
                  <MaterialIcons name="location-on" size={16} color="#777" />
                  <Text style={styles.reportLocation}>{report.location}</Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor:
                        report.priority === "HIGH" ? "#e53935" : "#f57f17",
                    },
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    {report.priority === "HIGH" ? "Respond" : "Review"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔗 View All Button */}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/police/reports?filter=priority")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialIcons name="arrow-forward-ios" size={14} color="#1a73e8" />
          </TouchableOpacity>
        </View>
        {/* 📜 RECENT REPORTS SECTION */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>

          <View style={styles.recentCardsContainer}>
            {recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={[
                  styles.recentCard,
                  {
                    backgroundColor:
                      report.status === "resolved" ? "#c8e6c9" : "#fff",
                  },
                ]}
                onPress={() =>
                  router.push(`/police-screens/report-details?id=${report.id}`)
                }
              >
                {/* Left: Priority Tag + ID */}
                <View style={styles.recentHeader}>
                  <View
                    style={[
                      styles.recentPriorityTag,
                      {
                        backgroundColor:
                          report.priority === "RESOLVED"
                            ? "#c8e6c9"
                            : report.priority === "LOW"
                            ? "#f5f5f5"
                            : "#ffcdd2",
                        borderColor:
                          report.priority === "RESOLVED"
                            ? "#2e7d32"
                            : report.priority === "LOW"
                            ? "#ccc"
                            : "#e53935",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          report.priority === "RESOLVED"
                            ? "#2e7d32"
                            : report.priority === "LOW"
                            ? "#777"
                            : "#c62828",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    >
                      {report.priority}
                    </Text>
                  </View>
                  <Text style={styles.recentId}>#{report.id}</Text>
                </View>

                {/* Middle: Title + Reporter */}
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle}>{report.title}</Text>
                  <Text style={styles.recentMeta}>
                    Reported by: {report.reporter} • {report.timeAgo}
                  </Text>
                </View>

                {/* Right: Icon + Arrow */}
                <View style={styles.recentActions}>
                  {report.status === "resolved" && (
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color="#2e7d32"
                    />
                  )}
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={24}
                    color="#777"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔗 View All Button */}
          {totalReports > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/police/reports")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={14}
                color="#1a73e8"
              />
            </TouchableOpacity>
          )}
        </View>
        {/* ⚡ QUICK ACTIONS SECTION */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionsGrid}>
            {/* 1. Assigned to Me */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/police/reports?filter=assigned")}
            >
              <MaterialIcons name="assignment" size={28} color="#1a73e8" />
              <Text style={styles.actionLabel}>Assigned to Me</Text>
              <Text style={styles.actionSubtext}>View your active reports</Text>
            </TouchableOpacity>

            {/* 2. Emergency SOS */}
            <TouchableOpacity
              style={[styles.actionCard, styles.emergencyCard]}
              onPress={handleSOSPress}
            >
              <MaterialIcons name="emergency" size={28} color="#fff" />
              <Text style={[styles.actionLabel, { color: "#fff" }]}>
                Emergency
              </Text>
              <Text style={[styles.actionSubtext, { color: "#fff" }]}>
                Call for backup
              </Text>
            </TouchableOpacity>

            {/* 3. New Report ✅ */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/police-screens/police-report-form")}
            >
              <MaterialIcons name="description" size={28} color="#1a73e8" />
              <Text style={styles.actionLabel}>New Report</Text>
              <Text style={styles.actionSubtext}>Create incident report</Text>
            </TouchableOpacity>

            {/* 4. Gather Evidence */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/police-screens/gather-evidence")}
            >
              <MaterialIcons name="photo-camera" size={28} color="#1a73e8" />
              <Text style={styles.actionLabel}>Gather Evidence</Text>
              <Text style={styles.actionSubtext}>
                Capture photos, audio, location
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 👇 DASHBOARD CONTENT GOES HERE */}
        <View style={styles.content}>
          <Text style={styles.title}>👮 Police Dashboard</Text>
        </View>
        {/* SOS CANCEL MODAL */}
        <Modal visible={showSOSModal} transparent animationType="fade">
          <View style={styles.sosModalOverlay}>
            <View style={styles.sosModalContent}>
              <View style={styles.sosWarningIcon}>
                <MaterialIcons name="warning" size={40} color="#FF3B30" />
              </View>
              <Text style={styles.sosModalTitle}>Emergency SOS</Text>
              <Text style={styles.sosModalText}>
                SOS will be sent in {sosCountdown} seconds
              </Text>
              <TouchableOpacity
                style={styles.cancelSOSButton}
                onPress={cancelSOS}
              >
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a73e8", // Blue background like prototype
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  officerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative", // Required for absolute positioning of status dot
    width: 50,
    height: 50,
    marginRight: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 25, // Circular
    borderWidth: 2,
    borderColor: "#fff",
  },
  statusDot: {
    position: "absolute",
    bottom: 0, // Stick to bottom edge
    right: 0, // Stick to right edge
    width: 12,
    height: 12,
    borderRadius: 6, // Circular
    borderWidth: 2,
    borderColor: "#fff", // White border for contrast
    zIndex: 1, // Ensure it appears above avatar
    elevation: 2, // Android
    shadowColor: "#000", // iOS
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
  // STATUS BANNER STYLES
  statusBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e8f5e9", // Light green background
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
  activeTag: {
    backgroundColor: "#c8e6c9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  activeTagText: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "600",
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
  // STATS CARDS STYLES
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
  // PRIORITY REPORTS SECTION
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
  // RECENT REPORTS SECTION
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
  // QUICK ACTIONS SECTION
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
  // SOS MODAL STYLES
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
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
