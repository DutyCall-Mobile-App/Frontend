// Frontend/app/police/reports.jsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PoliceReports() {
  const { filter: initialFilter } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(initialFilter || "all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("all"); // 'all', 'high', 'assigned', 'unresolved', 'last24h'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  // 🔒 MOCK CURRENT OFFICER — Replace with real auth later
  const currentOfficer = {
    id: "officer_123",
    name: "Officer Johnson",
  };

  // 🔴 MOCK REPORTS — Replace with real API call later
  const fetchReports = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: "R2025-0089",
        title: "Domestic Violence Report",
        priority: "HIGH",
        status: "pending",
        reporter: "Sarah Martinez",
        phone: "(555) 123-4567",
        location: "1234 Oak Street, Apt 2B",
        submittedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
        avatar: "https://via.placeholder.com/40",
        assignedOfficer: null,
      },
      {
        id: "R2025-0087",
        title: "Vehicle Theft",
        priority: "MEDIUM",
        status: "pending",
        reporter: "John Davis",
        phone: "(555) 987-6543",
        location: "Downtown Parking Garage",
        submittedAt: new Date(Date.now() - 32 * 60 * 1000), // 32 min ago
        avatar: "https://via.placeholder.com/40",
        assignedOfficer: currentOfficer.id,
      },
      {
        id: "R2025-0086",
        title: "Noise Complaint",
        priority: "LOW",
        status: "inProgress",
        reporter: "Maria Lopez",
        phone: "(555) 456-7890",
        location: "567 Pine Avenue",
        submittedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        avatar: "https://via.placeholder.com/40",
        assignedOfficer: currentOfficer.id,
      },
      {
        id: "R2025-0084",
        title: "Traffic Violation",
        priority: "LOW",
        status: "resolved",
        reporter: "Jennifer Smith",
        phone: "",
        location: "Main St & 5th Ave",
        submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        avatar: "https://via.placeholder.com/40",
        assignedOfficer: currentOfficer.id,
      },
      {
        id: "R2025-0085",
        title: "Lost Property",
        priority: "LOW",
        status: "pending",
        reporter: "Robert Kim",
        phone: "(555) 321-0987",
        location: "Central Park",
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        avatar: "https://via.placeholder.com/40",
        assignedOfficer: null,
      },
      {
        id: "R2025-0083",
        title: "Vandalism Report",
        priority: "MEDIUM",
        status: "resolved",
        reporter: "Michael Brown",
        phone: "",
        location: "City Hall Building",
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        avatar: "https://via.placeholder.com/40",
        assignedOfficer: "officer_456",
      },
    ];
  };

  // 🕒 Format time ago (e.g., "2m ago", "3d ago")
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  // 🔁 Load & filter reports
  useEffect(() => {
    const loadReports = async () => {
      try {
        // 👉 TODAY: Use mock
        let allReports = await fetchReports();
        // 🔜 FUTURE: Replace with real API
        // const allReports = await apiService.getOfficerReports();

        // Add timeAgo to reports
        allReports = allReports.map((report) => ({
          ...report,
          timeAgo: formatTimeAgo(report.submittedAt),
        }));

        // Apply tab filter
        let tabFiltered = allReports;
        if (activeTab === "pending") {
          tabFiltered = allReports.filter((r) => r.status === "pending");
        } else if (activeTab === "inProgress") {
          tabFiltered = allReports.filter((r) => r.status === "inProgress");
        } else if (activeTab === "resolved") {
          tabFiltered = allReports.filter((r) => r.status === "resolved");
        } else if (activeTab === "assigned") {
          tabFiltered = allReports.filter(
            (r) => r.assignedOfficer === currentOfficer.id
          );
        }

        // Apply quick filter
        let quickFiltered = tabFiltered;
        if (quickFilter === "high") {
          quickFiltered = tabFiltered.filter((r) => r.priority === "HIGH");
        } else if (quickFilter === "assigned") {
          quickFiltered = tabFiltered.filter(
            (r) => r.assignedOfficer === currentOfficer.id
          );
        } else if (quickFilter === "unresolved") {
          quickFiltered = tabFiltered.filter((r) => r.status !== "resolved");
        } else if (quickFilter === "last24h") {
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          quickFiltered = tabFiltered.filter(
            (r) => r.submittedAt > twentyFourHoursAgo
          );
        }

        // Apply search
        let searchFiltered = quickFiltered;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          searchFiltered = quickFiltered.filter(
            (r) =>
              r.id.toLowerCase().includes(query) ||
              r.title.toLowerCase().includes(query) ||
              r.reporter.toLowerCase().includes(query)
          );
        }

        // Sort: HIGH > MEDIUM > LOW; then newest first
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        searchFiltered.sort((a, b) => {
          return (
            priorityOrder[a.priority] - priorityOrder[b.priority] ||
            b.submittedAt - a.submittedAt
          );
        });

        setReports(allReports);
        setFilteredReports(searchFiltered);
      } catch (error) {
        console.error("Failed to load reports:", error);
        Alert.alert("Error", "Failed to load reports");
      }
    };
    loadReports();
  }, [activeTab, quickFilter, searchQuery]);

  const handleReportPress = (id) => {
    router.push(`/police-screens/report-details?id=${id}`);
  };

  const applyQuickFilter = (filter) => {
    setQuickFilter(filter);
    setShowFilterModal(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* HEADER SECTION */}
        <View style={styles.header}>
          {isSearching ? (
            // Search Mode
            <>
              <TouchableOpacity onPress={() => setIsSearching(false)}>
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInputInHeader}
                placeholder="Search reports..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                placeholderTextColor="#ccc"
                selectionColor="#fff"
              />
              <TouchableOpacity onPress={() => setShowFilterModal(true)}>
                <MaterialIcons name="filter-list" size={24} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            // Normal Header Mode
            <>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Reports Dashboard</Text>
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setIsSearching(true)}
                >
                  <MaterialIcons name="search" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowFilterModal(true)}
                >
                  <MaterialIcons name="filter-list" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* FILTER TABS */}
        <View style={styles.filterTabs}>
          {[
            { key: "all", label: "All Reports" },
            { key: "assigned", label: "Assigned to Me" },
            { key: "pending", label: "Pending" },
            { key: "inProgress", label: "In Progress" },
            { key: "resolved", label: "Resolved" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                activeTab === tab.key && styles.activeFilterTab,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeTab === tab.key && styles.activeFilterTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACTIVE QUICK FILTER DISPLAY */}
        {(quickFilter !== "all" || searchQuery) && (
          <View style={styles.activeFilterDisplay}>
            <Text style={styles.activeFilterText}>
              {searchQuery ? `Search: "${searchQuery}"` : ""}
              {searchQuery && quickFilter !== "all" ? " • " : ""}
              {quickFilter === "high"
                ? "High Priority Only"
                : quickFilter === "assigned"
                ? "Assigned to Me"
                : quickFilter === "unresolved"
                ? "Unresolved"
                : quickFilter === "last24h"
                ? "Last 24 Hours"
                : ""}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setQuickFilter("all");
                setSearchQuery("");
              }}
            >
              <MaterialIcons name="close" size={16} color="#1a73e8" />
            </TouchableOpacity>
          </View>
        )}

        {/* REPORTS LIST */}
        <ScrollView
          style={styles.reportsContainer}
          contentContainerStyle={{ paddingBottom: 32 }} // 👈 Ensures gap at the bottom
        >
          {filteredReports.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No reports found</Text>
            </View>
          ) : (
            filteredReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={[
                  styles.reportCard,
                  {
                    backgroundColor:
                      report.status === "resolved" ? "#c8e6c9" : "#fff",
                  },
                ]}
                onPress={() => handleReportPress(report.id)}
              >
                {/* Top Row: Priority + Status + ID + Time Ago */}
                <View style={styles.reportTopRow}>
                  {/* Priority Tag */}
                  <View
                    style={[
                      styles.priorityTag,
                      {
                        backgroundColor:
                          report.priority === "HIGH"
                            ? "#ffcdd2"
                            : report.priority === "MEDIUM"
                            ? "#fff9c4"
                            : "#f5f5f5",
                        borderColor:
                          report.priority === "HIGH"
                            ? "#e53935"
                            : report.priority === "MEDIUM"
                            ? "#f57f17"
                            : "#ccc",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          report.priority === "HIGH"
                            ? "#c62828"
                            : report.priority === "MEDIUM"
                            ? "#f57f17"
                            : "#777",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    >
                      {report.priority}
                    </Text>
                  </View>
                  {/* Status Tag */}
                  <View
                    style={[
                      styles.statusTag,
                      {
                        backgroundColor:
                          report.status === "pending"
                            ? "#ffcdd2"
                            : report.status === "inProgress"
                            ? "#fff9c4"
                            : "#c8e6c9",
                        borderColor:
                          report.status === "pending"
                            ? "#e53935"
                            : report.status === "inProgress"
                            ? "#f57f17"
                            : "#2e7d32",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          report.status === "pending"
                            ? "#c62828"
                            : report.status === "inProgress"
                            ? "#f57f17"
                            : "#2e7d32",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    >
                      {report.status === "pending"
                        ? "Pending"
                        : report.status === "inProgress"
                        ? "In Progress"
                        : "Resolved"}
                    </Text>
                  </View>
                  <Text style={styles.reportId}>#{report.id}</Text>
                  <Text style={styles.timeAgo}>{report.timeAgo}</Text>
                </View>

                {/* Title */}
                <Text style={styles.reportTitle}>{report.title}</Text>

                {/* Location */}
                <View style={styles.locationRow}>
                  <MaterialIcons name="location-on" size={16} color="#777" />
                  <Text style={styles.reportLocation}>{report.location}</Text>
                </View>

                {/* Reporter Info */}
                <View style={styles.reporterRow}>
                  <Image
                    source={{ uri: report.avatar }}
                    style={styles.avatar}
                  />
                  <View style={styles.reporterInfo}>
                    <Text style={styles.reporterName}>{report.reporter}</Text>
                    {report.phone && (
                      <Text style={styles.reporterPhone}>{report.phone}</Text>
                    )}
                  </View>
                </View>

                {/* Assignment Status */}
                <View style={styles.statusNote}>
                  {report.assignedOfficer ? (
                    <>
                      <MaterialIcons name="person" size={16} color="#2e7d32" />
                      <Text style={styles.statusText}>
                        {report.assignedOfficer === currentOfficer.id
                          ? `Assigned to ${currentOfficer.name}`
                          : "Assigned to another officer"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#777"
                      />
                      <Text style={styles.statusText}>Awaiting assignment</Text>
                    </>
                  )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor:
                        report.priority === "HIGH"
                          ? "#e53935"
                          : report.assignedOfficer === currentOfficer.id
                          ? "#8bc34a"
                          : "#6c5ce7",
                    },
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    {report.priority === "HIGH"
                      ? "Respond"
                      : report.assignedOfficer === currentOfficer.id
                      ? "See Details"
                      : "Assign"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* QUICK FILTER MODAL */}
        <Modal
          visible={showFilterModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Quick Filters</Text>
              {[
                { key: "all", label: "All Reports" },
                { key: "high", label: "High Priority Only" },
                { key: "assigned", label: "Assigned to Me" },
                { key: "unresolved", label: "Unresolved" },
                { key: "last24h", label: "Last 24 Hours" },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={styles.modalOption}
                  onPress={() => applyQuickFilter(filter.key)}
                >
                  <Text style={styles.modalOptionText}>{filter.label}</Text>
                  {quickFilter === filter.key && (
                    <MaterialIcons name="check" size={20} color="#1a73e8" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
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
    backgroundColor: "#1a73e8",
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerIcons: {
    flexDirection: "row",
  },
  searchInputInHeader: {
    flex: 1,
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    color: "#333",
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTab: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeFilterTab: {
    backgroundColor: "#1a73e8",
  },
  filterTabText: {
    fontSize: 12,
    color: "#333",
  },
  activeFilterTabText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  activeFilterDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderBottomWidth: 1,
    borderBottomColor: "#bbdefb",
  },
  activeFilterText: {
    fontSize: 14,
    color: "#1a73e8",
    fontWeight: "600",
  },
  reportsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
  reportCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportId: {
    fontSize: 12,
    color: "#777",
  },
  timeAgo: {
    fontSize: 12,
    color: "#777",
    marginLeft: "auto",
  },
  reportTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reportLocation: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  reporterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reporterInfo: {
    flex: 1,
  },
  reporterName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  reporterPhone: {
    fontSize: 12,
    color: "#777",
  },
  statusNote: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#555",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  closeModalButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeModalText: {
    fontSize: 16,
    color: "#1a73e8",
    fontWeight: "bold",
  },
});
