// Frontend/app/police-report-form.jsx
import { useRouter } from "expo-router";
import {
  Camera,
  ChevronLeft,
  Image as ImageIcon,
  MapPin,
  Mic,
  X,
} from "lucide-react-native";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState, useRef } from "react";
import {
  ActivityIndicator,
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

export default function PoliceReportForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MED"); // HIGH, MED, LOW
  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // 🔒 MOCK OFFICER DATA — Replace with real auth later
  const mockOfficer = {
    name: "Officer Johnson",
    badge: "4729",
    district: "District 12",
  };

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    "AIzaSyB3tqIAvpAubH7frNjtrh3z8bWEsq0_zxY";
  const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/reports/create`;

  // Location functions (same as civilian form)
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied.");
      return false;
    }
    return true;
  };

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
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      const address =
        data.results?.[0]?.formatted_address || "Current Location";
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        address,
      });
      setShowMap(true);
    } catch (error) {
      console.error("Failed to get location:", error);
      alert("Failed to get location");
    }
    setIsLoading(false);
  };

  const searchPlaces = async (text) => {
    if (text.length < 3) return;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&key=${GOOGLE_API_KEY}&components=country:lk`
      );
      const json = await response.json();
      if (json.status === "OK") {
        // Handle results if needed (optional for police)
      }
    } catch (error) {
      console.error("Places API error:", error);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setShowMap(false);
  };

  // Media functions
  const captureMedia = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission denied");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setMedia([
        ...media,
        { uri: result.assets[0].uri, type: result.assets[0].type },
      ]);
    }
  };

  const chooseMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Gallery permission denied");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setMedia([
        ...media,
        { uri: result.assets[0].uri, type: result.assets[0].type },
      ]);
    }
  };

  const deleteMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async () => {
    if (!title || !description) {
      alert("Please provide title and description.");
      return;
    }
    if (!location) {
      alert("Please select a location.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      // 🔜 FUTURE: Replace mockOfficer with real officer from auth context
      formData.append("full_name", mockOfficer.name);
      formData.append("badge", mockOfficer.badge);
      formData.append("district", mockOfficer.district);
      formData.append("category", title); // Reuse category field for title
      formData.append("description", description);
      formData.append("priority", priority);
      formData.append("status", "inProgress"); // Auto-set for police
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());
      formData.append("address", location.address || "");

      media.forEach((item, i) => {
        const fileType = item.type === "video" ? "video/mp4" : "image/jpeg";
        const fileExt = item.type === "video" ? "mp4" : "jpg";
        formData.append("evidence", {
          uri: item.uri,
          type: fileType,
          name: `evidence_${i}.${fileExt}`,
        });
      });

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Submission failed");
      router.push("/submission-success");
    } catch (error) {
      alert("Submission failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.title}>New Police Report</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Officer Info (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Officer Information</Text>
          <View style={styles.officerInfo}>
            <Text style={styles.officerLabel}>Name:</Text>
            <Text>{mockOfficer.name}</Text>
          </View>
          <View style={styles.officerInfo}>
            <Text style={styles.officerLabel}>Badge #:</Text>
            <Text>{mockOfficer.badge}</Text>
          </View>
          <View style={styles.officerInfo}>
            <Text style={styles.officerLabel}>District:</Text>
            <Text>{mockOfficer.district}</Text>
          </View>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityButtons}>
            {["HIGH", "MED", "LOW"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && styles.priorityButtonActive(p),
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === p && styles.priorityButtonTextActive(p),
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter report title"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the incident in detail..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Location</Text>
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
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isLoading}
            >
              <Text style={styles.locationButtonText}>
                {isLoading ? "Fetching Location..." : "Use Current Location"}
              </Text>
            </TouchableOpacity>
          )}
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
                coordinate={location}
                title="Selected Location"
                onDragEnd={(e) => {
                  const coords = e.nativeEvent.coordinate;
                  setLocation((prev) => ({ ...prev, ...coords }));
                }}
              />
            </MapView>
          )}
        </View>

        {/* Evidence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence (Optional)</Text>
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
            <FlatList
              data={media}
              horizontal
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.mediaContainer}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.mediaThumbnail}
                  />
                  {item.type === "video" && (
                    <View style={styles.playIconOverlay}>
                      <Mic size={24} color="#FFFFFF" />
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
          )}
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
            <Text style={styles.submitText}>SUBMIT REPORT</Text>
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
  title: { fontSize: 18, fontWeight: "600", color: "#000000" },
  content: { flex: 1, padding: 20 },
  scrollContent: { paddingBottom: 100 },
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
  },
  officerInfo: { flexDirection: "row", marginBottom: 8 },
  officerLabel: { fontWeight: "bold", width: 90, color: "#555" },
  priorityButtons: { flexDirection: "row", gap: 10 },
  priorityButton: (p) => ({
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#F2F2F7",
  }),
  priorityButtonActive: (p) => ({
    backgroundColor:
      p === "HIGH" ? "#ffcdd2" : p === "MED" ? "#fff9c4" : "#c8e6c9",
    borderColor: p === "HIGH" ? "#e53935" : p === "MED" ? "#f57f17" : "#2e7d32",
  }),
  priorityButtonText: { color: "#555", fontWeight: "500" },
  priorityButtonTextActive: (p) => ({
    color: p === "HIGH" ? "#c62828" : p === "MED" ? "#f57f17" : "#2e7d32",
    fontWeight: "bold",
  }),
  input: {
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
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
  selectedLocationText: { fontSize: 16, color: "#000000", flex: 1 },
  locationButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  locationButtonText: { fontSize: 16, color: "#007AFF" },
  map: { height: 200, borderRadius: 8, marginTop: 10 },
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
  mediaContainer: { position: "relative", marginRight: 10 },
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
