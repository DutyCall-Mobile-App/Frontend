import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  CircleCheck as CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard as Edit,
  MapPin,
  Play,
  Trash2,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ApiService from "../services/apiService";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function ReportDetails() {
  const router = useRouter();
  const { reportId } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch report details from backend
  const fetchReportDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getReportById(reportId);

      // Format the report data
      const formattedReport = ApiService.formatReportForFrontend(data);

      // Create timeline based on status
      const timeline = createTimeline(
        formattedReport.status,
        formattedReport.createdAt
      );

      setReport({
        ...formattedReport,
        timeline,
      });
    } catch (err) {
      console.error("Error fetching report details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  // Create timeline based on current status
  const createTimeline = (currentStatus, createdAt) => {
    const steps = ["Submitted", "Under Review", "In Progress", "Action Taken", "Resolved"];

    return steps.map((status, index) => {
      const completedIndex = steps.indexOf(currentStatus);

      return {
        status,
        date:
          index <= completedIndex
            ? new Date().toISOString().split("T")[0]
            : "",
        time:
          index <= completedIndex
            ? new Date().toLocaleTimeString()
            : "",
        completed: index <= completedIndex,
      };
    });
  };

  // Load report on component mount
  useEffect(() => {
    if (reportId) {
      fetchReportDetails();
    }
  }, [reportId, fetchReportDetails]);

  const handleEdit = () => {
    router.push({
      pathname: "/edit-report",
      params: { reportId },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await ApiService.deleteReport(reportId);
              Alert.alert("Success", "Report deleted successfully", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err) {
              console.error("Error deleting report:", err);
              Alert.alert("Error", `Failed to delete report: ${err.message}`);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
      case "Under Review":
      case "In Progress":
        return "#32D74B";
      case "Action Taken":
        return "#007AFF";
      case "Resolved":
        return "#32D74B";
      default:
        return "#E5E5EA";
    }
  };

  const FILE_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

  const formatStatusTitle = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Report Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <Edit size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, deleting && styles.disabledButton]}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size={20} color="#FF3B30" />
            ) : (
              <Trash2 size={20} color="#FF3B30" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading report details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchReportDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !report ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Report not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.reportCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.reportId, { color: colors.textSecondary }]}>#{report.id}</Text>
            <Text style={[styles.reportTitle, { color: colors.text }]}>{report.title}</Text>
            <Text style={styles.reportCategory}>{report.category}</Text>

            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <MapPin size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{report.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {new Date(report.date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>{report.description}</Text>

            {/* Evidence Section */}
            {report.evidence && report.evidence.length > 0 && (
              <View style={styles.evidenceSection}>
                <Text style={[styles.evidenceTitle, { color: colors.text }]}>Evidence</Text>
                <FlatList
                  data={report.evidence}
                  horizontal
                  keyExtractor={(item, index) => index.toString()}
                  style={styles.evidenceList}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={styles.evidenceContainer}>
                      <Image
                        source={{
                          uri:
                            item.fileUrl.startsWith("http") || item.fileUrl.startsWith("file://")
                              ? item.fileUrl
                              : `${FILE_BASE_URL}${item.fileUrl.startsWith("/") ? item.fileUrl : "/" + item.fileUrl}`
                        }}
                        style={styles.evidenceThumbnail}
                        resizeMode="cover"
                      />

                      {item.fileType === "video" && (
                        <View style={styles.playIconOverlay}>
                          <Play size={16} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  )}
                />
              </View>
            )}
          </View>

          <View style={[styles.timelineCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.timelineTitle, { color: colors.text }]}>Status Timeline</Text>

            {report.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIndicator,
                      {
                        backgroundColor: item.completed
                          ? getStatusColor(item.status)
                          : (isDarkMode ? colors.border : "#E5E5EA"),
                      },
                    ]}
                  >
                    {item.completed ? (
                      <CheckCircle size={12} color="#FFFFFF" />
                    ) : (
                      <Clock size={12} color={colors.textSecondary} />
                    )}
                  </View>
                  {index < report.timeline.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: item.completed
                            ? getStatusColor(item.status)
                            : (isDarkMode ? colors.border : "#E5E5EA"),
                        },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.timelineRight}>
                  <Text
                    style={[
                      styles.timelineStatus,
                      { color: item.completed ? colors.text : colors.textSecondary },
                    ]}
                  >
                    {formatStatusTitle(item.status)}
                  </Text>
                  {item.date && (
                    <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                      {new Date(item.date).toLocaleDateString()} at {item.time}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  reportId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    lineHeight: 28,
  },
  reportCategory: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 16,
  },
  metaInfo: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 16,
  },
  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    height: 32,
    marginTop: 4,
  },
  timelineRight: {
    flex: 1,
    paddingTop: 2,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: "#8E8E93",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  evidenceSection: {
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 16,
    marginTop: 16,
  },
  evidenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  evidenceList: {
    marginTop: 8,
  },
  evidenceContainer: {
    position: "relative",
    marginRight: 12,
  },
  evidenceThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  playIconOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
