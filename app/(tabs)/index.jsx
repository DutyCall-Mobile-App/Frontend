import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router as rootRouter, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CircleAlert as AlertCircle,
  Bell,
  CircleCheck as CheckCircle,
  ChevronRight,
  FileText,
  MapPin,
  Siren,
  User,
  X,
  AlertTriangle,
  Info,
} from "lucide-react-native";
import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from "react-native";
import io from "socket.io-client";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../utils/theme";
import NotificationModal from "../components/NotificationModal";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Dashboard() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found. Please log in.");
        return;
      }

      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Setup socket connection
  useEffect(() => {
    let socket;

    const setupSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        // Initial fetch
        await fetchNotifications();

        // Setup socket with auth
        socket = io(API_URL, { 
          auth: { token },
          transports: ['websocket'],
        });

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
        });

        socket.on("notification", (notification) => {
          console.log("New notification received:", notification);
          
          // Ensure notification has proper _id
          if (!notification._id && notification.id) {
            notification._id = notification.id;
          }
          
          // Add to notifications list
          setNotifications((prev) => [notification, ...prev]);
          
          // Show alert for new notification
          Alert.alert(
            "New Notification",
            notification.message,
            [{ text: "OK" }],
            { cancelable: true }
          );
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });

        socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        console.log("Socket cleanup: disconnected");
      }
    };
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      console.error("Invalid notification id");
      return;
    }

    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );

    try {
      const token = await AsyncStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking as read:", error.response?.data || error.message);
      
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: false } : n))
      );
      
      Alert.alert("Error", "Failed to mark notification as read");
    }
  };

  // Handle notification press - show modal instead of navigating
  const handleNotificationPress = async (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Show modal with notification details
    setSelectedNotification(notification);
    setShowNotificationModal(true);
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Optimistically remove from UI
            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(
                `${API_URL}/api/notifications/${notificationId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (error) {
              console.error("Error deleting notification:", error);
              // Refetch on error
              await fetchNotifications();
              Alert.alert("Error", "Failed to delete notification");
            }
          },
        },
      ]
    );
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    
    if (unreadIds.length === 0) return;

    // Optimistically update UI
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const token = await AsyncStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      await fetchNotifications(); // Refetch on error
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  // Profile dropdown handlers
  const handleProfilePress = () => setShowProfileDropdown(!showProfileDropdown);

  const handleProfileOption = (option) => {
    setShowProfileDropdown(false);
    if (option === "profile") {
      router.push("/user-profile");
    } else if (option === "logout") {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["token", "role"]);
            } finally {
              rootRouter.replace("/login");
            }
          },
        },
      ]);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_report":
        return <FileText size={20} color="#007AFF" />;
      case "status_update":
        return <CheckCircle size={20} color="#32D74B" />;
      case "warning":
        return <AlertTriangle size={20} color="#FF9500" />;
      case "info":
        return <Info size={20} color="#5AC8FA" />;
      default:
        return <Bell size={20} color="#007AFF" />;
    }
  };

  // Get notification background color
  const getNotificationBgColor = (type, isRead) => {
    if (isRead) {
      return isDarkMode ? "#2C2C2E" : "#F9F9F9";
    }
    
    switch (type) {
      case "new_report":
        return isDarkMode ? "#1A2F47" : "#E3F2FD";
      case "status_update":
        return isDarkMode ? "#1A3D1F" : "#E8F5E9";
      case "warning":
        return isDarkMode ? "#4D3319" : "#FFF4E6";
      case "info":
        return isDarkMode ? "#1A3847" : "#E1F5FE";
      default:
        return isDarkMode ? "#2C2C2E" : "#F5F5F5";
    }
  };

  // Background repeated text
  const DutyCallBackground = () => {
    const items = [];
    for (let i = 0; i < 12; i++) {
      items.push(
        <Text 
          key={i} 
          style={[
            styles.dutyCallText, 
            { color: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(3, 27, 53, 0.03)' }
          ]}
        >
          DUTY CALL
        </Text>
      );
    }
    return <View style={styles.dutyCallBackground}>{items}</View>;
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Bell size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        No notifications yet
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
        You'll see updates about your reports here
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DutyCallBackground />
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setShowProfileDropdown(false)}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
              colors={["#007AFF"]}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logo-dash.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.profileContainer}>
              <TouchableOpacity 
                style={styles.profileButton} 
                onPress={handleProfilePress}
              >
                <User size={24} color="#007AFF" />
              </TouchableOpacity>
              {showProfileDropdown && (
                <View style={[styles.profileDropdown, { backgroundColor: colors.surface }]}>
                  <TouchableOpacity
                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleProfileOption("profile")}
                  >
                    <Text style={[styles.dropdownText, { color: colors.text }]}>
                      Profile
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleProfileOption("logout")}
                  >
                    <Text style={[styles.dropdownText, styles.logoutText]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Date/Time Card */}
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

          {/* My Reports */}
          <TouchableOpacity
            style={[styles.myReportsButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push("/my-reports")}
          >
            <View style={styles.myReportsContent}>
              <FileText size={20} color="#007AFF" />
              <Text style={[styles.myReportsText, { color: colors.text }]}>
                My Reports
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Notifications Section */}
          <View style={styles.notificationsSection}>
            <View style={styles.notificationsHeader}>
              <View style={styles.notificationsTitleContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.markAllReadText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : notifications.length === 0 ? (
              <EmptyState />
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification._id}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.notificationCard,
                      {
                        backgroundColor: getNotificationBgColor(
                          notification.type,
                          notification.isRead
                        ),
                      },
                    ]}
                  >
                    {!notification.isRead && (
                      <View style={styles.unreadIndicator} />
                    )}
                    
                    <View style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </View>

                    <View style={styles.notificationContent}>
                      <Text
                        style={[
                          styles.notificationMessage,
                          { 
                            color: colors.text,
                            fontWeight: notification.isRead ? "400" : "600" 
                          },
                        ]}
                      >
                        {notification.message}
                      </Text>
                      <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                        {formatTimeAgo(notification.createdAt || notification.timestamp)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                    >
                      <X size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </TouchableOpacity>

      {/* Notification Details Modal */}
      <NotificationModal
        visible={showNotificationModal}
        notification={selectedNotification}
        onClose={() => {
          setShowNotificationModal(false);
          setSelectedNotification(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1 },
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
    textAlign: "center",
    letterSpacing: 8,
    transform: [{ rotate: "-15deg" }],
  },
  scrollContainer: { flex: 1, zIndex: 1 },
  contentContainer: { paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: { width: 50, height: 50 },
  profileContainer: { position: "relative" },
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
  },
  dropdownText: { fontSize: 16, fontWeight: "500" },
  logoutText: { color: "#FF3B30" },
  dateTimeCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    minHeight: 120,
  },
  dateTimeContent: { flexDirection: "row", alignItems: "center" },
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
  myReportsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  myReportsContent: { flexDirection: "row", alignItems: "center" },
  myReportsText: { fontSize: 16, fontWeight: "500", marginLeft: 12 },
  notificationsSection: { paddingHorizontal: 20, marginBottom: 20 },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  notificationsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 20, fontWeight: "600" },
  unreadBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  markAllReadText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "flex-start",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadIndicator: {
    position: "absolute",
    left: 8,
    top: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
    marginLeft: 8,
  },
  notificationContent: { flex: 1, paddingRight: 8 },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: { fontSize: 12, fontWeight: "400" },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
});