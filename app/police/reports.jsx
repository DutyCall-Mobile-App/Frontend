// Frontend/app/police/reports.jsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons"; // Add this import
import ApiService from "../../services/apiService";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PoliceReports() {
  const { filter: initialFilter } = useLocalSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(initialFilter || "all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentOfficer, setCurrentOfficer] = useState(null);
  const [officerLoading, setOfficerLoading] = useState(true);

  const fetchOfficer = async () => {
    try {
      const officer = await ApiService.getOfficerDetails();
      setCurrentOfficer({
        id: officer._id,
        name: officer.name || "Officer",
      });
    } catch (error) {
      console.error("failed to load officer details", error);
      // Fallback to prevent crash
      setCurrentOfficer({ id: "Unknown", name: "Officer" });
    } finally {
      setOfficerLoading(false);
    }
  };

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ApiService.getAllReportsForPolice();

      // Transform backend data to match frontend format
      const formattedReports = data.map((report) => ({
        id: report._id,
        title:
          report.description.substring(0, 50) +
          (report.description.length > 50 ? "..." : ""),
        priority: report.priority || "MEDIUM",
        status: ApiService.mapStatus(report.status),
        reporter: report.full_name || "Anonymous",
        phone: report.contact_number || "",
        location:
          report.location?.address ||
          `${report.location?.latitude}, ${report.location?.longitude}`,
        submittedAt: new Date(report.createdAt),
        avatar: "https://via.placeholder.com/40", // Default avatar
        assignedOfficer: report.assignedOfficer || null, //real objectId or null
        assignedOfficerName: report.assignedOfficerName || null,
        assignedToMe: report.assignedToMe,
      }));

      setReports(formattedReports);
      setFilteredReports(formattedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to load reports. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  //Update initial effect
  useEffect(() => {
    Promise.all([fetchOfficer(), fetchReports()]);
  }, []);

  // Format relative time
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  // Filter reports based on active tab and search query
  useEffect(() => {
    if (!reports.length) return;

    let filtered = [...reports];

    // Apply quick filter
    switch (quickFilter) {
      case "high":
        filtered = filtered.filter((report) => report.priority === "HIGH");
        break;
      case "assigned":
        filtered = filtered.filter((report) => report.assignedOfficer !== null);
        break;
      case "unresolved":
        filtered = filtered.filter((report) => report.status !== "resolved");
        break;
      case "last24h":
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter((report) => report.submittedAt > dayAgo);
        break;
      case "Un-Assigned":
        filtered = filtered.filter((report) => !report.assignedOfficer);
        break;
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.location.toLowerCase().includes(query) ||
          report.reporter.toLowerCase().includes(query)
      );
    }

    setFilteredReports(filtered);
  }, [activeTab, quickFilter, searchQuery, reports]);

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, []);

  // Handle report assignment
  const handleAssignReport = async (report) => {
    if (!currentOfficer.id) {
      Alert.alert(
        "Error",
        "Officer details not loaded. Please try again later."
      );
      return;
    }
    try {
      // Assign report to current officer
      await ApiService.assignReportToME(report.id);

      //fetch full updated report (with assigned to populated)
      const fullReport = await ApiService.getReportByIdForPolice(report.id);

      //update local state
      const updatedReports = reports.map((r) =>
        r.id === report.id
          ? {
              ...r,
              assignedOfficer: fullReport.assignedTo?.id || currentOfficer.id,
              assignedOfficerName:
                fullReport.assignedTo?.name || currentOfficer.name,
              assignedToMe: true,
            }
          : r
      );
      setReports(updatedReports);
      setFilteredReports(updatedReports);

      //Navigate using only id
      router.push({
        pathname: "/police-screens/report-details",
        params: { id: fullReport._id },
      });
    } catch (error) {
      Alert.alert("Assignment Failed", error.message);
    }
  };

  // Update the handleReportPress function
  const handleReportPress = async (report) => {
    router.push({
      pathname: "/police-screens/report-details",
      params: { id: report.id },
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading reports...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Function to apply quick filter and close modal
  const applyQuickFilter = (filterKey) => {
    setQuickFilter(filterKey);
    setShowFilterModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
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
            { key: "Un-Assigned", label: "Un-Assigned" },
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
                onPress={() => handleReportPress(report)} // Pass the full report object
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
                        {report.assignedOfficerName === currentOfficer.name
                          ? "Assigned to you"
                          : `Assigned To ${report.assignedOfficerName}`}
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
                      backgroundColor: (() => {
                        if (report.status === "resolved") return "#c8e6c9";
                        if (
                          report.priority === "HIGH" &&
                          !report.assignedOfficer
                        )
                          return "#e53935";
                        if (!report.assignedOfficer) return "#6c5ce7";
                        return "#8bc34a"; // Assigned (any priority)
                      })(),
                    },
                  ]}
                  onPress={() => {
                    if (
                      !report.assignedOfficer &&
                      report.status !== "resolved"
                    ) {
                      //auto assign when click respond or assign
                      handleAssignReport(report);
                    } else {
                      handleReportPress(report);
                    }
                  }}
                >
                  <Text style={styles.actionButtonText}>
                    {report.status === "resolved"
                      ? "View Details"
                      : !report.assignedOfficer
                      ? report.priority === "HIGH"
                        ? "Respond"
                        : "Assign"
                      : "View Details"}
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
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
    fontWeight: "600",
  },
});
