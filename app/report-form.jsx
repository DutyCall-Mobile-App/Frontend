import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Camera,
  ChevronLeft,
  Image as ImageIcon,
  MapPin,
  Play,
  Users,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function ReportForm() {
  const router = useRouter();
  const { categoryId, subcategory } = useLocalSearchParams();

  const [postAnonymous, setPostAnonymous] = useState(true);
  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [media, setMedia] = useState([]); // Stores photos and videos
  const [isLoading, setIsLoading] = useState(false);
  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  // Track selection method
  const [locationMethod, setLocationMethod] = useState(null); // 'search' or 'current'

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey || "YOUR_FALLBACK_API_KEY";

  // Request location permission
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert(
        "Permission to access location was denied. You can select a location manually."
      );
      return false;
    }
    return true;
  };

  // Get current device location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setIsLoading(false);
      return;
    }
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const [address] = await Location.reverseGeocodeAsync(coords);
      const formattedAddress = address
        ? `${address.street || ""}, ${address.city || ""}, ${
            address.country || ""
          }`
        : "Current Location";
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: formattedAddress,
      });
      setQuery(formattedAddress); // Show in form
      setResults([]); // Clear search results
      setShowMap(true);
      setLocationMethod("current"); // Mark as current location
    } catch (error) {
      alert("Failed to get location: " + error.message);
    }
    setIsLoading(false);
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
      setLocationMethod("search"); // Mark as searched location
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
    setLocationMethod(null);
  };

  // Handle media capture (photo or video)
  const captureMedia = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission denied");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow photos and videos
      allowsEditing: true,
    });
    if (!result.canceled) {
      setMedia([
        ...media,
        { uri: result.assets[0].uri, type: result.assets[0].type },
      ]);
    }
  };

  // Handle media selection from gallery (photo or video)
  const chooseMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Gallery permission denied");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow photos and videos
      allowsEditing: true,
    });
    if (!result.canceled) {
      setMedia([
        ...media,
        { uri: result.assets[0].uri, type: result.assets[0].type },
      ]);
    }
  };

  // Delete a media item
  const deleteMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!description) {
      alert("Please provide a description.");
      return;
    }
    if (!location) {
      alert("Please select a location.");
      return;
    }
    if (postAnonymous && media.length === 0) {
      alert(
        "Please add at least one evidence photo or video for anonymous posts."
      );
      return;
    }
    if (!postAnonymous && (!fullName || !nicNumber || !contactNumber)) {
      alert(
        "Please provide full name, NIC number, and contact number for non-anonymous posts."
      );
      return;
    }

    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
      // Note: If uploading media, use FormData to send files
      // Example: const formData = new FormData();
      // media.forEach((item, index) => formData.append(`media${index}`, { uri: item.uri, type: item.type, name: `media${index}.${item.type}` }));
      const response = await fetch("YOUR_API_ENDPOINT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          subcategory,
          postAnonymous,
          fullName: postAnonymous ? "" : fullName,
          nicNumber: postAnonymous ? "" : nicNumber,
          contactNumber: postAnonymous ? "" : contactNumber,
          description,
          location,
          media, // Array of { uri, type }
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      router.push("/submission-success");
    } catch (error) {
      alert("Submission failed: " + error.message);
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{subcategory}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Anonymous toggle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Post Anonymous</Text>
            <Switch
              value={postAnonymous}
              onValueChange={(value) => {
                setPostAnonymous(value);
                // Clear contact info when switching to anonymous
                if (value) {
                  setFullName("");
                  setNicNumber("");
                  setContactNumber("");
                }
              }}
              thumbColor="#FFFFFF"
              trackColor={{ false: "#D1D1D6", true: "#32D74B" }}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>What is the Location?</Text>
          </View>

          {location ? (
            <View style={styles.selectedLocationContainer}>
              <Text style={styles.selectedLocationText}>
                {location.address}
              </Text>
              <TouchableOpacity onPress={clearLocation}>
                <X size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.autocompleteInput}
                placeholder="Search for a location"
                value={query}
                onChangeText={searchPlaces}
              />
              {results.length > 0 && (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.place_id}
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
                  style={styles.resultsList}
                  scrollEnabled={false} // Disable FlatList scrolling
                />
              )}
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={isLoading}
              >
                <Text style={styles.locationButtonText}>
                  {isLoading ? "Fetching Location..." : "Use Current Location"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {showMap && location && (
            <MapView
              provider="google"
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude, // Fixed typo
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
                    const [address] = await Location.reverseGeocodeAsync(
                      coords
                    );
                    const formattedAddress = address
                      ? `${address.street || ""}, ${address.city || ""}, ${
                          address.country || ""
                        }`
                      : "Selected Location";
                    setLocation((prev) => ({
                      ...prev,
                      address: formattedAddress,
                    }));
                    setQuery(formattedAddress); // Update form display
                    setLocationMethod("search"); // Treat as manual selection
                  } catch (error) {
                    console.error("Reverse geocode error:", error);
                  }
                }}
              />
            </MapView>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue in detail..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Evidence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Evidence {postAnonymous ? "(Required)" : "(Optional)"}
          </Text>
          <View style={styles.evidenceContainer}>
            <TouchableOpacity
              style={styles.evidenceButton}
              onPress={captureMedia}
            >
              <Camera size={24} color="#8E8E93" />
              <Text style={styles.evidenceText}>Capture Media</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.evidenceButton}
              onPress={chooseMedia}
            >
              <ImageIcon size={24} color="#8E8E93" />
              <Text style={styles.evidenceText}>Choose Media</Text>
            </TouchableOpacity>
          </View>
          {media.length > 0 && (
            <>
              <Text style={styles.evidenceText}>
                {media.length} media item(s) selected
              </Text>
              <FlatList
                data={media}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                scrollEnabled={false} // Disable scrolling to avoid nesting warning
                renderItem={({ item, index }) => (
                  <View style={styles.mediaContainer}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.mediaThumbnail}
                    />
                    {item.type === "video" && (
                      <View style={styles.playIconOverlay}>
                        <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.mediaDeleteButton}
                      onPress={() => deleteMedia(index)}
                    >
                      <X size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
                style={styles.mediaList}
              />
            </>
          )}
        </View>

        {/* Contact info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>
              Contact Info {postAnonymous ? "(Not Reqired)" : "(Required)"}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            editable={!postAnonymous}
          />

          <TextInput
            style={styles.input}
            placeholder="NIC number"
            value={nicNumber}
            onChangeText={setNicNumber}
            editable={!postAnonymous}
          />

          <TextInput
            style={styles.input}
            placeholder="Contact number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            editable={!postAnonymous}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>SUBMIT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 18, fontWeight: "600", color: "#000000", flex: 1 },
  content: { flex: 1, padding: 20 },
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
  locationButtonText: { fontSize: 16, color: "#007AFF" },
  autocompleteInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
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
  map: { height: 200, borderRadius: 8, marginTop: 10 },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    minHeight: 100,
  },
  evidenceContainer: { flexDirection: "row", justifyContent: "space-around" },
  evidenceButton: {
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    flex: 0.45,
  },
  evidenceText: { fontSize: 14, color: "#8E8E93", marginTop: 8 },
  mediaList: { marginTop: 10 },
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
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#5AC8FA",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  submitButtonDisabled: { backgroundColor: "#A0A0A0" },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
