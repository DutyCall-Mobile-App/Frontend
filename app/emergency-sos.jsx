import * as Location from "expo-location";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function EmergencySOS() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [policeStations, setPoliceStations] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const GOOGLE_API_KEY = "AIzaSyB3tqIAvpAubH7frNjtrh3z8bWEsq0_zxY";

  useEffect(() => {
    getCurrentLocationAndFindPoliceStations();
  }, [getCurrentLocationAndFindPoliceStations]);

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      // Try Google Reverse Geocoding API first for better address formatting
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&result_type=street_address|route|premise|subpremise|neighborhood|locality|administrative_area_level_1|administrative_area_level_2|country`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Try to get the most specific address first
        let formattedAddress = data.results[0].formatted_address;
        
        // If the first result is too generic, try to find a more specific one
        if (data.results.length > 1) {
          for (let i = 0; i < data.results.length; i++) {
            const result = data.results[i];
            const types = result.types || [];
            
            // Prioritize street_address, route, or premise
            if (types.includes('street_address') || types.includes('route') || types.includes('premise')) {
              formattedAddress = result.formatted_address;
              break;
            }
          }
        }
        return formattedAddress;
      } else {
        // Fallback to Expo's reverse geocoding if Google API fails
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const formattedAddress = address
          ? `${address.street || ""}${address.street ? ", " : ""}${address.district || ""}${address.district ? ", " : ""}${address.city || ""}${address.city ? ", " : ""}${address.region || ""}${address.region ? ", " : ""}${address.postalCode || ""}${address.postalCode ? ", " : ""}${address.country || ""}`.replace(/,\s*$/, '')
          : "Current Location";
        return formattedAddress;
      }
    } catch (error) {
      console.error("Error getting address from coordinates:", error);
      return "Location not available";
    }
  };

  const getCurrentLocationAndFindPoliceStations = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMessage(
          "Location permission is required for emergency services"
        );
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      // Get readable address from coordinates
      const address = await getAddressFromCoordinates(latitude, longitude);
      setCurrentLocation({ latitude, longitude, address });

      // Find nearby police stations using Google Places API
      await findNearbyPoliceStations(latitude, longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMessage("Failed to get your location. Please try again.");
      setLoading(false);
    }
  }, [findNearbyPoliceStations]);

  const findNearbyPoliceStations = useCallback(
    async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&type=police&key=${GOOGLE_API_KEY}`
        );

        const data = await response.json();

        if (data.status === "OK" && data.results) {
          const stationsWithDetails = await Promise.all(
            data.results.slice(0, 10).map(async (station) => {
              // Get additional details for each station
              const details = await getPlaceDetails(station.place_id);
              const distance = calculateDistance(
                latitude,
                longitude,
                station.geometry.location.lat,
                station.geometry.location.lng
              );

              return {
                id: station.place_id,
                name: station.name,
                address: station.vicinity,
                location: station.geometry.location,
                rating: station.rating || "N/A",
                distance: distance,
                phone: details.phone || "Not available",
                isOpen: station.opening_hours?.open_now || null,
              };
            })
          );

          // Sort by distance
          stationsWithDetails.sort((a, b) => a.distance - b.distance);
          setPoliceStations(stationsWithDetails);
        } else {
          setErrorMessage("No police stations found in your area");
        }
      } catch (error) {
        console.error("Error finding police stations:", error);
        setErrorMessage("Failed to find nearby police stations");
      } finally {
        setLoading(false);
      }
    },
    [calculateDistance]
  );

  const getPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      return {
        phone: data.result?.formatted_phone_number || "Not available",
      };
    } catch (error) {
      console.error("Error getting place details:", error);
      return { phone: "Not available" };
    }
  };

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return Math.round(d * 100) / 100; // Round to 2 decimal places
  }, []);

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const makePhoneCall = (phoneNumber) => {
    if (phoneNumber && phoneNumber !== "Not available") {
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
      Linking.openURL(`tel:${cleanNumber}`);
    } else {
      Alert.alert("Error", "Phone number not available");
    }
  };

  const openInMaps = (latitude, longitude, name) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${name}`;
    Linking.openURL(url);
  };

  const renderPoliceStation = ({ item }) => (
    <View style={[styles.stationCard, { backgroundColor: colors.surface }]}>
      <View style={styles.stationHeader}>
        <View style={styles.stationInfo}>
          <Text style={[styles.stationName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.addressContainer}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={[styles.stationAddress, { color: colors.textSecondary }]}>{item.address}</Text>
          </View>
        </View>
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>{item.distance} km</Text>
          {item.isOpen !== null && (
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.isOpen ? "#32D74B" : "#FF3B30" },
              ]}
            />
          )}
        </View>
      </View>

      <View style={styles.stationDetails}>
        <View style={styles.detailRow}>
          <Phone size={16} color="#007AFF" />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.phone}</Text>
        </View>
        {item.rating !== "N/A" && (
          <View style={styles.detailRow}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => makePhoneCall(item.phone)}
        >
          <Phone size={16} color="#FFFFFF" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.directionsButton]}
          onPress={() =>
            openInMaps(item.location.lat, item.location.lng, item.name)
          }
        >
          <Navigation size={16} color="#007AFF" />
          <Text style={styles.directionsButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency SOS</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Emergency Alert */}
      <View style={[styles.emergencyAlert, { backgroundColor: isDarkMode ? '#5f1e1e' : '#FFEBEE', borderColor: isDarkMode ? '#8f2e2e' : '#FFCDD2' }]}>
        <AlertTriangle size={24} color="#FF3B30" />
        <Text style={styles.emergencyText}>
          Emergency Services - Nearby Police Stations
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Getting your location and finding nearby police stations...
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getCurrentLocationAndFindPoliceStations}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {currentLocation && (
            <View style={[styles.locationInfo, { backgroundColor: isDarkMode ? '#1e3a5f' : '#E3F2FD' }]}>
              <MapPin size={20} color="#007AFF" />
              <Text style={[styles.locationText, { color: isDarkMode ? '#64B5F6' : '#1976D2' }]}>
                Your current location: {currentLocation.address || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
              </Text>
            </View>
          )}

          <View style={styles.stationsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Nearby Police Stations ({policeStations.length})
            </Text>
            <Clock size={16} color={colors.textSecondary} />
          </View>

          <FlatList
            data={policeStations}
            renderItem={renderPoliceStation}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />

          {policeStations.length === 0 && (
            <View style={styles.noResultsContainer}>
              <MapPin size={48} color={colors.textSecondary} />
              <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                No police stations found in your area
              </Text>
            </View>
          )}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FF3B30",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 36,
  },
  emergencyAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginVertical: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 8,
    flex: 1,
  },
  stationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  stationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  stationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stationAddress: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 4,
    flex: 1,
  },
  distanceContainer: {
    alignItems: "flex-end",
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stationDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#000000",
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#FF9500",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.48,
  },
  callButton: {
    backgroundColor: "#32D74B",
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  directionsButton: {
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  directionsButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 16,
  },
});
