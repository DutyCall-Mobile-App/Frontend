import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router as rootRouter, useRouter } from "expo-router";
import {
  CircleAlert as AlertCircle,
  Bell,
  CircleCheck as CheckCircle,
  ChevronRight,
  FileText,
  MapPin,
  Siren,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import io from "socket.io-client";

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

  const [notifications, setNotifications] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://172.20.10.9:3000/api/notifications");
      setNotifications(res.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  fetchNotifications();

  // Socket.IO connection
  const socket = io("http://172.20.10.9:3000");

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server:", socket.id);
  });

  // Listen for real-time notifications
  socket.on("notification", (data) => {
    console.log("New notification received:", data);
    setNotifications((prev) => [data, ...prev]); // prepend new notification
  });

  return () => {
    socket.disconnect();
  };
}, []);

  // const notifications = [
  //   {
  //     id: 1,
  //     message: "Your report #1023 has been approved by Police HQ",
  //     time: "2 hours ago",
  //     type: "success",
  //   },
  //   {
  //     id: 2,
  //     message: "Status update: Report #1078 now marked as Pending Review",
  //     time: "5 hours ago",
  //     type: "warning",
  //   },
  //   {
  //     id: 3,
  //     message: "Location confirmed for report #1059",
  //     time: "1 day ago",
  //     type: "info",
  //   },
  // ];

  const markAsRead = async (id) => {
  try {
    const res = await axios.patch(`http://172.20.10.9:3000/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? res.data.data : n))
    );
  } catch (error) {
    console.error("Error marking as read:", error);
  }
};

  const handleProfilePress = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileOption = (option) => {
    setShowProfileDropdown(false);
    if (option === "profile") {
      // Navigate to profile page
      router.push("/profile-settings");
    } else if (option === "logout") {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              // Clear any stored data and navigate to login
              // Use root router to navigate to login page
              rootRouter.replace("/");
            },
          },
        ]
      );
    }
  };


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

  const DutyCallBackground = () => {
    const repeatCount = 12;
    const items = [];

    for (let i = 0; i < repeatCount; i++) {
      items.push(
        <Text key={i} style={styles.dutyCallText}>
          DUTY CALL
        </Text>
      );
    }

    return <View style={styles.dutyCallBackground}>{items}</View>;
  };

  return (
    <View style={styles.container}>
      <DutyCallBackground />
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={() => setShowProfileDropdown(false)}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
        >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo-dash.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.profileContainer}>
            <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
              <User size={24} color="#007AFF" />
            </TouchableOpacity>
            {showProfileDropdown && (
              <View style={styles.profileDropdown}>
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => handleProfileOption("profile")}
                >
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dropdownItem} 
                  onPress={() => handleProfileOption("logout")}
                >
                  <Text style={[styles.dropdownText, styles.logoutText]}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <LinearGradient
          colors={["#007AFF", "#5AC8FA"]}
          style={styles.dateTimeCard}
        >
          <View style={styles.dateTimeContent}>
            <Text style={styles.date}>{formatDate(currentDateTime)}</Text>
            <Text style={styles.time}>{formatTime(currentDateTime)}</Text>
            <TouchableOpacity
              style={styles.sosButton}
              onPress={() => router.push("/emergency-sos")}
            >
              <Siren size={24} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
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
            <TouchableOpacity
              key={notification._id} // <-- key stays on TouchableOpacity
              onPress={() => markAsRead(notification._id)} // <-- your handler
            >
              <View
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor:
                      notification.type === "new_report" ? "#E3F2FD" : "#FFF4E6",
                  },
                ]}
              >
                <View style={styles.notificationIcon}>
                  {notification.type === "new_report" ? (
                    <MapPin size={16} color="#007AFF" />
                  ) : (
                    <CheckCircle size={16} color="#32D74B" />
                  )}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        </ScrollView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  overlay: {
    flex: 1,
  },
  dutyCallBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 100,
  },
  dutyCallText: {
    fontSize: 120,
    fontWeight: "900",
    color: "rgba(3, 27, 53, 0.03)",
    textAlign: "center",
    letterSpacing: 8,
    transform: [{ rotate: "-15deg" }],
  },
  scrollContainer: {
    flex: 1,
    zIndex: 1,
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
    width: 50,
    height: 0,
  },
  profileContainer: {
    position: "relative",
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
  profileDropdown: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 120,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a2e",
  },
  logoutText: {
    color: "#FF3B30",
  },
  dateTimeCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    minHeight: 120,
  },
  dateTimeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 16,
  },
  time: {
    fontSize: 24,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.95)",
    flex: 1,
  },
  profileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  sosButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
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
