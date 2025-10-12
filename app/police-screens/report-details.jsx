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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import ApiService from "../../services/apiService";

// Helper to format date as readable string
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

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

  // Fetch report from backend
  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getReportById(reportId);
      // Format for frontend
      const formatted = {
        ...data,
        id: data._id,
        title: data.description.substring(0, 50) + (data.description.length > 50 ? "..." : ""),
        reporter: data.full_name || "Anonymous",
        phone: data.contact_number || "",
        location: data.location?.address || `${data.location?.latitude}, ${data.location?.longitude}`,
        createdAt: new Date(data.createdAt).toLocaleString(),
        notes: data.notes || [],
      };
      setReport(formatted);
    } catch (err) {
      setError("Failed to load report");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) fetchReport();
  }, [reportId]);

  const handlePriorityChange = async (newPriority) => {
    try {
      const updated = await ApiService.updateReport(reportId, { priority: newPriority });
      setReport((prev) => ({ ...prev, priority: updated.priority }));
      Alert.alert("Success", "Priority updated");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      // Map frontend status to backend enum
      const statusMap = {
        pending: "Submitted",
        "in-progress": "In Progress",
        resolved: "Resolved",
      };
      const backendStatus = statusMap[newStatus] || "Submitted";

      const updated = await ApiService.updateReport(reportId, { status: backendStatus });
      setReport((prev) => ({
        ...prev,
        status: ApiService.mapStatus(updated.status), // maps back to frontend
      }));
      Alert.alert("Success", "Status updated");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleStartResponse = () => handleStatusChange("in-progress");
  const handleMarkResolved = () => handleStatusChange("resolved");

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }

    try {
      const note = {
        title: newNoteTitle,
        content: newNoteContent,
        officer: "Current Officer", // Replace with real officer name
        timestamp: new Date().toISOString(),
      };

      const updated = await ApiService.updateReport(reportId, {
        $push: { notes: note },
      });

      setReport((prev) => ({
        ...prev,
        notes: updated.notes || [...(prev.notes || []), note],
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
    if (fileUrl.endsWith(".jpg") || fileUrl.endsWith(".png") || fileUrl.endsWith(".jpeg"))
      return "image";
    if (fileUrl.endsWith(".mp4") || fileUrl.endsWith(".mov")) return "movie";
    if (fileUrl.endsWith(".mp3") || fileUrl.endsWith(".wav")) return "mic";
    return "attach-file";
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading report...</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.loading}>
        <Text>{error || "Report not found"}</Text>
        <TouchableOpacity onPress={fetchReport} style={{ marginTop: 16 }}>
          <Text style={{ color: "#1a73e8" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Map backend priority to display
  const displayPriority = report.priority?.toUpperCase() || "MEDIUM";
  const displayStatus = report.status || "pending";

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
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

      {/* Priority + ID + Time */}
      <View style={styles.reportHeader}>
        <View
          style={[
            styles.priorityTag,
            {
              backgroundColor:
                displayPriority === "HIGH"
                  ? "#ffcdd2"
                  : displayPriority === "MEDIUM"
                  ? "#fff9c4"
                  : "#e0e0e0",
              borderColor:
                displayPriority === "HIGH"
                  ? "#e53935"
                  : displayPriority === "MEDIUM"
                  ? "#f57f17"
                  : "#999",
            },
          ]}
        >
          <Text
            style={{
              color:
                displayPriority === "HIGH"
                  ? "#c62828"
                  : displayPriority === "MEDIUM"
                  ? "#f57f17"
                  : "#555",
              fontWeight: "bold",
            }}
          >
            {displayPriority}
          </Text>
        </View>
        <Text style={styles.reportId}>#{report.id}</Text>
        <Text style={styles.timeAgo}>{report.createdAt}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{report.title}</Text>

      {/* Location */}
      <View style={styles.locationRow}>
        <MaterialIcons name="location-on" size={16} color="#777" />
        <Text style={styles.location}>{report.location}</Text>
      </View>

      {/* Reporter Info */}
      <View style={styles.reporterRow}>
        <Image
          source={{ uri: "https://via.placeholder.com/40" }}
          style={styles.avatar}
        />
        <View style={styles.reporterInfo}>
          <Text style={styles.reporterName}>{report.reporter}</Text>
          <Text style={styles.reporterPhone}>{report.phone}</Text>
        </View>
        <TouchableOpacity style={styles.chatButton}>
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Current Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>

        {/* Priority Dropdown */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Priority:</Text>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() =>
                Alert.alert(
                  "Change Priority",
                  "Select new priority",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "High",
                      onPress: () => handlePriorityChange("HIGH"),
                    },
                    {
                      text: "Medium",
                      onPress: () => handlePriorityChange("MEDIUM"),
                    },
                    {
                      text: "Low",
                      onPress: () => handlePriorityChange("LOW"),
                    },
                  ],
                  { cancelable: true }
                )
              }
            >
              <Text style={styles.dropdownText}>{displayPriority}</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#777" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Dropdown */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() =>
                Alert.alert(
                  "Change Status",
                  "Select new status",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Pending",
                      onPress: () => handleStatusChange("pending"),
                    },
                    {
                      text: "In Progress",
                      onPress: () => handleStatusChange("in-progress"),
                    },
                    {
                      text: "Resolved",
                      onPress: () => handleStatusChange("resolved"),
                    },
                  ],
                  { cancelable: true }
                )
              }
            >
              <Text style={styles.dropdownText}>
                {displayStatus === "pending"
                  ? "Pending"
                  : displayStatus === "in-progress"
                  ? "In Progress"
                  : "Resolved"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color="#777" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Assigned Officer */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Assigned Officer:</Text>
          <Text style={styles.statusValue}>Not assigned</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>
      </View>

      {/* Attachments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          {/* Optional: Add attachment button later */}
        </View>
        {report.evidence && report.evidence.length > 0 ? (
          report.evidence.map((att, index) => (
            <View key={index} style={styles.attachmentRow}>
              <MaterialIcons
                name={getAttachmentIcon(att.fileUrl)}
                size={20}
                color="#777"
              />
              <Text style={styles.attachmentName}>
                {att.fileUrl.split("/").pop() || `Attachment ${index + 1}`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Open file in browser or download
                  Alert.alert("Info", "File preview not implemented");
                }}
              >
                <MaterialIcons name="open-in-new" size={20} color="#1a73e8" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No attachments</Text>
        )}
      </View>

      {/* Officer Notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Officer Notes</Text>
          <TouchableOpacity onPress={() => setShowNoteModal(true)}>
            <Text style={styles.addLink}>Add Note</Text>
          </TouchableOpacity>
        </View>

        {report.notes && report.notes.length > 0 ? (
          <FlatList
            data={report.notes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.noteTitleRow}
                onPress={() => viewNote(item)}
              >
                <MaterialIcons name="note" size={16} color="#6c5ce7" />
                <Text style={styles.noteTitleText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No notes added</Text>
        )}
      </View>

      {/* Assignment Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assignment Details</Text>
        </View>
        <View style={styles.assignmentInfo}>
          <Text style={styles.label}>Assigned Officer:</Text>
          <Text style={styles.value}>
            {report.assignedOfficerName || 'Not assigned'}
          </Text>
          <Text style={styles.label}>Assignment Date:</Text>
          <Text style={styles.value}>
            {report.assignedAt ? formatDate(report.assignedAt) : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {displayStatus === "pending" ? (
          <TouchableOpacity style={styles.startResponseButton} onPress={handleStartResponse}>
            <MaterialIcons name="play-arrow" size={20} color="#fff" />
            <Text style={styles.startResponseText}>Start Response</Text>
          </TouchableOpacity>
        ) : displayStatus === "in-progress" ? (
          <TouchableOpacity style={styles.resolveButton} onPress={handleMarkResolved}>
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.bottomActionButton}>
            <MaterialIcons name="call" size={16} color="#333" />
            <Text style={styles.bottomActionText}>Call Reporter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomActionButton}>
            <MaterialIcons name="location-on" size={16} color="#333" />
            <Text style={styles.bottomActionText}>View Location</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Note Modal */}
      <Modal visible={showNoteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.noteModal}>
            <Text style={styles.modalTitle}>Add Note</Text>
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
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setShowNoteModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddNote}>
                <Text style={{ color: "#fff" }}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Note Viewer Modal */}
      <Modal visible={showNoteViewer} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.noteViewer}>
            <Text style={styles.noteViewerTitle}>{selectedNote?.title}</Text>
            <Text style={styles.noteViewerContent}>{selectedNote?.content}</Text>
            <TouchableOpacity
              style={styles.closeViewerButton}
              onPress={() => setShowNoteViewer(false)}
            >
              <Text style={{ color: "#1a73e8" }}>Close</Text>
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportId: {
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
  },
  timeAgo: {
    fontSize: 12,
    color: "#777",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  reporterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  chatButton: {
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addLink: {
    color: "#1a73e8",
    fontWeight: "600",
  },
  descriptionBox: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: "#555",
    marginRight: 8,
    flex: 1,
  },
  dropdown: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#fafafa",
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
  },
  statusValue: {
    fontSize: 14,
    color: "#555",
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
  },
  noteTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  noteTitleText: {
    fontSize: 14,
    color: "#6c5ce7",
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  startResponseButton: {
    backgroundColor: "#6c5ce7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  startResponseText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  resolveButton: {
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resolveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  bottomActionText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noteModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
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
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#6c5ce7",
  },
  noteViewer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  noteViewerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  noteViewerContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 16,
  },
  closeViewerButton: {
    alignSelf: "flex-end",
  },
  assignmentInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  }
});