import { useRouter } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    Database,
    Eye,
    Globe,
    Lock,
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

export default function PrivacyPolicy() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const privacySections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: Shield,
      content: `DutyCall Technologies ("we", "us", or "our") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the DutyCall mobile application ("App").

By using our App, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our App.

This Privacy Policy is effective as of January 15, 2024, and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.`,
    },
    {
      id: "information-collection",
      title: "2. Information We Collect",
      icon: Database,
      content: `We collect several types of information from and about users of our App:

**Personal Information:**
- Name and contact information (when you choose to provide it)
- Email address (if you create an account)
- Phone number (if provided)
- Profile information and preferences

**Report Information:**
- Content of reports you submit (text, photos, videos, audio)
- Location data (GPS coordinates, addresses)
- Timestamps of report submissions
- Category and type of reports

**Device Information:**
- Device type, operating system, and version
- App version and usage statistics
- IP address and network information
- Device identifiers and crash reports

**Usage Information:**
- How you interact with the App
- Features you use most frequently
- Time spent in the App
- Error logs and performance data

**Anonymous Information:**
- Aggregated usage statistics
- General location data (city/region level)
- App performance metrics`,
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      icon: Eye,
      content: `We use the information we collect for various purposes:

**Service Delivery:**
- Process and forward your reports to relevant authorities
- Provide customer support and respond to inquiries
- Maintain and improve the App's functionality
- Send important updates and notifications

**Communication:**
- Respond to your questions and requests
- Send service-related notifications
- Provide updates about your reports
- Send emergency alerts when necessary

**App Improvement:**
- Analyze usage patterns to improve user experience
- Identify and fix technical issues
- Develop new features and functionality
- Conduct research and analytics

**Legal Compliance:**
- Comply with applicable laws and regulations
- Respond to legal requests and court orders
- Protect our rights and prevent fraud
- Ensure public safety and security

**Anonymous Reporting:**
- We respect your choice to submit reports anonymously
- Anonymous reports are processed without personal identifiers
- We may still collect technical data for service improvement`,
    },
    {
      id: "information-sharing",
      title: "4. Information Sharing and Disclosure",
      icon: Users,
      content: `We may share your information in the following circumstances:

**Government Authorities:**
- Forward reports to relevant government departments
- Share information with emergency services when necessary
- Comply with legal requirements and court orders
- Assist in public safety investigations

**Service Providers:**
- Third-party companies that help us operate the App
- Cloud storage and data processing services
- Analytics and crash reporting services
- Customer support platforms

**Business Transfers:**
- In case of merger, acquisition, or sale of assets
- As part of corporate restructuring
- With your consent or as required by law

**Public Safety:**
- Share information to prevent harm or illegal activities
- Assist in emergency situations
- Protect public health and safety
- Comply with public safety regulations

**We Do NOT:**
- Sell your personal information to third parties
- Share information for marketing purposes without consent
- Provide personal data to unauthorized parties
- Use your information for purposes unrelated to our services`,
    },
    {
      id: "data-security",
      title: "5. Data Security",
      icon: Lock,
      content: `We implement appropriate technical and organizational measures to protect your information:

**Technical Safeguards:**
- Encryption of data in transit and at rest
- Secure servers and databases
- Regular security updates and patches
- Access controls and authentication systems

**Administrative Safeguards:**
- Limited access to personal information
- Employee training on data protection
- Regular security audits and assessments
- Incident response procedures

**Physical Safeguards:**
- Secure data centers and facilities
- Controlled access to physical systems
- Environmental protections for servers
- Secure disposal of hardware and media

**Data Retention:**
- We retain information only as long as necessary
- Personal data is deleted when no longer needed
- Anonymous data may be retained for research purposes
- Legal requirements may require longer retention periods

**Breach Notification:**
- We will notify you of any data breaches
- Notification will be provided within 72 hours
- We will take immediate steps to secure affected data
- We will cooperate with authorities in investigations`,
    },
    {
      id: "your-rights",
      title: "6. Your Rights and Choices",
      icon: Shield,
      content: `You have certain rights regarding your personal information:

**Access and Portability:**
- Request access to your personal information
- Receive a copy of your data in a portable format
- Know what information we have about you
- Understand how we use your information

**Correction and Updates:**
- Correct inaccurate or incomplete information
- Update your profile and preferences
- Modify your account settings
- Change your privacy preferences

**Deletion and Restriction:**
- Request deletion of your personal information
- Restrict processing of your data
- Object to certain uses of your information
- Withdraw consent where applicable

**Communication Preferences:**
- Opt out of non-essential communications
- Choose notification preferences
- Control marketing communications
- Manage emergency alert settings

**Anonymous Reporting:**
- Submit reports without providing personal information
- Use the App without creating an account
- Maintain privacy while contributing to public safety
- Choose what information to share

**To Exercise Your Rights:**
Contact us at privacy@dutycall.lk with your request. We will respond within 30 days and may require verification of your identity.`,
    },
    {
      id: "cookies-tracking",
      title: "7. Cookies and Tracking Technologies",
      icon: Globe,
      content: `We use various technologies to collect information about your use of the App:

**Cookies and Local Storage:**
- Store your preferences and settings
- Remember your login status
- Improve app performance
- Analyze usage patterns

**Analytics:**
- Google Analytics for usage statistics
- Crash reporting for technical issues
- Performance monitoring
- User behavior analysis

**Location Services:**
- GPS for accurate report locations
- Network-based location when GPS unavailable
- Location history for report accuracy
- Geofencing for relevant notifications

**Device Information:**
- Device identifiers for app functionality
- Operating system information
- App version tracking
- Hardware specifications

**Third-Party Services:**
- Maps and location services
- Push notification services
- Analytics and crash reporting
- Cloud storage and backup

You can control many of these technologies through your device settings, but disabling them may affect app functionality.`,
    },
    {
      id: "children-privacy",
      title: "8. Children's Privacy",
      icon: Users,
      content: `Our App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

**Age Verification:**
- We do not require age verification for app use
- Parents should supervise children's use of the App
- Children should not submit reports without adult supervision
- We encourage parental involvement in civic engagement

**If We Learn of Child Data Collection:**
- We will immediately delete such information
- We will notify parents if contact information is available
- We will take steps to prevent future collection
- We will cooperate with authorities if necessary

**Parental Rights:**
- Parents can request information about their child's data
- Parents can request deletion of their child's information
- Parents can restrict their child's use of the App
- Parents should contact us at privacy@dutycall.lk

**Educational Use:**
- Schools may use the App for educational purposes
- Teachers should supervise student use
- Educational reports should be clearly identified
- We support civic education initiatives`,
    },
    {
      id: "international-transfers",
      title: "9. International Data Transfers",
      icon: Globe,
      content: `Your information may be transferred to and processed in countries other than Sri Lanka:

**Data Processing Locations:**
- Cloud servers may be located internationally
- Third-party services may process data globally
- Backup systems may be in different countries
- Analytics services may be hosted abroad

**Safeguards for International Transfers:**
- We ensure adequate protection for transferred data
- We use standard contractual clauses where appropriate
- We verify that recipients provide adequate protection
- We comply with applicable data protection laws

**Your Rights Regarding Transfers:**
- You can request information about data transfers
- You can object to certain international transfers
- You can request data to be processed locally
- You can contact us about transfer concerns

**Legal Basis for Transfers:**
- Necessary for service provision
- Required for legal compliance
- Based on your consent
- In your vital interests or public interest`,
    },
    {
      id: "changes-updates",
      title: "10. Changes to This Privacy Policy",
      icon: AlertTriangle,
      content: `We may update this Privacy Policy from time to time:

**Notification of Changes:**
- We will notify you of material changes
- Updates will be posted on this page
- We may send in-app notifications
- Email notifications for significant changes

**Effective Date:**
- Changes become effective when posted
- Continued use constitutes acceptance
- You can stop using the App if you disagree
- Previous versions will be archived

**Types of Changes:**
- Updates to reflect new features
- Changes in legal requirements
- Improvements to privacy protections
- Clarifications of existing practices

**Your Options:**
- Review changes when notified
- Contact us with questions
- Update your privacy preferences
- Discontinue use if you disagree

**Contact for Questions:**
Email us at privacy@dutycall.lk with any questions about changes to this Privacy Policy.`,
    },
    {
      id: "contact-information",
      title: "11. Contact Information",
      icon: Shield,
      content: `If you have questions about this Privacy Policy or our data practices, please contact us:

**DutyCall Technologies**
123 Main Street
Colombo 03, Sri Lanka

**Email Contacts:**
- General Privacy Questions: privacy@dutycall.lk
- Data Protection Officer: dpo@dutycall.lk
- Technical Support: support@dutycall.lk
- Legal Inquiries: legal@dutycall.lk

**Phone:**
+94 11 234 5678

**Response Times:**
- General inquiries: 5 business days
- Privacy requests: 30 days
- Urgent matters: 24 hours
- Data breach notifications: 72 hours

**Office Hours:**
Monday - Friday: 8:00 AM - 6:00 PM (Sri Lanka Time)
Saturday: 9:00 AM - 1:00 PM

**Complaints:**
If you are not satisfied with our response, you may contact the relevant data protection authority in Sri Lanka.`,
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
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introHeader}>
            <Shield size={48} color="#007AFF" />
            <Text style={styles.introTitle}>Privacy Policy</Text>
            <Text style={styles.introSubtitle}>Last Updated: January 15, 2024</Text>
          </View>
          <Text style={styles.introText}>
            At DutyCall, we are committed to protecting your privacy and ensuring the security 
            of your personal information. This Privacy Policy explains how we collect, use, 
            and safeguard your data when you use our mobile application.
          </Text>
        </View>

        {/* Privacy Sections */}
        <View style={styles.privacyContainer}>
          {privacySections.map(renderSection)}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Privacy Summary</Text>
          <View style={styles.summaryPoints}>
            <View style={styles.summaryPoint}>
              <Shield size={16} color="#32D74B" />
              <Text style={styles.summaryText}>We protect your personal information with industry-standard security measures</Text>
            </View>
            <View style={styles.summaryPoint}>
              <Eye size={16} color="#32D74B" />
              <Text style={styles.summaryText}>You can submit reports anonymously without providing personal information</Text>
            </View>
            <View style={styles.summaryPoint}>
              <Lock size={16} color="#32D74B" />
              <Text style={styles.summaryText}>We only share information with relevant authorities as necessary for public safety</Text>
            </View>
            <View style={styles.summaryPoint}>
              <Users size={16} color="#32D74B" />
              <Text style={styles.summaryText}>You have control over your data and can request access, correction, or deletion</Text>
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
  introSection: {
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
  introHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginTop: 12,
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  introText: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 24,
  },
  privacyContainer: {
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
  summarySection: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  summaryPoints: {
    gap: 12,
  },
  summaryPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  summaryText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
