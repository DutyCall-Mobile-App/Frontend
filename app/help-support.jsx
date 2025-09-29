import { useRouter } from "expo-router";
import {
    ArrowLeft,
    BookOpen,
    ChevronRight,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Search,
} from "lucide-react-native";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function HelpSupport() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        {
          question: "How do I submit a report?",
          answer: "Tap the 'Add Report' button, select a category, fill in the details, and submit.",
        },
        {
          question: "Can I submit anonymous reports?",
          answer: "Yes, you can choose to submit reports anonymously for your privacy.",
        },
        {
          question: "What types of reports can I submit?",
          answer: "You can report public safety issues, infrastructure problems, environmental concerns, and more.",
        },
      ],
    },
    {
      title: "Account & Profile",
      questions: [
        {
          question: "How do I update my profile?",
          answer: "Go to Settings > Profile to update your personal information.",
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email in the profile settings.",
        },
        {
          question: "How do I reset my password?",
          answer: "Use the 'Forgot Password' option on the login screen.",
        },
      ],
    },
    {
      title: "Technical Issues",
      questions: [
        {
          question: "The app is not working properly",
          answer: "Try restarting the app or updating to the latest version.",
        },
        {
          question: "I can't upload photos",
          answer: "Check your internet connection and ensure you have granted camera permissions.",
        },
        {
          question: "Location services not working",
          answer: "Make sure location services are enabled in your device settings.",
        },
      ],
    },
  ];

  const contactOptions = [
    {
      icon: Phone,
      title: "Emergency Hotline",
      subtitle: "Call 1990 for immediate assistance",
      type: "phone",
      value: "1990",
    },
    {
      icon: Mail,
      title: "Email Support",
      subtitle: "support@dutycall.lk",
      type: "email",
      value: "support@dutycall.lk",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      subtitle: "Chat with our support team",
      type: "chat",
    },
  ];

  const quickActions = [
    {
      icon: BookOpen,
      title: "App Tutorial",
      subtitle: "Learn how to use the app",
      action: () => Alert.alert("Tutorial", "App tutorial coming soon!"),
    },
    {
      icon: HelpCircle,
      title: "Report a Bug",
      subtitle: "Help us improve the app",
      action: () => Alert.alert("Bug Report", "Bug reporting feature coming soon!"),
    },
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const renderFAQItem = (question, answer, index) => (
    <View key={index} style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );

  const renderContactItem = (item, index) => (
    <TouchableOpacity key={index} style={styles.contactItem}>
      <View style={styles.contactIconContainer}>
        <item.icon size={20} color="#007AFF" />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{item.title}</Text>
        <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderQuickAction = (item, index) => (
    <TouchableOpacity key={index} style={styles.quickActionItem} onPress={item.action}>
      <View style={styles.quickActionIconContainer}>
        <item.icon size={20} color="#007AFF" />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{item.title}</Text>
        <Text style={styles.quickActionSubtitle}>{item.subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderSection = (title, items, renderFunction) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContainer}>
        {items.map((item, index) => renderFunction(item, index))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>

        

        {/* FAQ */}
        {filteredFAQs.map((category) => (
          <View key={category.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{category.title}</Text>
            <View style={styles.sectionContainer}>
              {category.questions.map((faq, index) => renderFAQItem(faq.question, faq.answer, index))}
            </View>
          </View>
        ))}

        {/* No Results */}
        {searchQuery && filteredFAQs.length === 0 && (
          <View style={styles.noResultsContainer}>
            <HelpCircle size={48} color="#8E8E93" />
            <Text style={styles.noResultsTitle}>No results found</Text>
            <Text style={styles.noResultsSubtitle}>
              Try searching with different keywords or contact our support team.
            </Text>
          </View>
        )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#000000",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  quickActionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
  },
  noResultsContainer: {
    alignItems: "center",
    padding: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});
