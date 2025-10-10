import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Heart,
    Share,
    Star,
    ThumbsUp
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RateApp() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const ratingOptions = [
    { value: 1, label: "Poor", color: "#FF3B30" },
    { value: 2, label: "Fair", color: "#FF9500" },
    { value: 3, label: "Good", color: "#FFCC00" },
    { value: 4, label: "Very Good", color: "#32D74B" },
    { value: 5, label: "Excellent", color: "#32D74B" },
  ];

  const appStores = [
    {
      name: "App Store",
      icon: "🍎",
      url: "https://apps.apple.com/app/dutycall",
      description: "Rate us on the Apple App Store",
    },
    {
      name: "Google Play",
      icon: "📱",
      url: "https://play.google.com/store/apps/details?id=com.dutycall.app",
      description: "Rate us on Google Play Store",
    },
  ];

  const handleRatingSelect = (value) => {
    setRating(value);
  };

  const handleSubmitRating = () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting.");
      return;
    }

    setHasSubmitted(true);
    Alert.alert(
      "Thank You!",
      "Your rating has been submitted. We appreciate your feedback!",
      [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setRating(0);
            setFeedback("");
            setHasSubmitted(false);
          },
        },
      ]
    );
  };

  const handleStoreRating = (store) => {
    Alert.alert(
      "Rate on App Store",
      `Would you like to rate DutyCall on ${store.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Rate Now",
          onPress: () => {
            Linking.openURL(store.url).catch(() => {
              Alert.alert("Error", "Unable to open the app store");
            });
          },
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert(
      "Share DutyCall",
      "Help others discover DutyCall by sharing it with your friends and family!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: () => {
            // In a real app, you would use the Share API here
            Alert.alert("Shared!", "Thank you for sharing DutyCall!");
          },
        },
      ]
    );
  };

  const renderStar = (index) => (
    <TouchableOpacity
      key={index}
      onPress={() => handleRatingSelect(index + 1)}
      style={styles.starButton}
    >
      <Star
        size={32}
        color={index < rating ? "#FFCC00" : "#E5E5EA"}
        fill={index < rating ? "#FFCC00" : "transparent"}
      />
    </TouchableOpacity>
  );

  const renderRatingOption = (option) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.ratingOption,
        rating === option.value && styles.ratingOptionSelected,
      ]}
      onPress={() => handleRatingSelect(option.value)}
    >
      <Text
        style={[
          styles.ratingOptionText,
          rating === option.value && styles.ratingOptionTextSelected,
        ]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderStore = (store) => (
    <TouchableOpacity
      key={store.name}
      style={styles.storeItem}
      onPress={() => handleStoreRating(store)}
    >
      <Text style={styles.storeIcon}>{store.icon}</Text>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeDescription}>{store.description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Rate App</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingHeader}>
            <Heart size={32} color="#FF3B30" />
            <Text style={styles.ratingTitle}>How was your experience?</Text>
            <Text style={styles.ratingSubtitle}>
              Your feedback helps us improve DutyCall for everyone
            </Text>
          </View>

          {/* Star Rating */}
          <View style={styles.starContainer}>
            {[0, 1, 2, 3, 4].map(renderStar)}
          </View>

          {/* Rating Options */}
          <View style={styles.ratingOptions}>
            {ratingOptions.map(renderRatingOption)}
          </View>

          {/* Feedback Input */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackLabel}>Tell us more (optional)</Text>
            <TextInput
              style={styles.feedbackInput}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="What did you like? What could we improve?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#8E8E93"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              rating === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitRating}
            disabled={rating === 0}
          >
            <ThumbsUp size={16} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          </TouchableOpacity>
        </View>

        {/* App Store Ratings */}
        <View style={styles.storeSection}>
          <Text style={styles.sectionTitle}>Rate on App Stores</Text>
          <View style={styles.storeContainer}>
            {appStores.map(renderStore)}
          </View>
        </View>

        {/* Share Section */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share DutyCall</Text>
          <View style={styles.shareContainer}>
            <View style={styles.shareContent}>
              <Share size={24} color="#007AFF" />
              <View style={styles.shareInfo}>
                <Text style={styles.shareTitle}>Help others discover DutyCall</Text>
                <Text style={styles.shareDescription}>
                  Share the app with friends and family to help improve public safety in Sri Lanka
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Thank You Message */}
        {hasSubmitted && (
          <View style={styles.thankYouSection}>
            <Heart size={48} color="#FF3B30" />
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouText}>
              Your feedback is valuable to us. We're constantly working to improve 
              DutyCall based on user input like yours.
            </Text>
          </View>
        )}

        {/* App Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>DutyCall Impact</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10,000+</Text>
              <Text style={styles.statLabel}>Reports Submitted</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Issues Resolved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>User Rating</Text>
            </View>
          </View>
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  ratingSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  ratingSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  ratingOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  ratingOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  ratingOptionSelected: {
    backgroundColor: "#007AFF",
  },
  ratingOptionText: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  ratingOptionTextSelected: {
    color: "#FFFFFF",
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    minHeight: 100,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#8E8E93",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  storeSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  storeContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  storeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  storeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  chevron: {
    fontSize: 18,
    color: "#C7C7CC",
    fontWeight: "300",
  },
  shareSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  shareContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  shareContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  shareInfo: {
    flex: 1,
    marginLeft: 12,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  shareDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  thankYouSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginTop: 16,
    marginBottom: 12,
  },
  thankYouText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
});
