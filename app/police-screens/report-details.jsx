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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock report data — will be fetched by ID later
const mockReports = {
  "R2025-0089": {
    id: "R2025-0089",
    title: "Domestic Violence Report",
    priority: "HIGH",
    status: "PENDING",
    reporter: "Sarah Martinez",
    phone: "(555) 123-4567",
    location: "1234 Oak Street, Apt 2B",
    description:
      "Loud argument and sounds of objects being thrown heard from apartment 2B. Neighbor reports hearing a woman screaming for help. Situation appears to be escalating and requires immediate attention.",
    createdAt: "15 min ago",
    assignedOfficer: "Not assigned",
    attachments: [
      {
        name: "evidence_photo_1.jpg",
        type: "image",
        url: "https://via.placeholder.com/300",
      },
      { name: "audio_recording.mp3", type: "audio", url: "" },
    ],
    notes: [
      {
        officer: "Officer Johnson",
        timeAgo: "10 min ago",
        text: "Initial assessment: High priority case. Dispatching unit immediately to the location.",
      },
    ],
    timeline: [
      { action: "Report submitted", timeAgo: "15 minutes ago", icon: "check" },
      {
        action: "Priority set to HIGH",
        timeAgo: "14 minutes ago",
        icon: "flag",
      },
    ],
  },
};

export default function ReportDetails() {
  const { id } = useLocalSearchParams(); // e.g., ?id=R2025-0089
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        // 👉 TODAY: Use mock
        const found = mockReports[id];
        if (!found) {
          Alert.alert("Error", "Report not found");
          router.back();
          return;
        }
        setReport(found);

        // 🔜 FUTURE: Replace with real API call
        // const data = await apiService.getReportById(id);
        // setReport(data);
      } catch (error) {
        console.error("Failed to load report:", error);
        Alert.alert("Error", "Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id]);

  if (loading || !report) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
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
          <View style={[styles.priorityTag, { backgroundColor: "#ffcdd2" }]}>
            <Text style={{ color: "#c62828", fontWeight: "bold" }}>HIGH</Text>
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

        {/* Reporter Info + Chat Button */}
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

        {/* Status Badges */}
        <View style={styles.statusBadges}>
          <View style={styles.badge}>
            <MaterialIcons name="flag" size={16} color="#777" />
            <Text style={styles.badgeText}>Priority</Text>
          </View>
          <View style={styles.badge}>
            <MaterialIcons name="access-time" size={16} color="#777" />
            <Text style={styles.badgeText}>Status</Text>
          </View>
          <View style={styles.badge}>
            <MaterialIcons name="person" size={16} color="#777" />
            <Text style={styles.badgeText}>Assign</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{report.description}</Text>
          </View>
        </View>

        {/* Current Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Priority:</Text>
            <View style={[styles.statusTag, { backgroundColor: "#ffcdd2" }]}>
              <Text style={{ color: "#c62828", fontWeight: "bold" }}>
                {report.priority}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={[styles.statusTag, { backgroundColor: "#fff9c4" }]}>
              <Text style={{ color: "#f57f17", fontWeight: "bold" }}>
                {report.status}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Assigned Officer:</Text>
            <Text style={styles.statusValue}>{report.assignedOfficer}</Text>
          </View>
        </View>

        {/* Attachments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            <TouchableOpacity>
              <Text style={styles.addLink}>Add</Text>
            </TouchableOpacity>
          </View>
          {report.attachments.map((att, index) => (
            <View key={index} style={styles.attachmentRow}>
              <MaterialIcons
                name={att.type === "image" ? "image" : "mic"}
                size={20}
                color="#777"
              />
              <Text style={styles.attachmentName}>{att.name}</Text>
              <TouchableOpacity>
                <MaterialIcons name="download" size={20} color="#777" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Officer Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Officer Notes</Text>
            <TouchableOpacity>
              <Text style={styles.addLink}>Add Note</Text>
            </TouchableOpacity>
          </View>
          {report.notes.map((note, index) => (
            <View key={index} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Image
                  source={{ uri: "https://via.placeholder.com/20" }}
                  style={styles.noteAvatar}
                />
                <Text style={styles.noteOfficer}>{note.officer}</Text>
                <Text style={styles.noteTime}>{note.timeAgo}</Text>
              </View>
              <Text style={styles.noteText}>{note.text}</Text>
            </View>
          ))}
          <View style={styles.noteInput}>
            <Text style={styles.notePlaceholder}>Add your note here...</Text>
          </View>
          <TouchableOpacity style={styles.addNoteButton}>
            <Text style={styles.addNoteButtonText}>Add Note</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {report.timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <MaterialIcons name={item.icon} size={16} color="#1a73e8" />
              <Text style={styles.timelineText}>{item.action}</Text>
              <Text style={styles.timelineTime}>{item.timeAgo}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.startResponseButton}>
            <MaterialIcons name="play-arrow" size={20} color="#fff" />
            <Text style={styles.startResponseText}>Start Response</Text>
          </TouchableOpacity>
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
      </ScrollView>
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
    borderColor: "#e53935",
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
  statusBadges: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: "#555",
    marginLeft: 4,
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
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#555",
    marginRight: 8,
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e53935",
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
  noteCard: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noteAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  noteOfficer: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#2e7d32",
    marginRight: 8,
  },
  noteTime: {
    fontSize: 12,
    color: "#555",
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noteInput: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notePlaceholder: {
    fontSize: 14,
    color: "#777",
  },
  addNoteButton: {
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addNoteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  timelineText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
  },
  timelineTime: {
    fontSize: 12,
    color: "#777",
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
});
