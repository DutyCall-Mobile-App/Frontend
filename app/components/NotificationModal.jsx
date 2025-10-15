// components/NotificationModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle,
  Info as InfoIcon,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../utils/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function NotificationModal({ visible, notification, onClose }) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    if (visible) {
      // Fetch report details when modal opens
      if (notification?.reportId) {
        fetchReportDetails(notification.reportId);
      }
      
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out animation
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchReportDetails = async (reportId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await axios.get(`${API_URL}/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReport(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching report details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_report":
        return <FileText size={24} color="#007AFF" />;
      case "status_update":
        return <CheckCircle size={24} color="#32D74B" />;
      case "warning":
        return <AlertTriangle size={24} color="#FF9500" />;
      case "info":
        return <InfoIcon size={24} color="#5AC8FA" />;
      default:
        return <FileText size={24} color="#007AFF" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "new_report":
        return "#007AFF";
      case "status_update":
        return "#32D74B";
      case "warning":
        return "#FF9500";
      case "info":
        return "#5AC8FA";
      default:
        return "#007AFF";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
      case "under review":
        return "#FF9500";
      case "in progress":
      case "in_progress":
        return "#007AFF";
      case "action taken":
        return "#5AC8FA";
      case "resolved":
        return "#32D74B";
      default:
        return "#8E8E93";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewFullReport = () => {
    onClose();
    if (report?._id) {
      router.push(`/report-details/${report._id}`);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContainer,
            { 
              backgroundColor: colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getNotificationColor(notification?.type) + "20" },
                ]}
              >
                {getNotificationIcon(notification?.type)}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Notification Details
                </Text>
                <Text style={[styles.headerTime, { color: colors.textSecondary }]}>
                  {formatDate(notification?.createdAt || notification?.timestamp)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Notification Message */}
            <View style={styles.messageSection}>
              <Text style={[styles.messageLabel, { color: colors.textSecondary }]}>
                Message
              </Text>
              <Text style={[styles.messageText, { color: colors.text }]}>
                {notification?.message}
              </Text>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Report Details */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading report details...
                </Text>
              </View>
            ) : report ? (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Report Details
                </Text>

                {/* Category */}
                <View style={styles.detailRow}>
                  <FileText size={20} color={colors.textSecondary} />
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Category
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {report.category}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.detailRow}>
                  <CheckCircle size={20} color={getStatusColor(report.status)} />
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Status
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(report.status) + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(report.status) },
                        ]}
                      >
                        {report.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Location */}
                {report.location?.address && (
                  <View style={styles.detailRow}>
                    <MapPin size={20} color={colors.textSecondary} />
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Location
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {report.location.address}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Date */}
                <View style={styles.detailRow}>
                  <Calendar size={20} color={colors.textSecondary} />
                  <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Reported Date
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatDate(report.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                {report.description && (
                  <View style={styles.descriptionSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Description
                    </Text>
                    <Text
                      style={[styles.descriptionText, { color: colors.text }]}
                      numberOfLines={3}
                    >
                      {report.description}
                    </Text>
                  </View>
                )}

                {/* Evidence Thumbnails */}
                {report.evidence && report.evidence.length > 0 && (
                  <View style={styles.evidenceSection}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Evidence ({report.evidence.length})
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.evidenceScroll}
                    >
                      {report.evidence.slice(0, 4).map((item, index) => (
                        <Image
                          key={index}
                          source={{
                            uri: item.fileUrl.startsWith("http")
                              ? item.fileUrl
                              : `${API_URL}${item.fileUrl}`,
                          }}
                          style={styles.evidenceThumbnail}
                          resizeMode="cover"
                        />
                      ))}
                      {report.evidence.length > 4 && (
                        <View style={styles.moreEvidence}>
                          <Text style={styles.moreEvidenceText}>
                            +{report.evidence.length - 4}
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noReportContainer}>
                <Text style={[styles.noReportText, { color: colors.textSecondary }]}>
                  No report details available
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          {report && (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.footerButton, styles.closeFooterButton]}
                onPress={onClose}
              >
                <Text style={styles.closeFooterButtonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.footerButton, styles.viewButton]}
                onPress={handleViewFullReport}
              >
                <Eye size={18} color="#FFFFFF" />
                <Text style={styles.viewButtonText}>View Full Report</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.80,
    minHeight: SCREEN_HEIGHT * 0.50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  headerTime: {
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageSection: {
    marginBottom: 20,
    paddingTop: 4,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  descriptionSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  evidenceSection: {
    marginTop: 16,
  },
  evidenceScroll: {
    marginTop: 8,
  },
  evidenceThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  moreEvidence: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  moreEvidenceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  noReportContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  noReportText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  closeFooterButton: {
    backgroundColor: "#F0F0F0",
  },
  closeFooterButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  viewButton: {
    backgroundColor: "#007AFF",
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});