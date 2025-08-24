import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  CircleCheck as CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard as Edit,
  MapPin,
  Trash2,
} from "lucide-react-native";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReportDetails() {
  const router = useRouter();
  const { reportId } = useLocalSearchParams();

  const report = {
    id: reportId,
    title: "Broken streetlights in public areas",
    status: "approved",
    date: "2024-01-15",
    category: "Infrastructure & Road Safety",
    location: "Main Street, Downtown",
    description:
      "Several streetlights are not working on Main Street between 5th and 7th Avenue. This creates a safety hazard for pedestrians and drivers during nighttime hours.",
    timeline: [
      {
        status: "submitted",
        date: "2024-01-15",
        time: "09:30 AM",
        completed: true,
      },
      {
        status: "reviewed",
        date: "2024-01-16",
        time: "02:15 PM",
        completed: true,
      },
      {
        status: "approved",
        date: "2024-01-17",
        time: "11:45 AM",
        completed: true,
      },
      {
        status: "in-progress",
        date: "2024-01-18",
        time: "08:00 AM",
        completed: false,
      },
      { status: "resolved", date: "", time: "", completed: false },
    ],
  };

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
          onPress: () => {
            // Handle delete logic here
            router.back();
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
      case "reviewed":
      case "approved":
        return "#32D74B";
      case "in-progress":
        return "#007AFF";
      case "resolved":
        return "#32D74B";
      default:
        return "#E5E5EA";
    }
  };

  const formatStatusTitle = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
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
        <Text style={styles.title}>Report Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <Edit size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Trash2 size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.reportCard}>
          <Text style={styles.reportId}>#{report.id}</Text>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportCategory}>{report.category}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{report.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={16} color="#8E8E93" />
              <Text style={styles.metaText}>
                {new Date(report.date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{report.description}</Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Status Timeline</Text>

          {report.timeline.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIndicator,
                    {
                      backgroundColor: item.completed
                        ? getStatusColor(item.status)
                        : "#E5E5EA",
                    },
                  ]}
                >
                  {item.completed ? (
                    <CheckCircle size={12} color="#FFFFFF" />
                  ) : (
                    <Clock size={12} color="#8E8E93" />
                  )}
                </View>
                {index < report.timeline.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: item.completed
                          ? getStatusColor(item.status)
                          : "#E5E5EA",
                      },
                    ]}
                  />
                )}
              </View>

              <View style={styles.timelineRight}>
                <Text
                  style={[
                    styles.timelineStatus,
                    { color: item.completed ? "#000000" : "#8E8E93" },
                  ]}
                >
                  {formatStatusTitle(item.status)}
                </Text>
                {item.date && (
                  <Text style={styles.timelineDate}>
                    {new Date(item.date).toLocaleDateString()} at {item.time}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
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
});
