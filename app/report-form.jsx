// Updated report-form.jsx (submit to backend with FormData for files)
import { Audio } from "expo-av";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Camera,
  ChevronLeft,
  Image as ImageIcon,
  MapPin,
  Mic,
  Play,
  Users,
  X,
} from "lucide-react-native";
import { useRef, useState } from "react";
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
  const { categoryId, subcategory, categoryTitle } = useLocalSearchParams();

  const [postAnonymous, setPostAnonymous] = useState(true);
  const [fullName, setFullName] = useState("");
  const [nicNumber, setNicNumber] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Speech-to-text state
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("si-LK"); // Default to Sinhala
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [interimText, setInterimText] = useState(""); // For real-time text
  const [chunkCounter, setChunkCounter] = useState(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [locationMethod, setLocationMethod] = useState(null);

  // Scroll ref for keyboard handling
  const scrollViewRef = useRef(null);

  // Helper function to handle text input focus
  const handleTextInputFocus = (yOffset = 0) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 100);
  };

  const GOOGLE_API_KEY =
    Constants.expoConfig?.extra?.googleApiKey ||
    "AIzaSyB3tqIAvpAubH7frNjtrh3z8bWEsq0_zxY";

  const API_URL = "http://172.20.10.9:3000/api/reports/create";

  // Language options for speech recognition
  const languageOptions = [
    { code: "si-LK", name: "සිංහල (Sinhala)" },
    { code: "en-US", name: "English" },
    { code: "ta-IN", name: "தமிழ் (Tamil)" },
  ];

  // Test if Google Cloud Speech API supports Sinhala
  const testSinhalaSupport = async () => {
    try {
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config: {
              encoding: "LINEAR16",
              sampleRateHertz: 16000,
              languageCode: "si-LK",
            },
            audio: {
              content: "", // Empty audio just to test API support
            },
          }),
        }
      );

      const result = await response.json();
      console.log("Sinhala API test result:", result);

      if (result.error && result.error.code === 400) {
        console.warn(
          "Sinhala (si-LK) may not be fully supported by Google Speech API"
        );
        alert(
          "Note: Sinhala speech recognition may have limited accuracy. Try speaking clearly and slowly."
        );
      }
    } catch (err) {
      console.log("Could not test Sinhala support:", err);
    }
  };

  // Speech recognition setup with real-time transcription
  const startRecording = async () => {
    try {
      setSpeechError(""); // Clear previous errors
      setIsProcessing(false);
      setRecordingDuration(0);
      setInterimText("");
      setChunkCounter(0);

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
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

      // Improved recording configuration for better speech recognition
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
        web: {
          mimeType: "audio/wav",
          bitsPerSecond: 128000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);

      setRecording(recording);
      setIsRecording(true);

      // Start timer for recording duration
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setRecordingTimer(timer);

      // Simulate real-time transcription by processing chunks
      const realtimeInterval = setInterval(async () => {
        setChunkCounter((prev) => {
          const newCount = prev + 1;
          // Simulate progressive text appearing
          if (newCount % 3 === 0) {
            setSpeechError("🎤 Listening...");
          } else if (newCount % 3 === 1) {
            setSpeechError("🎤 Processing speech...");
          } else {
            setSpeechError("🎤 Detecting words...");
          }
          return newCount;
        });
      }, 1500);

      // Store interval for cleanup
      recording._realtimeInterval = realtimeInterval;
    } catch (err) {
      console.error("Failed to start recording", err);
      setSpeechError("Failed to start recording: " + err.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsProcessing(true);
      setSpeechError("Wait a moment...");

      // Clear timers0000
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      if (recording._realtimeInterval) {
        clearInterval(recording._realtimeInterval);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        await transcribeAudio(uri);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      setSpeechError("Failed to stop recording");
      setIsProcessing(false);
    }
  };

  // Animate text appearing sequentially
  const animateTextAppearing = (finalText, startIndex) => {
    const words = finalText.slice(startIndex).split(" ");
    let wordIndex = 0;

    const animationInterval = setInterval(() => {
      if (wordIndex < words.length) {
        const currentBase = finalText.substring(0, startIndex);
        const wordsToShow = words.slice(0, wordIndex + 1);
        const animatedText =
          startIndex > 0
            ? `${currentBase} ${wordsToShow.join(" ")}`
            : wordsToShow.join(" ");

        setDescription(animatedText);
        wordIndex++;
      } else {
        clearInterval(animationInterval);
        setDescription(finalText);
      }
    }, 150); // Show each word every 150ms
  };

  // Toggle recording with single tap
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const transcribeAudio = async (uri) => {
    try {
      setSpeechError("🔄 Converting audio to text...");

      // Check if file exists first
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error("Audio file not found");
      }

      console.log("Audio file size:", fileInfo.size, "bytes");

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      if (!base64) {
        throw new Error("Failed to read audio file");
      }

      // Special handling for Sinhala - try multiple approaches
      let configs = [];

      if (selectedLanguage === "si-LK") {
        // Try different configurations for Sinhala
        configs = [
          {
            encoding: "LINEAR16",
            sampleRateHertz: 16000,
            languageCode: "si-LK",
            enableAutomaticPunctuation: false,
            model: "default",
          },
          {
            encoding: "LINEAR16",
            sampleRateHertz: 16000,
            languageCode: "en-US",
            alternativeLanguageCodes: ["hi-IN", "ta-IN"],
            enableAutomaticPunctuation: true,
            model: "latest_long",
          },
        ];
      } else {
        // Standard configuration for other languages
        configs = [
          {
            encoding: "LINEAR16",
            sampleRateHertz: 16000,
            languageCode: selectedLanguage,
            alternativeLanguageCodes:
              selectedLanguage === "en-US"
                ? ["si-LK", "ta-IN"]
                : ["si-LK", "en-US"],
            enableAutomaticPunctuation: true,
            useEnhanced: true,
            model: "latest_long",
          },
        ];
      }

      // Try each configuration until one works
      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        console.log(`Trying config ${i + 1}:`, config);

        try {
          const response = await fetch(
            `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                config,
                audio: {
                  content: base64,
                },
              }),
            }
          );

          const result = await response.json();
          console.log(`Config ${i + 1} result:`, result);

          if (result.error) {
            console.error(`Config ${i + 1} API Error:`, result.error);
            if (i === configs.length - 1) {
              setSpeechError(`❌ API Error: ${result.error.message}`);
              setIsProcessing(false);
            }
            continue;
          }

          if (
            result.results &&
            result.results[0] &&
            result.results[0].alternatives[0]
          ) {
            const transcript =
              result.results[0].alternatives[0].transcript.trim();
            console.log("Transcript received:", transcript);

            if (transcript) {
              // Animate text appearing in the box sequentially
              setSpeechError("✅ Speech recognized successfully!");

              // Add the new text with a space if there's existing content
              const currentText = description.trim();
              const newText = currentText
                ? `${currentText} ${transcript}`
                : transcript;

              // Animate the text by showing it word by word
              animateTextAppearing(newText, currentText.length);

              // Clear success message after 2 seconds
              setTimeout(() => {
                setSpeechError("");
              }, 2000);

              setIsProcessing(false);
              return; // Success, exit the loop
            } else {
              console.log("Empty transcript received");
              if (i === configs.length - 1) {
                throw new Error(
                  "No speech detected. Please speak more clearly."
                );
              }
            }
          } else {
            console.log("No results in speech API response");
            if (i === configs.length - 1) {
              throw new Error(
                "No speech detected. Please try speaking louder and more clearly."
              );
            }
          }
        } catch (err) {
          console.error(`Config ${i + 1} failed:`, err);
          if (i === configs.length - 1) {
            setSpeechError(`❌ Error: ${err.message}`);
            setIsProcessing(false);
          }
        }
      }

      // If we get here, no configuration worked
      setSpeechError("❌ Could not understand speech. Please try again.");
      setIsProcessing(false);

      setTimeout(() => {
        setSpeechError("");
      }, 3000);
    } catch (err) {
      console.error("Error transcribing audio", err);

      // Provide more specific error messages
      let errorMessage = "Speech transcription failed";

      if (err.message.includes("Base64") || err.message.includes("undefined")) {
        errorMessage = "Audio file processing failed. Please try again.";
      } else if (err.message.includes("Network")) {
        errorMessage = "Network error. Check your internet connection.";
      } else if (err.message.includes("API Error")) {
        errorMessage = "Speech API error. Please try again.";
      } else {
        errorMessage = err.message;
      }

      setSpeechError(`❌ ${errorMessage}`);
      setIsProcessing(false);

      // Clear error message after 4 seconds
      setTimeout(() => {
        setSpeechError("");
      }, 4000);
    }
  };

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

      // Use Google Reverse Geocoding API for better address formatting
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_API_KEY}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;

        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: formattedAddress,
        });
        setQuery(formattedAddress); // Show in form
        setResults([]); // Clear search results
        setShowMap(true);
        setLocationMethod("current"); // Mark as current location
      } else {
        // Fallback to Expo's reverse geocoding if Google API fails
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
        setQuery(formattedAddress);
        setResults([]);
        setShowMap(true);
        setLocationMethod("current");
      }
    } catch (error) {
      console.error("Failed to get location:", error);
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
      const formData = new FormData();
      // Combine main category and subcategory for more descriptive category field
      const fullCategory = `${categoryTitle} - ${subcategory}`;
      formData.append("category", fullCategory);
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());
      formData.append("address", location.address || "");
      formData.append("description", description);

      if (!postAnonymous) {
        formData.append("full_name", fullName);
        formData.append("nic", nicNumber);
        formData.append("contact_number", contactNumber);
      }

      media.forEach((item, i) => {
        let fileType = item.type === "video" ? "video/mp4" : "image/jpeg";
        let fileExt = item.type === "video" ? "mp4" : "jpg";
        formData.append("evidence", {
          uri: item.uri,
          type: fileType,
          name: `evidence_${i}.${fileExt}`,
        });
      });

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        // ❌ Removed manual headers (fetch will set correct multipart boundary)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${errorText}`);
      }

      const result = await response.json();
      console.log("Report submitted:", result);
      router.push("/submission-success");
    } catch (error) {
      alert("Submission failed: " + error.message);
    } finally {
      // ✅ Always stop loading spinner
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
        <Text style={styles.title}>{subcategory}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
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
                onFocus={() => handleTextInputFocus(200)}
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

          {/* Language Selector for Speech Recognition */}
          <View style={styles.languageSelectorContainer}>
            <Text style={styles.languageSelectorLabel}>Speech Language:</Text>
            <View style={styles.languageButtons}>
              {languageOptions.map((option) => (
                <TouchableOpacity
                  key={option.code}
                  style={[
                    styles.languageButton,
                    selectedLanguage === option.code &&
                      styles.languageButtonActive,
                  ]}
                  onPress={() => setSelectedLanguage(option.code)}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      selectedLanguage === option.code &&
                        styles.languageButtonTextActive,
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue in detail..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
            onFocus={() => handleTextInputFocus(400)}
          />

          {/* Speech Control Bar - Always visible */}
          <TouchableOpacity
            style={[
              styles.speechControlBar,
              isRecording && styles.speechControlBarRecording,
              isProcessing && styles.speechControlBarProcessing,
            ]}
            onPress={toggleRecording}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator size={16} color="#FFFFFF" />
                <Text style={styles.speechControlText}>Processing...</Text>
              </>
            ) : isRecording ? (
              <>
                <View style={styles.stopIcon} />
                <Text style={styles.speechControlText}>
                  Tap to stop • {Math.floor(recordingDuration / 60)}:
                  {(recordingDuration % 60).toString().padStart(2, "0")}
                </Text>
                <View style={styles.recordingIndicator} />
              </>
            ) : (
              <>
                <Mic size={16} color="#007AFF" />
                <Text style={styles.speechControlTextInactive}>
                  Tap to speak
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Enhanced Status Messages */}
          {speechError ? (
            <View
              style={[
                styles.speechMessageContainer,
                speechError.includes("✅") && styles.speechSuccessContainer,
                speechError.includes("❌") && styles.speechErrorContainer,
                speechError.includes("🎤") && styles.speechRecordingContainer,
                speechError.includes("🔄") && styles.speechProcessingContainer,
              ]}
            >
              <Text
                style={[
                  styles.speechMessageText,
                  speechError.includes("✅") && styles.speechSuccessText,
                  speechError.includes("❌") && styles.speechErrorText,
                  speechError.includes("🎤") && styles.speechRecordingText,
                  speechError.includes("🔄") && styles.speechProcessingText,
                ]}
              >
                {speechError}
              </Text>
            </View>
          ) : null}

          {/* Clear Text Button - Only show when there's text and not recording */}
          {description && !isRecording && !isProcessing && (
            <TouchableOpacity
              style={styles.clearTextButton}
              onPress={() => setDescription("")}
            >
              <X size={14} color="#FF3B30" />
              <Text style={styles.clearTextButtonText}>Clear text</Text>
            </TouchableOpacity>
          )}
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
              Contact Info {postAnonymous ? "(Not Required)" : "(Required)"}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            editable={!postAnonymous}
            onFocus={() => handleTextInputFocus(800)}
          />

          <TextInput
            style={styles.input}
            placeholder="NIC number"
            value={nicNumber}
            onChangeText={setNicNumber}
            editable={!postAnonymous}
            onFocus={() => handleTextInputFocus(850)}
          />

          <TextInput
            style={styles.input}
            placeholder="Contact number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
            editable={!postAnonymous}
            onFocus={() => handleTextInputFocus(900)}
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
  scrollContent: {
    paddingBottom: 100, // Extra padding at bottom for keyboard
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
  map: { height: 200, borderRadius: 8, marginTop: 10 },
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
  },
  speechControlBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  speechControlBarRecording: {
    backgroundColor: "#FF3B30",
    borderColor: "#FF3B30",
  },
  speechControlBarProcessing: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  speechControlText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  speechControlTextInactive: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  stopIcon: {
    width: 12,
    height: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    marginLeft: 8,
    opacity: 0.8,
  },
  clearTextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: "center",
  },
  clearTextButtonText: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  micButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonRecording: {
    backgroundColor: "#FF3B30",
    borderColor: "#FF3B30",
  },
  micButtonProcessing: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  recordingDurationContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordingDurationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  speechMessageContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#F2F2F7",
  },
  speechSuccessContainer: {
    backgroundColor: "#E8F5E8",
  },
  speechErrorContainer: {
    backgroundColor: "#FFEBEE",
  },
  speechRecordingContainer: {
    backgroundColor: "#E3F2FD",
  },
  speechProcessingContainer: {
    backgroundColor: "#FFF3E0",
  },
  speechMessageText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
  speechSuccessText: {
    color: "#4CAF50",
  },
  speechErrorText: {
    color: "#FF3B30",
  },
  speechRecordingText: {
    color: "#007AFF",
  },
  speechProcessingText: {
    color: "#FF9800",
  },
  recordingInstructionsContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  recordingInstructions: {
    fontSize: 14,
    color: "#007AFF",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 8,
  },
  recordingWaveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingWave: {
    width: 4,
    backgroundColor: "#007AFF",
    borderRadius: 2,
    marginHorizontal: 2,
  },
  wave1: {
    height: 12,
    animationDuration: "1s",
  },
  wave2: {
    height: 18,
    animationDuration: "1.2s",
  },
  wave3: {
    height: 12,
    animationDuration: "0.8s",
  },
  speechQuickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  quickActionText: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 4,
    fontWeight: "500",
  },
  recordingText: {
    color: "#007AFF",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
    fontWeight: "500",
  },
  languageSelectorContainer: {
    marginBottom: 16,
  },
  languageSelectorLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  languageButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#F2F2F7",
  },
  languageButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  languageButtonText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  languageButtonTextActive: {
    color: "#FFFFFF",
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
  submitButtonDisabled: { backgroundColor: "#A0A0A0" },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
