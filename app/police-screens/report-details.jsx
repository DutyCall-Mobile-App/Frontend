// Frontend/app/police-screens/report-details.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import ApiService from "../../services/apiService";

// Dropdown component for priority/status
const Dropdown = ({ label, value, options, onSelect, editable = true }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <Pressable
        style={[styles.dropdownButton, !editable && styles.dropdownDisabled]}
        onPress={() => editable && setVisible(true)}
        disabled={!editable}
      >
        <Text style={styles.dropdownValue}>{value}</Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color="#666"
          style={{ marginRight: -8 }}
        />
      </Pressable>

      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.centeredOverlay}>
          <View style={styles.dropdownModalCentered}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.dropdownOption}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Officer selection modal
const OfficerSelectionModal = ({ visible, officers, onSelect, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.officerModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign Officer</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={officers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.officerOption}
                onPress={() => onSelect(item._id)}
              >
                <View>
                  <Text style={styles.officerName}>{item.name}</Text>
                  <Text style={styles.officerBadge}>
                    Badge: {item.badgeNumber}
                  </Text>
                </View>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

export default function ReportDetails() {
  const params = useLocalSearchParams();
  const reportId = params.id;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteViewer, setShowNoteViewer] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [currentOfficerName, setCurrentOfficerName] = useState("Officer");

  // Fetch report and officers
  const fetchReport = async () => {
    try {
      setLoading(true);
      setTimelineLoading(true);
      const fullReport = await ApiService.getReportByIdForPolice(reportId);
      const timelineData = await ApiService.getReportTimelineForPolice(
        reportId
      );
      setTimeline(timelineData);
      setReport({
        ...fullReport,
        id: fullReport._id,
        title:
          fullReport.description.substring(0, 50) +
          (fullReport.description.length > 50 ? "..." : ""),
        reporter: fullReport.full_name || "Anonymous",
        phone: fullReport.contact_number || "N/A",
        location:
          fullReport.location?.address ||
          `${fullReport.location?.latitude}, ${fullReport.location?.longitude}`,
        createdAt: new Date(fullReport.createdAt).toLocaleString(),
        assignedOfficerName: fullReport.assignedTo?.name || "Not assigned",
        assignedAt: fullReport.assignedAt
          ? new Date(fullReport.assignedAt).toLocaleString()
          : "N/A",
        evidence: fullReport.evidence || [],
        notes: fullReport.notes || [],
      });
    } catch (err) {
      setError("Failed to load report details.");
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
      setTimelineLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const officersList = await ApiService.getAllOfficers();
      setOfficers(officersList);
    } catch (err) {
      Alert.alert("Error", "Failed to load officer list");
    }
  };

  //fetch officer name
  useEffect(() => {
    const loadOfficer = async () => {
      try {
        const officer = await ApiService.getOfficerDetails();
        setCurrentOfficerName(officer.name || "Officer");
      } catch (err) {
        console.error("Failed to load officer name");
      }
    };
    loadOfficer();
  }, []);

  useEffect(() => {
    if (reportId) {
      fetchReport();
      fetchOfficers();
    }
  }, [reportId]);

  // === UPDATE HANDLERS ===
  const updatePriority = async (newPriority) => {
    try {
      const updated = await ApiService.updateReportPriorityForPolice(
        reportId,
        newPriority
      );
      setReport((prev) => ({ ...prev, priority: updated.priority }));
      Alert.alert("Success", "Priority updated");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const updated = await ApiService.updateReportStatusForPolice(
        reportId,
        newStatus
      );
      setReport((prev) => ({ ...prev, status: updated.status }));
      Alert.alert("Success", "Status updated");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const assignOfficer = async (officerId) => {
    try {
      await ApiService.updateReportFieldsForPolice(reportId, {
        assignedTo: officerId,
      });
      const updated = await ApiService.getReportByIdForPolice(reportId);
      setReport({
        ...updated,
        id: updated._id,
        assignedOfficerName: updated.assignedTo?.name || "Not assigned",
        assignedAt: updated.assignedAt
          ? new Date(updated.assignedAt).toLocaleString()
          : "N/A",
      });
      setShowOfficerModal(false);
      Alert.alert("Success", "Officer assigned");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }
    try {
      const note = {
        title: newNoteTitle,
        content: newNoteContent,
        officer: currentOfficerName,
        timestamp: new Date().toISOString(),
      };
      const updated = await ApiService.addNoteToReportForPolice(reportId, note);
      setReport((prev) => ({
        ...prev,
        notes: updated.notes,
      }));
      setShowNoteModal(false);
      setNewNoteTitle("");
      setNewNoteContent("");
      Alert.alert("Success", "Note added");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const viewNote = (note) => {
    setSelectedNote(note);
    setShowNoteViewer(true);
  };

  const getAttachmentIcon = (fileUrl) => {
    if (!fileUrl) return "description";
    if (
      fileUrl.endsWith(".jpg") ||
      fileUrl.endsWith(".png") ||
      fileUrl.endsWith(".jpeg")
    )
      return "image";
    if (fileUrl.endsWith(".mp4") || fileUrl.endsWith(".mov")) return "movie";
    if (fileUrl.endsWith(".mp3") || fileUrl.endsWith(".wav")) return "mic";
    return "attach-file";
  };

  // === ACTION BUTTON LOGIC ===
  const renderActionButton = () => {
    const backendStatus = report.status;
    if (backendStatus === "Resolved") {
      return (
        <TouchableOpacity
          style={styles.reinvestigateButton}
          onPress={() => updateStatus("In Progress")}
        >
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Re-investigate</Text>
        </TouchableOpacity>
      );
    } else if (
      backendStatus === "Submitted" ||
      backendStatus === "Under Review"
    ) {
      return (
        <TouchableOpacity
          style={styles.startResponseButton}
          onPress={() => updateStatus("In Progress")}
        >
          <MaterialIcons name="play-arrow" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Start Response</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.resolveButton}
          onPress={() => updateStatus("Resolved")}
        >
          <MaterialIcons name="check" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Mark as Resolved</Text>
        </TouchableOpacity>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Report not found"}</Text>
        <TouchableOpacity onPress={fetchReport} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // === UI RENDERING ===
  const priorityOptions = [
    { label: "High", value: "HIGH" },
    { label: "Medium", value: "MEDIUM" },
    { label: "Low", value: "LOW" },
  ];

  const statusOptions = [
    { label: "Submitted", value: "Submitted" },
    { label: "Under Review", value: "Under Review" },
    { label: "In Progress", value: "In Progress" },
    { label: "Action Taken", value: "Action Taken" },
    { label: "Resolved", value: "Resolved" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Details</Text>
          <TouchableOpacity onPress={() => Alert.alert("Menu", "More options")}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Report Summary */}
        <View style={styles.card}>
          <View style={styles.reportHeader}>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{report.priority}</Text>
            </View>
            <Text style={styles.reportId}>#{report.id}</Text>
            <Text style={styles.timeAgo}>{report.createdAt}</Text>
          </View>
          <Text style={styles.title}>{report.title}</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={18} color="#4CAF50" />
            <Text style={styles.location}>
              {typeof report.location === "string"
                ? report.location
                : report.location?.address
                ? report.location.address
                : `${report.location?.latitude ?? ""}, ${
                    report.location?.longitude ?? ""
                  }`}
            </Text>
          </View>
        </View>

        {/* Reporter Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reporter Information</Text>
          <View style={styles.reporterRow}>
            <Image
              source={{ uri: "https://via.placeholder.com/50" }}
              style={styles.avatar}
            />
            <View style={styles.reporterInfo}>
              <Text style={styles.reporterName}>{report.reporter}</Text>
              <Text style={styles.reporterPhone}>{report.phone}</Text>
            </View>
          </View>
        </View>

        {/* Status & Assignment */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status & Assignment</Text>

          <Dropdown
            label="Priority"
            value={report.priority}
            options={priorityOptions}
            onSelect={updatePriority}
          />

          <Dropdown
            label="Status"
            value={report.status}
            options={statusOptions}
            onSelect={updateStatus}
          />

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Assigned Officer</Text>
            <TouchableOpacity onPress={() => setShowOfficerModal(true)}>
              <View style={styles.assignedOfficerButton}>
                <Text style={styles.assignedOfficerText}>
                  {report.assignedOfficerName}
                </Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={16}
                  color="#1a73e8"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>

        {/* Attachments */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Attachments ({report.evidence.length})
          </Text>
          {report.evidence.length > 0 ? (
            <FlatList
              data={report.evidence}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.attachmentItem}>
                  <MaterialIcons
                    name={getAttachmentIcon(item.fileUrl)}
                    size={24}
                    color="#666"
                  />
                  <Text style={styles.attachmentName}>
                    {item.fileUrl.split("/").pop()}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No attachments</Text>
          )}
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>
              Officer Notes ({report.notes.length})
            </Text>
            <TouchableOpacity onPress={() => setShowNoteModal(true)}>
              <Text style={styles.addNoteButton}>Add Note</Text>
            </TouchableOpacity>
          </View>
          {report.notes.length > 0 ? (
            <FlatList
              data={report.notes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.noteItem}
                  onPress={() => viewNote(item)}
                >
                  <Text style={styles.noteTitle}>{item.title}</Text>
                  <Text style={styles.noteContent} numberOfLines={2}>
                    {item.content}
                  </Text>
                  <Text style={styles.noteOfficer}>By: {item.officer}</Text>
                  <Text style={styles.noteTimestamp}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No notes added</Text>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Report Timeline</Text>
          {timelineLoading ? (
            <Text style={styles.emptyText}>Loading timeline...</Text>
          ) : timeline.length > 0 ? (
            <FlatList
              data={timeline}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <MaterialIcons
                      name={
                        item.type === "created"
                          ? "add-circle"
                          : item.type === "assigned"
                          ? "person"
                          : item.type === "status"
                          ? "update"
                          : item.type === "priority"
                          ? "priority-high"
                          : "note"
                      }
                      size={20}
                      color="#1a73e8"
                    />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineMessage}>{item.message}</Text>
                    <Text style={styles.timelineOfficer}>
                      By: {item.officer}
                    </Text>
                    <Text style={styles.timelineTime}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No timeline events</Text>
          )}
        </View>

        {/* Action Button */}
        <View style={styles.actionButtonContainer}>{renderActionButton()}</View>
      </ScrollView>

      {/* Note Modals */}
      <Modal visible={showNoteModal} animationType="slide" transparent>
        <Pressable
          style={styles.overlay}
          onPress={() => setShowNoteModal(false)}
        >
          <View style={styles.noteModal}>
            <Text style={styles.noteModalTitle}>Add Note</Text>
            <TextInput
              style={styles.input}
              placeholder="Note Title"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Note Content"
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNoteModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddNote}
              >
                <Text style={{ color: "#fff" }}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showNoteViewer} animationType="fade" transparent>
        <Pressable
          style={styles.overlay}
          onPress={() => setShowNoteViewer(false)}
        >
          <View style={styles.noteViewer}>
            <Text style={styles.noteViewerTitle}>{selectedNote?.title}</Text>
            <Text style={styles.noteViewerContent}>
              {selectedNote?.content}
            </Text>
            <TouchableOpacity
              style={styles.closeViewerButton}
              onPress={() => setShowNoteViewer(false)}
            >
              <Text style={{ color: "#1a73e8" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Officer Selection Modal */}
      <OfficerSelectionModal
        visible={showOfficerModal}
        officers={officers}
        onSelect={assignOfficer}
        onClose={() => setShowOfficerModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#ffebee",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f44336",
  },
  priorityText: {
    color: "#d32f2f",
    fontWeight: "600",
    fontSize: 12,
  },
  reportId: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 12,
    color: "#999",
    marginLeft: "auto",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  location: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  reporterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  reporterInfo: {
    flex: 1,
  },
  reporterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reporterPhone: {
    fontSize: 14,
    color: "#666",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#555",
  },
  assignedOfficerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  assignedOfficerText: {
    fontSize: 14,
    color: "#1a73e8",
    fontWeight: "500",
  },
  descriptionText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 120,
  },
  attachmentName: {
    fontSize: 13,
    color: "#555",
    marginLeft: 8,
    flex: 1,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addNoteButton: {
    color: "#1a73e8",
    fontWeight: "600",
    fontSize: 14,
  },
  noteItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#1a73e8",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  noteTimestamp: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
  actionButtonContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  startResponseButton: {
    backgroundColor: "#1a73e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
  },
  resolveButton: {
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
  },
  reinvestigateButton: {
    backgroundColor: "#f57f17",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    fontWeight: "500",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownValue: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  dropdownDisabled: {
    opacity: 0.6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  // Add new styles for centered dropdown modal
  centeredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModalCentered: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 320,
    elevation: 5,
  },
  dropdownModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dropdownModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  dropdownModal: {
    backgroundColor: "#fff",
    maxHeight: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownOptionText: {
    fontSize: 15,
    color: "#333",
  },
  // Officer modal
  officerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  officerOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  officerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  officerBadge: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  // Note modal
  noteModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: "auto",
  },
  noteModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#1a73e8",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  noteViewerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: "auto",
  },
  noteViewerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  noteViewerContent: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 16,
  },
  closeViewerButton: {
    alignSelf: "flex-end",
  },
  // Loading/Error
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  noteOfficer: {
    fontSize: 12,
    color: "#6c5ce7",
    fontStyle: "italic",
    marginBottom: 4,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineIcon: {
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  timelineOfficer: {
    fontSize: 12,
    color: "#6c5ce7",
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 11,
    color: "#999",
  },
});
