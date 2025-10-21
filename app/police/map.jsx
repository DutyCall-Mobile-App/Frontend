// Frontend/app/police/map.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import ApiService from "../../services/apiService";
import { router, usePathname } from "expo-router";

// Add these helper functions at the top of your file
const CLUSTER_RADIUS = 50000; // meters
const TIME_WINDOW = 30 * 60 * 1000; // 30 minutes in milliseconds

// Function to calculate distance between two points in meters
const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Function to find report clusters
const findReportClusters = (reports) => {
  const now = new Date();
  const clusters = [];

  // Filter reports within time window
  const recentReports = reports.filter(
    (report) => now - new Date(report.submittedAt) <= TIME_WINDOW
  );

  recentReports.forEach((report) => {
    let foundCluster = false;

    // Check existing clusters
    for (const cluster of clusters) {
      const distance = calculateDistanceInMeters(
        cluster.center.latitude,
        cluster.center.longitude,
        report.latitude,
        report.longitude
      );

      if (distance <= CLUSTER_RADIUS) {
        cluster.reports.push(report);
        // Recalculate cluster center
        cluster.center = {
          latitude:
            cluster.reports.reduce((sum, r) => sum + r.latitude, 0) /
            cluster.reports.length,
          longitude:
            cluster.reports.reduce((sum, r) => sum + r.longitude, 0) /
            cluster.reports.length,
        };
        foundCluster = true;
        break;
      }
    }

    // Create new cluster if not found in existing ones
    if (!foundCluster) {
      clusters.push({
        center: {
          latitude: report.latitude,
          longitude: report.longitude,
        },
        reports: [report],
      });
    }
  });

  // Return only clusters with 3 or more reports
  return clusters.filter((cluster) => cluster.reports.length >= 3);
};

// 📏 Calculate straight-line distance (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ⏱️ Mock drive time (in minutes) — replace with Google Distance Matrix later
const estimateDriveTime = (distanceKm) => {
  const timeInHours = distanceKm / 30; // Assume 30 km/h in city
  return Math.max(1, Math.round(timeInHours * 60));
};

export default function PoliceMapScreen() {
  const { height } = Dimensions.get("window");
  const insets = useSafeAreaInsets(); // 👈 Get safe area insets
  const bottomInset = insets.bottom || 20; // Fallback to 20 if 0

  // Calculate usable height (excluding bottom nav bar)
  const usableHeight = height - insets.top - bottomInset;
  const mapHeight = usableHeight * 0.75; // 75% of usable space

  const [activeFilter, setActiveFilter] = useState("all");
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  // Updated snap points using pixel values
  const snapPoints = useMemo(() => ["10%", "60%"], []);
  const [officerLocation, setOfficerLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.9271, // Colombo center
    longitude: 79.8612,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentOfficerId, setCurrentOfficerId] = useState(null);

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ApiService.getAllReportsForPolice();

      // Transform reports to include coordinates
      const formattedReports = data.map((report) => ({
        id: report._id,
        title:
          report.description.substring(0, 50) +
          (report.description.length > 50 ? "..." : ""),
        priority: report.priority || "MEDIUM",
        status: report.status || "Submitted",
        assignedOfficer: report.assignedOfficer || null, // Add officer assignment logic later
        assignedOfficerName: report.assignedOfficerName || "N/A",
        latitude: report.location?.latitude,
        longitude: report.location?.longitude,
        submittedAt: new Date(report.createdAt),
      }));

      setReports(formattedReports);

      // Find and set clusters
      const reportClusters = findReportClusters(formattedReports);
      setClusters(reportClusters);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter reports based on active filter
  const filteredReports = useMemo(() => {
    if (!reports.length) return [];

    switch (activeFilter) {
      case "active":
        return reports.filter(
          (report) =>
            report.status === "pending" || report.status === "inProgress"
        );
      case "assigned":
        return reports.filter(
          (report) =>
            report.assignedOfficer &&
            report.assignedOfficer.toString() ===
              currentOfficerId /* TODO: replace with actual officer ID */
        );
      default:
        return reports;
    }
  }, [reports, activeFilter, currentOfficerId]);

  // Add distance & drive time to reports when officer location is available
  const reportsWithDistance = useMemo(() => {
    if (!officerLocation) return filteredReports;

    return filteredReports.map((report) => {
      const distanceKm = calculateDistance(
        officerLocation.latitude,
        officerLocation.longitude,
        report.latitude,
        report.longitude
      );

      return {
        ...report,
        distance:
          distanceKm < 1
            ? `${Math.round(distanceKm * 1000)} m`
            : `${distanceKm.toFixed(1)} km`,
        driveTime: `${estimateDriveTime(distanceKm)} min`,
      };
    });
  }, [filteredReports, officerLocation]);

  // 🔹 Get officer location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setOfficerLocation(coords);
        setMapRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      }
    })();
  }, []);

  // Initial fetch of reports
  useEffect(() => {
    fetchReports();
  }, []);

  // 🔹 Open native maps
  const openMaps = (latitude, longitude) => {
    try {
      let url;
      if (Platform.OS === "ios") {
        url = `maps://?daddr=${latitude},${longitude}`;
      } else {
        url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
      }
      Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open maps:", error);
      Alert.alert("Navigation Error", "Could not open maps app.");
    }
  };

  // 🔹 Handle pin tap
  const handlePinPress = (report) => {
    setSelectedReport(report);
  };

  // 🔹 Handle report card press
  const handleReportCardPress = (report) => {
    mapRef.current?.animateToRegion({
      latitude: report.latitude,
      longitude: report.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // 🔹 Get pin color
  const getPinColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "#FF3B30";
      case "MEDIUM":
        return "#FF9500";
      default:
        return "#34C759";
    }
  };

  // 🔹 Center map to officer's location
  const centerToOfficer = () => {
    if (officerLocation) {
      mapRef.current?.animateToRegion({
        ...officerLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  //render
  const renderItem = useCallback(
    (item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.reportCard}
        onPress={() => {
          mapRef.current?.animateToRegion({
            latitude: item.latitude,
            longitude: item.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          bottomSheetRef.current?.snapToIndex(0); // Collapse bottom sheet
          // Do NOT setSelectedReport here
        }}
      >
        <View
          style={[
            styles.priorityDot,
            {
              backgroundColor:
                item.priority === "HIGH"
                  ? "#dc3545"
                  : item.priority === "MEDIUM"
                  ? "#ffc107"
                  : "#28a745",
            },
          ]}
        />
        <View style={styles.reportInfo}>
          <Text style={styles.reportId}>#{item.id}</Text>
          <Text style={styles.reportTitle}>{item.title}</Text>
          <View style={styles.reportMeta}>
            <Text style={styles.officerName}>{item.assignedOfficerName}</Text>
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  // 🔹 Handle bottom sheet changes
  const handleSheetChanges = useCallback((index) => {
    console.log("Bottom sheet index:", index);
  }, []);

  // TODO: Replace with actual officer ID from authentication/user context
  useEffect(() => {
    const loadOfficerId = async () => {
      try {
        const officer = await ApiService.getOfficerDetails();
        setCurrentOfficerId(officer._id);
      } catch (error) {
        console.error("Error fetching officer details:", error);
      }
    };
    loadOfficerId();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Status Bar Spacer */}
        <View style={styles.statusBarSpacer} />

        {/* Header (Below Status Bar) */}
        <View style={styles.header}>
          <Text style={styles.title}>Live Map</Text>
        </View>

        {/* Filter Tabs (Pill-Shaped, Like Google Maps) */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "all" && styles.filterTabTextActive,
              ]}
            >
              All Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "active" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("active")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "active" && styles.filterTabTextActive,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "assigned" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("assigned")}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === "assigned" && styles.filterTabTextActive,
              ]}
            >
              Assigned to Me
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          provider="google"
          style={[styles.map, { height: mapHeight }]}
          initialRegion={mapRegion}
        >
          {/* Render officer location with custom icon */}
          {officerLocation && (
            <Marker coordinate={officerLocation} title="Your Location">
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                {/* Outer halo */}
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(26, 115, 232, 0.2)",
                    position: "absolute",
                  }}
                />
                {/* Inner blue dot */}
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: "#1a73e8",
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
              </View>
            </Marker>
          )}

          {/* Render report markers */}
          {reportsWithDistance.map((report) => (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
              pinColor={getPinColor(report.priority)}
              title={report.title}
              onPress={() => handlePinPress(report)}
            />
          ))}

          {/* Render cluster circles */}
          {clusters.map((cluster, index) => (
            <Circle
              key={`cluster-${index}`}
              center={cluster.center}
              radius={CLUSTER_RADIUS}
              fillColor="rgba(255, 0, 0, 0.2)"
              strokeColor="rgba(255, 0, 0, 0.5)"
              strokeWidth={2}
            />
          ))}
        </MapView>

        {/* My Location Button (Floating) */}
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={centerToOfficer}
        >
          <MaterialIcons name="my-location" size={28} color="#1a73e8" />
        </TouchableOpacity>

        {/* Custom Info Window */}
        {selectedReport && (
          <View style={styles.infoWindow}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedReport(null)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <View style={styles.infoContent}>
              <View style={styles.infoHeader}>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPinColor(selectedReport.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {selectedReport.priority}
                  </Text>
                </View>
                <Text style={styles.infoTitle}>{selectedReport.title}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Assigned Officer:</Text>
                <Text style={styles.infoValue}>
                  {selectedReport.assignedOfficerName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{selectedReport.status}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Distance:</Text>
                <Text style={styles.infoValue}>{selectedReport.distance}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Drive Time:</Text>
                <Text style={styles.infoValue}>{selectedReport.driveTime}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => {
                  router.push({
                    pathname: "/police-screens/report-details",
                    params: { id: selectedReport.id },
                  });
                  setSelectedReport(null);
                }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
              {/* Navigate Button */}
              <TouchableOpacity
                style={[
                  styles.viewDetailsButton,
                  { backgroundColor: "#34C759", marginTop: 8 },
                ]}
                onPress={() =>
                  openMaps(selectedReport.latitude, selectedReport.longitude)
                }
              >
                <Text style={styles.viewDetailsText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          onChange={handleSheetChanges}
          handleIndicatorStyle={styles.bottomSheetHandle}
          backgroundStyle={[
            styles.bottomSheetBackground,
            { paddingBottom: 10 },
          ]}
          enablePanDownToClose={false}
        >
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetHeaderText}>
              Nearby Reports ({reportsWithDistance.length})
            </Text>
          </View>
          <BottomSheetScrollView
            contentContainerStyle={styles.bottomSheetContent}
          >
            {reportsWithDistance.map(renderItem)}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#1a73e8",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#FFFFFF" },
  filterTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterTabActive: {
    backgroundColor: "#1a73e8",
    borderColor: "#1a73e8",
  },
  filterTabText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  map: {
    width: "100%",
  },
  myLocationButton: {
    position: "absolute",
    top: "75%",
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  myLocationText: {
    fontSize: 24,
    color: "#1a73e8",
  },
  infoWindow: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: [{ translateX: -150 }],
    width: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  closeButton: { alignSelf: "flex-end" },
  closeButtonText: { fontSize: 24, color: "#888" },
  infoContent: { marginTop: 8 },
  infoHeader: { marginBottom: 12 },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  priorityText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 12 },
  infoTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  viewDetailsButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },
  viewDetailsText: { color: "#FFFFFF", fontWeight: "bold" },
  bottomSheetBackground: {
    backgroundColor: "#FFFFFF",
  },
  bottomSheetHandle: {
    backgroundColor: "#e0e0e0",
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
  },
  bottomSheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  bottomSheetHeaderText: { fontSize: 20, fontWeight: "600" },
  bottomSheetContent: { padding: 16 },
  reportCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportId: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  distance: {
    fontSize: 14,
    color: "#555",
  },
  driveTime: {
    fontSize: 14,
    color: "#555",
  },
  officerName: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
});
