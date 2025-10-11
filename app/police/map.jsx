// Frontend/app/police/map.jsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

  // 🔹 MOCK REPORTS — Replace with real API later
  const mockAllReports = [
    {
      id: "R2025-0089",
      title: "Domestic Violence",
      priority: "HIGH",
      status: "pending",
      assignedOfficer: "officer_4729",
      latitude: 6.93,
      longitude: 79.865,
    },
    {
      id: "R2025-0087",
      title: "Vehicle Theft",
      priority: "MED",
      status: "inProgress",
      assignedOfficer: "officer_4729",
      latitude: 6.925,
      longitude: 79.855,
    },
    {
      id: "R2025-0086",
      title: "Noise Complaint",
      priority: "LOW",
      status: "resolved",
      assignedOfficer: null,
      latitude: 6.935,
      longitude: 79.87,
    },
    {
      id: "R2025-0085",
      title: "Suspicious Activity",
      priority: "MED",
      status: "pending",
      assignedOfficer: "officer_4730",
      latitude: 6.92,
      longitude: 79.85,
    },
    {
      id: "R2025-0084",
      title: "Burglary",
      priority: "HIGH",
      status: "inProgress",
      assignedOfficer: "officer_4731",
      latitude: 6.93,
      longitude: 79.87,
    },
    {
      id: "R2025-0083",
      title: "Assault",
      priority: "HIGH",
      status: "inProgress",
      assignedOfficer: "officer_4732",
      latitude: 6.94,
      longitude: 79.88,
    },
  ];

  const currentOfficerId = "officer_4729";

  // 🔹 Filter reports
  const filteredReports = mockAllReports.filter((report) => {
    if (activeFilter === "active") {
      return report.status === "pending" || report.status === "inProgress";
    }
    if (activeFilter === "assigned") {
      return report.assignedOfficer === currentOfficerId;
    }
    return true;
  });

  // 🔹 Add distance & drive time to reports
  const reportsWithDistance = filteredReports.map((report) => {
    if (!officerLocation) return { ...report, distance: "—", driveTime: "—" };
    const distanceKm = calculateDistance(
      officerLocation.latitude,
      officerLocation.longitude,
      report.latitude,
      report.longitude
    );
    const distance =
      distanceKm < 1
        ? `${Math.round(distanceKm * 1000)} m`
        : `${distanceKm.toFixed(1)} km`;
    const driveTime = `${estimateDriveTime(distanceKm)} min`;
    return { ...report, distance, driveTime };
  });

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
    if (officerLocation) {
      const distanceKm = calculateDistance(
        officerLocation.latitude,
        officerLocation.longitude,
        report.latitude,
        report.longitude
      );
      const distance =
        distanceKm < 1
          ? `${Math.round(distanceKm * 1000)} m`
          : `${distanceKm.toFixed(1)} km`;
      const driveTime = `${estimateDriveTime(distanceKm)} min`;
      setSelectedReport({ ...report, distance, driveTime });
    }
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
    switch (priority) {
      case "HIGH":
        return "#FF0000";
      case "MED":
        return "#FFA500";
      case "LOW":
        return "#008000";
      default:
        return "#808080";
    }
  };

  // 🔹 Center map to officer's location
  const centerToOfficer = () => {
    if (officerLocation) {
      mapRef.current?.animateToRegion({
        latitude: officerLocation.latitude,
        longitude: officerLocation.longitude,
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
        onPress={() => handleReportCardPress(item)}
      >
        <View
          style={[
            styles.priorityDot,
            {
              backgroundColor:
                item.priority === "HIGH"
                  ? "#dc3545"
                  : item.priority === "MED"
                  ? "#ffc107"
                  : "#28a745",
            },
          ]}
        />
        <View style={styles.reportInfo}>
          <Text style={styles.reportId}>{item.id}</Text>
          <Text style={styles.reportTitle}>{item.title}</Text>
          <View style={styles.reportMeta}>
            <Text style={styles.distance}>{item.distance}</Text>
            <Text style={styles.driveTime}>{item.driveTime}</Text>
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

  return (
    <GestureHandlerRootView style={styles.container}>
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
        {officerLocation && (
          <Marker
            coordinate={officerLocation}
            pinColor="blue"
            title="Your Location"
          />
        )}
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
      </MapView>

      {/* My Location Button (Floating) */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={centerToOfficer}
      >
        <Text style={styles.myLocationText}>📍</Text>
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
                {selectedReport.assignedOfficer === currentOfficerId
                  ? "You"
                  : selectedReport.assignedOfficer || "Not assigned"}
              </Text>
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
                Alert.alert(
                  "Report Details",
                  `Opening report: ${selectedReport.id}`
                );
                setSelectedReport(null);
              }}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChanges}
        handleIndicatorStyle={styles.bottomSheetHandle}
        backgroundStyle={[styles.bottomSheetBackground, { paddingBottom: 10 }]}
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
    </GestureHandlerRootView>
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
});
