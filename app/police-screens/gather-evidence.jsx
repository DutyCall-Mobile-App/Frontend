// Frontend/app/gather-evidence.jsx
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
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GatherEvidence() {
  const router = useRouter();
  const [media, setMedia] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // 🔒 MOCK OFFICER DATA — Replace with real auth later
  const mockOfficer = {
    name: "Officer Johnson",
    badge: "4729",
    district: "District 12",
  };

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    "AIzaSyB3tqIAvpAubH7frNjtrh3z8bWEsq0_zxY";

  // Location functions
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
      setShowLocationModal(true);
    } catch (error) {
      console.error("Failed to get location:", error);
      alert("Failed to get location");
    }
    setIsLoading(false);
  };

  const clearLocation = () => {
    setLocation(null);
    setShowLocationModal(false);
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

  // Audio recording
  const startAudioRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access microphone is required!");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const recordingOptions = {
        isMeteringEnabled: true,
        android: {
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          audioQuality: Audio.IOSAudioQuality.HIGH,
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          sampleRate: 16000,
          numberOfChannels: 1,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setMedia([...media, { uri: recording.getURI(), type: "audio" }]);
      await recording.stopAndUnloadAsync();
    } catch (error) {
      console.error("Failed to record audio:", error);
      alert("Failed to record audio");
    }
  };

  // Submit evidence to report form
  const handleSubmit = () => {
    if (media.length === 0 && !location) {
      alert("Please capture at least one piece of evidence.");
      return;
    }

    // 👉 TODAY: Mock — store in global context or pass via params
    // 🔜 FUTURE: Upload to Cloudinary via uploadMiddleware.js
    // Then return URL to report form

    Alert.alert(
      "Evidence Captured",
      `${media.length} media items and ${
        location ? "location" : "no location"
      } captured.`,
      [
        {
          text: "Add to Report",
          onPress: () => {
            // Pass evidence to report form
            router.push({
              pathname: "/police-report-form",
              params: {
                evidence: JSON.stringify(media),
                location: JSON.stringify(location),
              },
            });
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
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
        <Text style={styles.title}>Gather Evidence</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Officer Info */}
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

        {/* Evidence Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capture Evidence</Text>
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
            <TouchableOpacity
              style={styles.evidenceButton}
              onPress={startAudioRecording}
            >
              <Mic size={24} color="#8E8E93" />
              <Text style={styles.evidenceText}>Record Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.evidenceButton}
              onPress={getCurrentLocation}
            >
              <MapPin size={24} color="#8E8E93" />
              <Text style={styles.evidenceText}>Get Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Media Preview */}
        {media.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Captured Media ({media.length})
            </Text>
            <FlatList
              data={media}
              horizontal
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View key={index} style={styles.mediaContainer}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.mediaThumbnail}
                  />
                  {item.type === "audio" && (
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
          </View>
        )}

        {/* Location Preview */}
        {location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.selectedLocationContainer}>
              <Text style={styles.selectedLocationText}>
                {location.address}
              </Text>
              <TouchableOpacity onPress={clearLocation}>
                <X size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Submit Button */}
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
            <Text style={styles.submitText}>ADD TO REPORT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <X size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Location Selected</Text>
          </View>
          <Text style={styles.modalText}>{location?.address}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowLocationModal(false)}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  officerInfo: { flexDirection: "row", marginBottom: 8 },
  officerLabel: { fontWeight: "bold", width: 90, color: "#555" },
  evidenceContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
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
  submitButton: {
    backgroundColor: "#5AC8FA",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 20,
  },
  submitButtonDisabled: { backgroundColor: "#A0A0A0" },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#000000" },
  modalText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#5AC8FA",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
