// Frontend/app/emergency-sos.jsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";

export default function EmergencySOS() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [officerLocation, setOfficerLocation] = useState(null);

  useEffect(() => {
    const initSOS = async () => {
      try {
        // 1. Request permissions
        const { status: locationStatus } =
          await Location.requestForegroundPermissionsAsync();
        const { status: audioStatus } = await Audio.requestPermissionsAsync();

        if (locationStatus !== "granted" || audioStatus !== "granted") {
          Alert.alert(
            "Permissions Required",
            "Location and microphone access are required for SOS."
          );
          router.back();
          return;
        }

        // 2. Get current location
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setOfficerLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        // 3. Start 30-sec background audio recording
        await startAudioRecording();

        // 4. Send SOS to backend
        await triggerSOSBackend({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        Alert.alert("✅ SOS Sent", "Help is on the way!");
      } catch (error) {
        console.error("SOS failed:", error);
        Alert.alert("❌ SOS Failed", "Unable to send emergency alert.");
      } finally {
        setIsLoading(false);
      }
    };

    initSOS();
  }, []);

  const startAudioRecording = async () => {
    // 🔜 FUTURE: Implement 30-sec background recording
    console.log("Starting 30-sec audio recording...");
  };

  const triggerSOSBackend = async (location) => {
    // 👉 TODAY: Mock
    console.log("Sending SOS to backend:", location);

    // 🔜 FUTURE: UNCOMMENT BELOW
    // await apiService.triggerSOS(location);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>
          Sending Emergency SOS...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Content (Centered Vertically) */}
      <View style={styles.contentWrapper}>
        <View style={styles.content}>
          <Text style={styles.title}>EMERGENCY SOS ACTIVE</Text>
          <Text style={styles.message}>
            Your location has been shared with dispatch and nearby officers.
          </Text>
          <Text style={styles.subMessage}>Help is on the way!</Text>
        </View>
      </View>

      {/* 👇 BACK TO DASHBOARD BUTTON — FIXED AT BOTTOM */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/police")}
        >
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 60,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
};
