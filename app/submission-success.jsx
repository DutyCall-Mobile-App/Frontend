import { useRouter } from "expo-router";
import {
  CircleCheck as CheckCircle,
  FileText,
  Chrome as Home,
} from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "./context/ThemeContext";
import { getTheme } from "./utils/theme";

export default function SubmissionSuccess() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <CheckCircle size={80} color="#32D74B" />

        <Text style={[styles.title, { color: colors.text }]}>Report Submitted Successfully!</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Your report has been submitted and will be reviewed by the relevant
          authorities. You will receive updates on the status of your report.
        </Text>

        <Text style={styles.reportId}>Report ID: #1089</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Home size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: "#007AFF" }]}
            onPress={() => router.push("/my-reports")}
          >
            <FileText size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>View My Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 320,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  reportId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 32,
  },
  actions: {
    width: "100%",
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
