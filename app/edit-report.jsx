import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Camera,
  ChevronLeft,
  FileText,
  ImageIcon,
  MapPin,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import ApiService from "../services/apiService";

export default function EditReport() {
  const router = useRouter();
  const { reportId } = useLocalSearchParams();

  // Form state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [postAnonymous, setPostAnonymous] = useState(true);
  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [media, setMedia] = useState([]);
  const [category, setCategory] = useState("");

  // Location search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const scrollViewRef = useRef(null);

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    "AIzaSyB3tqIAvpAubH7frNjtrh3z8bWEsq0_zxY";

  // Load existing report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        const reportData = await ApiService.getReportById(reportId);

        setDescription(reportData.description || "");
        setCategory(reportData.category || "");
        setFullName(reportData.full_name || "");
        setNicNumber(reportData.nic || "");
        setContactNumber(reportData.contact_number?.toString() || "");
        setPostAnonymous(
          !reportData.full_name && !reportData.nic && !reportData.contact_number
        );

        // Set location
        if (reportData.location) {
          setLocation({
            latitude: reportData.location.latitude,
            longitude: reportData.location.longitude,
            address: reportData.location.address || "",
          });
        }

        // Set existing media/evidence
        if (reportData.evidence && reportData.evidence.length > 0) {
          const formattedMedia = reportData.evidence.map((item, index) => ({
            id: index.toString(),
            uri: item.fileUrl,
            type: item.fileType === "video" ? "video" : "image",
            isExisting: true, // Flag to identify existing media
          }));
          setMedia(formattedMedia);
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  // Handle text input focus
  const handleTextInputFocus = (yOffset = 0) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
    }, 100);
  };

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to access your current location."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  };

  // Get current device location
  const getCurrentLocation = async () => {
    setSaving(true); // Use saving state as loading indicator
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setSaving(false);
      return;
    }

    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Use Google Reverse Geocoding API for better address formatting
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}&result_type=street_address|route|premise|subpremise|neighborhood|locality|administrative_area_level_1|administrative_area_level_2|country`
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

        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: formattedAddress,
        });
        setQuery(formattedAddress); // Show in form
        setResults([]); // Clear search results
        setShowMap(true);
      } else {
        // Fallback to Expo's reverse geocoding if Google API fails
        const [address] = await Location.reverseGeocodeAsync(coords);
        const formattedAddress = address
          ? `${address.street || ""}${address.street ? ", " : ""}${address.district || ""}${address.district ? ", " : ""}${address.city || ""}${address.city ? ", " : ""}${address.region || ""}${address.region ? ", " : ""}${address.postalCode || ""}${address.postalCode ? ", " : ""}${address.country || ""}`.replace(/,\s*$/, '')
          : "Current Location";

        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: formattedAddress,
        });
        setQuery(formattedAddress);
        setResults([]);
        setShowMap(true);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setSaving(false);
    }
  };

  // Search Google Places API
  const searchPlaces = async (text) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&key=${GOOGLE_API_KEY}&components=country:lk`
      );
      const json = await response.json();
      if (json.status !== "OK") {
        console.error("Places API error:", json.status, json.error_message);
        setResults([]);
        return;
      }
      setResults(json.predictions || []);
    } catch (error) {
      console.error("Places API error:", error);
      setResults([]);
    }
  };

  // Handle place select
  const handleSelectPlace = async (placeId, description) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      if (json.status !== "OK") {
        console.error("Place details error:", json.status, json.error_message);
        return;
      }
      const loc = json.result.geometry.location;
      setLocation({
        latitude: loc.lat,
        longitude: loc.lng,
        address: description,
      });
      setQuery(description); // Show in form
      setResults([]); // Clear search results
      setShowMap(true);
    } catch (error) {
      console.error("Place details error:", error);
    }
  };

  // Clear selected location
  const clearLocation = () => {
    setLocation(null);
    setQuery("");
    setResults([]);
    setShowMap(false);
  };

  // Handle media capture (photo or video)
  const captureMedia = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera permission is needed to take photos"
        );
        return;
      }

      Alert.alert("Select Media Type", "Choose what you want to capture", [
        { text: "Photo", onPress: () => launchCamera("photo") },
        { text: "Video", onPress: () => launchCamera("video") },
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (error) {
      console.error("Error requesting camera permission:", error);
    }
  };

  const launchCamera = async (mediaType) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes:
          mediaType === "video"
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newMedia = {
          id: Date.now().toString(),
          uri: asset.uri,
          type: asset.type,
        };
        setMedia((prev) => [...prev, newMedia]);
      }
    } catch (error) {
      console.error("Error launching camera:", error);
    }
  };

  // Handle media selection from gallery
  const chooseMedia = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Media library permission is needed to select photos/videos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newMediaItems = result.assets.map((asset) => ({
          id: Date.now().toString() + Math.random(),
          uri: asset.uri,
          type: asset.type,
        }));
        setMedia((prev) => [...prev, ...newMediaItems]);
      }
    } catch (error) {
      console.error("Error choosing media:", error);
    }
  };

  // Delete a media item
  const deleteMedia = (index) => {
    Alert.alert("Delete Media", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setMedia((prev) => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!description.trim()) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    if (!location) {
      Alert.alert("Error", "Please select a location");
      return;
    }

    if (!postAnonymous) {
      if (!fullName.trim() || !nicNumber.trim() || !contactNumber.trim()) {
        Alert.alert(
          "Error",
          "Please provide all personal details or choose to post anonymously"
        );
        return;
      }
    }

    try {
      setSaving(true);

      // Prepare update data in the format expected by backend
      const updateData = {
        category: category,
        description: description.trim(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || "",
        },
      };

      // Add personal info if not anonymous
      if (!postAnonymous) {
        updateData.full_name = fullName.trim();
        updateData.nic = nicNumber.trim();
        updateData.contact_number = parseInt(contactNumber.trim());
      } else {
        // Clear personal info if switching to anonymous
        updateData.full_name = "";
        updateData.nic = "";
        updateData.contact_number = null;
      }

      // Handle evidence - for now, keep existing evidence as is
      // In a full implementation, you'd need to handle file uploads separately
      const existingMedia = media.filter((item) => item.isExisting);
      const newMediaFiles = media.filter((item) => !item.isExisting);

      if (existingMedia.length > 0 || newMediaFiles.length > 0) {
        updateData.evidence = [
          ...existingMedia.map((item) => ({
            fileUrl: item.uri,
            fileType: item.type,
          })),
          // For new files, you'd need to upload them first and get URLs
          // This is a simplified version that keeps the local URIs
          ...newMediaFiles.map((item) => ({
            fileUrl: item.uri,
            fileType: item.type,
          })),
        ];
      }

      console.log("Sending update data:", updateData);

      // Test the connection first
      console.log("Testing update for report ID:", reportId);

      const result = await ApiService.updateReport(reportId, updateData);
      console.log("Update successful, result:", result);

      Alert.alert("Success", "Report updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating report:", error);
      Alert.alert("Error", `Failed to update report: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Report</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading report data...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Report</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Report</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Display */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Category</Text>
          </View>
          <View style={styles.categoryDisplay}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>

          {location ? (
            <>
              <View style={styles.selectedLocationContainer}>
                <Text style={styles.selectedLocationText}>
                  {location.address}
                </Text>
                <TouchableOpacity onPress={clearLocation}>
                  <X size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              {showMap && location && (
                <MapView
                  provider="google"
                  style={styles.map}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    draggable
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    title="Selected Location"
                    description={location.address}
                    onDragEnd={async (e) => {
                      const coords = e.nativeEvent.coordinate;
                      setLocation((prev) => ({
                        ...prev,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                      }));
                      try {
                        // Try Google API first for better address resolution
                        const response = await fetch(
                          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}&result_type=street_address|route|premise|subpremise|neighborhood|locality|administrative_area_level_1|administrative_area_level_2|country`
                        );
                        
                        const data = await response.json();
                        let formattedAddress = "Selected Location";
                        
                        if (data.results && data.results.length > 0) {
                          // Try to get the most specific address first
                          formattedAddress = data.results[0].formatted_address;
                          
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
                        } else {
                          // Fallback to Expo's reverse geocoding
                          const [address] = await Location.reverseGeocodeAsync(coords);
                          formattedAddress = address
                            ? `${address.street || ""}${address.street ? ", " : ""}${address.district || ""}${address.district ? ", " : ""}${address.city || ""}${address.city ? ", " : ""}${address.region || ""}${address.region ? ", " : ""}${address.postalCode || ""}${address.postalCode ? ", " : ""}${address.country || ""}`.replace(/,\s*$/, '')
                            : "Selected Location";
                        }
                        
                        setLocation((prev) => ({
                          ...prev,
                          address: formattedAddress,
                        }));
                        setQuery(formattedAddress); // Update form display
                      } catch (error) {
                        console.error("Reverse geocode error:", error);
                      }
                    }}
                  />
                </MapView>
              )}
            </>
          ) : (
            <>
              <TextInput
                style={styles.autocompleteInput}
                placeholder="Search for a location..."
                value={query}
                onChangeText={searchPlaces}
                onFocus={() => handleTextInputFocus(300)}
              />

              {results.length > 0 && (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.place_id}
                  style={styles.resultsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.resultItem}
                      onPress={() =>
                        handleSelectPlace(item.place_id, item.description)
                      }
                    >
                      <Text>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={saving}
              >
                <Text style={styles.locationButtonText}>
                  {saving ? "Fetching Location..." : "Use Current Location"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the issue in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              onFocus={() => handleTextInputFocus(600)}
            />
          </View>
        </View>

        {/* Evidence Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Camera size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Evidence (Optional)</Text>
          </View>

          <View style={styles.evidenceContainer}>
            <TouchableOpacity
              style={styles.evidenceButton}
              onPress={captureMedia}
            >
              <Camera size={24} color="#007AFF" />
              <Text style={styles.evidenceText}>Take Photo/Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.evidenceButton}
              onPress={chooseMedia}
            >
              <ImageIcon size={24} color="#007AFF" />
              <Text style={styles.evidenceText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {media.length > 0 && (
            <FlatList
              data={media}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              style={styles.mediaList}
              renderItem={({ item, index }) => (
                <View style={styles.mediaContainer}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.mediaThumbnail}
                  />
                  {item.type === "video" && (
                    <View style={styles.playIconOverlay}>
                      <Text style={{ color: "#FFFFFF", fontSize: 12 }}>▶</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.mediaDeleteButton}
                    onPress={() => deleteMedia(index)}
                  >
                    <X size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.anonymousToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  postAnonymous && styles.toggleButtonActive,
                ]}
                onPress={() => setPostAnonymous(true)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    postAnonymous && styles.toggleButtonTextActive,
                  ]}
                >
                  Anonymous
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !postAnonymous && styles.toggleButtonActive,
                ]}
                onPress={() => setPostAnonymous(false)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    !postAnonymous && styles.toggleButtonTextActive,
                  ]}
                >
                  With Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {!postAnonymous && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => handleTextInputFocus(1000)}
              />
              <TextInput
                style={styles.input}
                placeholder="NIC Number"
                value={nicNumber}
                onChangeText={setNicNumber}
                onFocus={() => handleTextInputFocus(1100)}
              />
              <TextInput
                style={styles.input}
                placeholder="Contact Number"
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                onFocus={() => handleTextInputFocus(1200)}
              />
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Update Report</Text>
          )}
        </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
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
    paddingVertical: 100,
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
  section: {
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 8,
    flex: 1,
  },
  categoryDisplay: {
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
  },
  categoryText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  selectedLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginBottom: 12,
  },
  selectedLocationText: {
    fontSize: 16,
    color: "#000000",
    flex: 1,
  },
  locationButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
    marginTop: 10,
  },
  locationButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  autocompleteInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#E5E5EA",
  },
  resultsList: {
    maxHeight: 150,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  map: {
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  descriptionContainer: {
    position: "relative",
  },
  textArea: {
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    minHeight: 100,
    textAlignVertical: "top",
  },
  evidenceContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  evidenceButton: {
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    flex: 0.45,
  },
  evidenceText: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
  },
  mediaList: {
    marginTop: 10,
  },
  mediaContainer: {
    position: "relative",
    marginRight: 10,
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  playIconOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaDeleteButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  anonymousToggle: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#007AFF",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  toggleButtonTextActive: {
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    marginBottom: 12,
    minHeight: 48,
  },
  submitButton: {
    backgroundColor: "#5AC8FA",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
