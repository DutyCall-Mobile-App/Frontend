import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  CircleAlert as AlertCircle,
  Bell,
  CircleCheck as CheckCircle,
  ChevronRight,
  FileText,
  MapPin,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const notifications = [
    {
      id: 1,
      message: "Your report #1023 has been approved by Police HQ",
      time: "2 hours ago",
      type: "success",
    },
    {
      id: 2,
      message: "Status update: Report #1078 now marked as Pending Review",
      time: "5 hours ago",
      type: "warning",
    },
    {
      id: 3,
      message: "Location confirmed for report #1059",
      time: "1 day ago",
      type: "info",
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={16} color="#32D74B" />;
      case "warning":
        return <AlertCircle size={16} color="#FF9500" />;
      default:
        return <MapPin size={16} color="#007AFF" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "#E8F5E8";
      case "warning":
        return "#FFF4E6";
      default:
        return "#E3F2FD";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>Logo</Text>
        <TouchableOpacity style={styles.profileButton}>
          <User size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["#007AFF", "#5AC8FA"]}
        style={styles.dateTimeCard}
      >
        <View style={styles.dateTimeContent}>
          <Text style={styles.date}>{formatDate(currentDateTime)}</Text>
          <Text style={styles.time}>{formatTime(currentDateTime)}</Text>
          <View style={styles.profileIconContainer}>
            <User size={20} color="rgba(255, 255, 255, 0.8)" />
          </View>
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={styles.myReportsButton}
        onPress={() => router.push("/my-reports")}
      >
        <View style={styles.myReportsContent}>
          <FileText size={20} color="#007AFF" />
          <Text style={styles.myReportsText}>My Reports</Text>
        </View>
        <ChevronRight size={20} color="#C7C7CC" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.notificationHeader}>
        <Bell size={20} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.notificationsSection}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        {notifications.map((notification) => (
          <View
            key={notification.id}
            style={[
              styles.notificationCard,
              { backgroundColor: getNotificationColor(notification.type) },
            ]}
          >
            <View style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateTimeCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  dateTimeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 12,
  },
  time: {
    fontSize: 18,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    flex: 1,
  },
  profileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  myReportsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  myReportsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  myReportsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginLeft: 12,
  },
  notificationHeader: {
    alignSelf: "flex-end",
    marginRight: 20,
    marginBottom: 12,
    padding: 8,
  },
  notificationsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "400",
  },
});
