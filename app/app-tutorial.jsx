import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Camera,
    CheckCircle,
    ChevronRight,
    FileText,
    MapPin,
    Play,
    Shield
} from "lucide-react-native";
import { useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

const { width } = Dimensions.get("window");

export default function AppTutorial() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      id: "welcome",
      title: "Welcome to DutyCall",
      description: "Your gateway to civic engagement and public safety reporting in Sri Lanka.",
      image: "https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Welcome",
      features: [
        "Report public safety issues",
        "Submit infrastructure problems",
        "Environmental concerns",
        "Anonymous reporting option",
      ],
    },
    {
      id: "home",
      title: "Home Dashboard",
      description: "Your main hub for accessing all app features and viewing recent activity.",
      image: "https://via.placeholder.com/300x200/32D74B/FFFFFF?text=Dashboard",
      features: [
        "Quick access to report categories",
        "Recent reports and updates",
        "Emergency contacts",
        "Settings and profile",
      ],
    },
    {
      id: "report",
      title: "Creating Reports",
      description: "Learn how to submit detailed reports with photos, location, and descriptions.",
      image: "https://via.placeholder.com/300x200/FF9500/FFFFFF?text=Reports",
      features: [
        "Select appropriate category",
        "Add photos and videos",
        "Use speech-to-text",
        "Set location accurately",
      ],
    },
    {
      id: "media",
      title: "Adding Evidence",
      description: "Capture and attach photos, videos, and audio recordings to support your reports.",
      image: "https://via.placeholder.com/300x200/FF3B30/FFFFFF?text=Media",
      features: [
        "Take photos with camera",
        "Record video evidence",
        "Voice recordings",
        "Gallery selection",
      ],
    },
    {
      id: "location",
      title: "Location Services",
      description: "Accurately pinpoint the location of incidents using GPS and map selection.",
      image: "https://via.placeholder.com/300x200/8E8E93/FFFFFF?text=Location",
      features: [
        "Automatic GPS detection",
        "Manual location search",
        "Map-based selection",
        "Address verification",
      ],
    },
    {
      id: "speech",
      title: "Speech-to-Text",
      description: "Use voice input in Sinhala, English, or Tamil for faster report creation.",
      image: "https://via.placeholder.com/300x200/AF52DE/FFFFFF?text=Speech",
      features: [
        "Multi-language support",
        "Real-time transcription",
        "Voice commands",
        "Audio playback",
      ],
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      description: "Your data is protected with options for anonymous reporting and secure transmission.",
      image: "https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Privacy",
      features: [
        "Anonymous reporting",
        "Encrypted data transmission",
        "Privacy controls",
        "Secure storage",
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Stay updated on your reports and receive important safety alerts.",
      image: "https://via.placeholder.com/300x200/32D74B/FFFFFF?text=Alerts",
      features: [
        "Report status updates",
        "Emergency alerts",
        "System notifications",
        "Customizable settings",
      ],
    },
  ];

  const quickTips = [
    {
      icon: Camera,
      title: "Clear Photos",
      description: "Take clear, well-lit photos for better evidence",
    },
    {
      icon: MapPin,
      title: "Accurate Location",
      description: "Always verify your location before submitting",
    },
    {
      icon: FileText,
      title: "Detailed Description",
      description: "Provide specific details about the incident",
    },
    {
      icon: Shield,
      title: "Stay Safe",
      description: "Never put yourself in danger to report",
    },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.back();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    router.back();
  };

  const renderFeature = (feature, index) => (
    <View key={index} style={styles.featureItem}>
      <CheckCircle size={16} color="#32D74B" />
      <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
    </View>
  );

  const renderTip = (tip, index) => (
    <View key={index} style={styles.tipItem}>
      <View style={[styles.tipIcon, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}>
        <tip.icon size={20} color="#007AFF" />
      </View>
      <View style={styles.tipContent}>
        <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
        <Text style={[styles.tipDescription, { color: colors.textSecondary }]}>{tip.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>App Tutorial</Text>
        <TouchableOpacity onPress={skipTutorial} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Step */}
        <View style={[styles.stepContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.stepImageContainer}>
            <Image
              source={{ uri: tutorialSteps[currentStep].image }}
              style={styles.stepImage}
            />
            <View style={styles.playButton}>
              <Play size={24} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{tutorialSteps[currentStep].title}</Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              {tutorialSteps[currentStep].description}
            </Text>

            <View style={styles.featuresList}>
              {tutorialSteps[currentStep].features.map(renderFeature)}
            </View>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  { backgroundColor: index <= currentStep ? '#007AFF' : (isDarkMode ? colors.border : '#E5E5EA') },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentStep + 1} of {tutorialSteps.length}
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]}
            onPress={prevStep}
            disabled={currentStep === 0}
          >
            <Text style={[styles.navButtonText, { color: currentStep === 0 ? colors.textSecondary : '#007AFF' }]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, { backgroundColor: isDarkMode ? colors.inputBackground : '#F2F2F7' }]} onPress={nextStep}>
            <Text style={styles.navButtonText}>
              {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
            </Text>
            <ChevronRight size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>Quick Tips</Text>
          <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
            {quickTips.map(renderTip)}
          </View>
        </View>

        {/* Help Section */}
        <View style={[styles.helpSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>Need More Help?</Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            If you need additional assistance, visit our Help & Support section 
            or contact our customer service team.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Get Help</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  skipButton: {
    padding: 4,
  },
  skipText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  stepContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  stepImageContainer: {
    position: "relative",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  stepImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 14,
    color: "#000000",
    marginLeft: 12,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: "row",
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: "#007AFF",
  },
  progressText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  prevButton: {
    backgroundColor: "#F2F2F7",
  },
  navButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
    marginRight: 8,
  },
  navButtonDisabled: {
    color: "#8E8E93",
  },
  tipsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  helpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
