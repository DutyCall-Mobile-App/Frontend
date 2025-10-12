import { useRouter } from "expo-router";
import {
  TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle,
  ChevronLeft,
  Clock,
  Circle as XCircle,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ApiService from "../services/apiService";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function MyReports() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllReports();

      // Format the data for frontend use
      const formattedReports = data.map((report) =>
        ApiService.formatReportForFrontend(report)
      );
      setReports(formattedReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  // Load reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  const STATUS_COLORS = {
    "Submitted": "#32D74B",
    "Under Review": "#FF9500",
    "In Progress": "#007AFF",
    "Action Taken": "#007AFF",
    "Resolved": "#32D74B",
    "Rejected": "#FF3B30", // optional if your backend has rejected
  };
  const STATUS_ICONS = {
    "Submitted": <CheckCircle size={16} color="#32D74B" />,
    "Under Review": <Clock size={16} color="#FF9500" />,
    "In Progress": <AlertTriangle size={16} color="#007AFF" />,
    "Action Taken": <AlertTriangle size={16} color="#007AFF" />,
    "Resolved": <CheckCircle size={16} color="#32D74B" />,
    "Rejected": <XCircle size={16} color="#FF3B30" />,
  };

  const getStatusColor = (status) => STATUS_COLORS[status] || "#8E8E93";
  const getStatusIcon = (status) => STATUS_ICONS[status] || <Clock size={16} color="#8E8E93" />;


  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
  };

  const handleReportPress = (reportId) => {
    router.push({
      pathname: "/report-details",
      params: { reportId },
    });
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
        <Text style={[styles.title, { color: colors.text }]}>My Reports</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading reports...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No reports found</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Your submitted reports will appear here
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[styles.reportCard, { backgroundColor: colors.surface }]}
              onPress={() => handleReportPress(report.id)}
            >
              <View style={styles.reportHeader}>
                <Text style={[styles.reportId, { color: colors.textSecondary }]}>#{report.id.slice(-4)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(report.status)}20` }, // light alpha background
                  ]}
                >
                  {getStatusIcon(report.status)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(report.status) },
                    ]}
                  >
                    {formatStatus(report.status)}
                  </Text>
                </View>
              </View>

              <Text style={[styles.reportTitle, { color: colors.text }]}>{report.title}</Text>
              <Text style={styles.reportCategory}>{report.category}</Text>
              <Text style={[styles.reportLocation, { color: colors.textSecondary }]}>{report.location}</Text>

              <View style={[styles.reportFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.reportDate, { color: colors.textSecondary }]}>
                  {new Date(report.date).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reportId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    textTransform: "capitalize",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    lineHeight: 22,
  },
  reportCategory: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  reportFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    paddingTop: 12,
  },
  reportDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
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
    paddingVertical: 50,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});
