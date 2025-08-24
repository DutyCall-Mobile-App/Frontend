import { useRouter } from "expo-router";
import {
  TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle,
  ChevronLeft,
  Clock,
  Circle as XCircle,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const reports = [
  {
    id: "1023",
    title: "Broken streetlights in public areas",
    status: "approved",
    date: "2024-01-15",
    category: "Infrastructure & Road Safety",
    location: "Main Street, Downtown",
  },
  {
    id: "1078",
    title: "Suspicious activity / persons",
    status: "pending",
    date: "2024-01-12",
    category: "Public Safety & Security",
    location: "Park Avenue",
  },
  {
    id: "1059",
    title: "Illegal dumping / garbage accumulation",
    status: "in-progress",
    date: "2024-01-10",
    category: "Environmental Concerns",
    location: "5th Avenue",
  },
  {
    id: "1045",
    title: "Potholes or road hazards",
    status: "rejected",
    date: "2024-01-08",
    category: "Infrastructure & Road Safety",
    location: "Highway 101",
  },
];

export default function MyReports() {
  const router = useRouter();

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#32D74B";
      case "pending":
        return "#FF9500";
      case "in-progress":
        return "#007AFF";
      case "rejected":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} color="#32D74B" />;
      case "pending":
        return <Clock size={16} color="#FF9500" />;
      case "in-progress":
        return <AlertTriangle size={16} color="#007AFF" />;
      case "rejected":
        return <XCircle size={16} color="#FF3B30" />;
      default:
        return <Clock size={16} color="#8E8E93" />;
    }
  };

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>My Reports</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => handleReportPress(report.id)}
          >
            <View style={styles.reportHeader}>
              <Text style={styles.reportId}>#{report.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(report.status)}20` },
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

            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportCategory}>{report.category}</Text>
            <Text style={styles.reportLocation}>{report.location}</Text>

            <View style={styles.reportFooter}>
              <Text style={styles.reportDate}>
                {new Date(report.date).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
});
