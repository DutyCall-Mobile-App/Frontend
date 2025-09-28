import { useRouter } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    FileText,
    Shield,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TermsService() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const termsSections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: CheckCircle,
      content: `By downloading, installing, or using the DutyCall mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.

These Terms constitute a legally binding agreement between you and DutyCall Technologies ("Company", "we", "us", or "our").`,
    },
    {
      id: "description",
      title: "2. Description of Service",
      icon: FileText,
      content: `DutyCall is a mobile application that allows users to report public safety issues, infrastructure problems, environmental concerns, and other civic matters to relevant authorities in Sri Lanka.

The App provides features including:
- Report submission with photos, videos, and location data
- Speech-to-text functionality in multiple languages
- Anonymous reporting options
- Emergency contact information
- Status tracking of submitted reports

We reserve the right to modify, suspend, or discontinue any aspect of the App at any time.`,
    },
    {
      id: "user-accounts",
      title: "3. User Accounts and Registration",
      icon: Users,
      content: `To use certain features of the App, you may be required to create an account. You agree to:
- Provide accurate, current, and complete information
- Maintain and update your account information
- Maintain the security of your account credentials
- Accept responsibility for all activities under your account
- Notify us immediately of any unauthorized use

You may choose to submit reports anonymously without creating an account.`,
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable Use Policy",
      icon: Shield,
      content: `You agree to use the App only for lawful purposes and in accordance with these Terms. You agree NOT to:

- Submit false, misleading, or fraudulent reports
- Submit reports containing illegal, harmful, or inappropriate content
- Use the App to harass, threaten, or intimidate others
- Attempt to gain unauthorized access to the App or its systems
- Use automated systems to access the App
- Violate any applicable laws or regulations
- Submit reports that infringe on intellectual property rights
- Use the App for commercial purposes without permission

We reserve the right to suspend or terminate accounts that violate this policy.`,
    },
    {
      id: "content-submission",
      title: "5. Content Submission and Ownership",
      icon: FileText,
      content: `When you submit reports through the App, you retain ownership of your content but grant us a license to:
- Process and forward your reports to relevant authorities
- Use your content to improve our services
- Display your content in accordance with your privacy settings
- Store your content for service delivery purposes

You represent and warrant that:
- You have the right to submit the content
- The content is accurate and truthful
- The content does not violate any laws or third-party rights
- You have obtained necessary permissions for any third-party content

We are not responsible for the accuracy or truthfulness of user-submitted content.`,
    },
    {
      id: "privacy",
      title: "6. Privacy and Data Protection",
      icon: Shield,
      content: `Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.

Key privacy principles:
- We collect only necessary information to provide our services
- You can choose to submit reports anonymously
- We implement appropriate security measures to protect your data
- We may share information with relevant authorities as necessary
- We comply with applicable data protection laws in Sri Lanka

By using the App, you consent to our collection and use of information as described in our Privacy Policy.`,
    },
    {
      id: "disclaimers",
      title: "7. Disclaimers and Limitations",
      icon: AlertTriangle,
      content: `THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

- WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
- WARRANTIES REGARDING THE ACCURACY OR RELIABILITY OF THE APP
- WARRANTIES THAT THE APP WILL BE UNINTERRUPTED OR ERROR-FREE
- WARRANTIES REGARDING THE TIMELINESS OF RESPONSES TO REPORTS

WE ARE NOT RESPONSIBLE FOR:
- The actions or responses of government authorities
- The accuracy of user-submitted reports
- Technical issues or service interruptions
- Third-party content or services
- Any damages resulting from the use of the App

TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR LIABILITY IS LIMITED TO THE AMOUNT YOU PAID TO USE THE APP (IF ANY).`,
    },
    {
      id: "indemnification",
      title: "8. Indemnification",
      icon: Shield,
      content: `You agree to indemnify and hold harmless DutyCall Technologies, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from:

- Your use of the App
- Your violation of these Terms
- Your violation of any law or regulation
- Your violation of any third-party rights
- Content you submit through the App

This indemnification obligation will survive the termination of these Terms and your use of the App.`,
    },
    {
      id: "termination",
      title: "9. Termination",
      icon: AlertTriangle,
      content: `We may terminate or suspend your access to the App at any time, with or without notice, for any reason, including:

- Violation of these Terms
- Fraudulent or illegal activity
- Technical or security reasons
- Business or operational reasons

You may stop using the App at any time. Upon termination:
- Your right to use the App ceases immediately
- We may delete your account and associated data
- Certain provisions of these Terms will survive termination

We are not liable for any damages resulting from termination.`,
    },
    {
      id: "governing-law",
      title: "10. Governing Law and Disputes",
      icon: FileText,
      content: `These Terms are governed by the laws of Sri Lanka. Any disputes arising from these Terms or your use of the App will be subject to the exclusive jurisdiction of the courts of Sri Lanka.

Before pursuing legal action, we encourage you to contact us to resolve any disputes informally. We are committed to working with users to resolve issues fairly and efficiently.

If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.`,
    },
    {
      id: "changes",
      title: "11. Changes to Terms",
      icon: FileText,
      content: `We reserve the right to modify these Terms at any time. We will notify users of material changes through:

- In-app notifications
- Email notifications (if applicable)
- Updates to this Terms of Service page

Your continued use of the App after changes become effective constitutes acceptance of the new Terms. If you do not agree to the changes, you must stop using the App.

We recommend reviewing these Terms periodically to stay informed of any updates.`,
    },
    {
      id: "contact",
      title: "12. Contact Information",
      icon: Users,
      content: `If you have questions about these Terms of Service, please contact us:

DutyCall Technologies
123 Main Street
Colombo 03, Sri Lanka

Email: legal@dutycall.lk
Phone: +94 11 234 5678

For general support inquiries, please use: support@dutycall.lk

We will respond to all inquiries within 5 business days.`,
    },
  ];

  const renderSection = (section) => (
    <View key={section.id} style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section.id)}
      >
        <View style={styles.sectionTitleContainer}>
          <section.icon size={20} color="#007AFF" />
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <Text style={styles.expandIcon}>
          {expandedSections[section.id] ? "−" : "+"}
        </Text>
      </TouchableOpacity>
      
      {expandedSections[section.id] && (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText}>{section.content}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Terms of Service</Text>
          <Text style={styles.introSubtitle}>Last Updated: January 15, 2024</Text>
          <Text style={styles.introText}>
            Please read these Terms of Service carefully before using the DutyCall mobile application. 
            These terms govern your use of our service and outline your rights and responsibilities.
          </Text>
        </View>

        {/* Terms Sections */}
        <View style={styles.termsContainer}>
          {termsSections.map(renderSection)}
        </View>

        {/* Agreement */}
        <View style={styles.agreementSection}>
          <Text style={styles.agreementTitle}>Agreement to Terms</Text>
          <Text style={styles.agreementText}>
            By using the DutyCall app, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Service.
          </Text>
          
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
  introSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 24,
  },
  termsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 12,
    flex: 1,
  },
  expandIcon: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "300",
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 22,
  },
  agreementSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  agreementTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  agreementText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    marginBottom: 20,
  },
  agreementActions: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#32D74B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  declineButtonText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "600",
  },
});
