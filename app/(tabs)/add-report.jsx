// Updated add-report.jsx (pass categoryTitle to report-form)
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Construction,
  FileText,
  Leaf,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useState } from "react";

const categories = [
  {
    id: "public-safety",
    title: "Public Safety & Security",
    icon: Shield,
    color: "#FF3B30",
    subcategories: [
      "Suspicious activity / persons",
      "Lost or found property",
      "Traffic violations",
      "Vandalism / property damage",
      "Stray animals causing danger",
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure & Road Safety",
    icon: Construction,
    color: "#FF9500",
    subcategories: [
      "Damaged or missing traffic signs",
      "Broken streetlights in public areas",
      "Potholes or road hazards",
      "Malfunctioning traffic lights",
    ],
  },
  {
    id: "environmental",
    title: "Environmental Concerns",
    icon: Leaf,
    color: "#32D74B",
    subcategories: [
      "Illegal dumping / garbage accumulation",
      "Water contamination / unsafe water",
      "Smoke, fumes, or air pollution reports",
      "Overflowing drains in public areas",
    ],
  },
  {
    id: "civil",
    title: "Civil & Administrative Issues",
    icon: FileText,
    color: "#007AFF",
    subcategories: [
      "Land/property disputes",
      "Fraud/scam reports",
      "Harassment reports ",
      "Noise complaints",
    ],
  },
  {
    id: "community",
    title: "Community Assistance",
    icon: Users,
    color: "#AF52DE",
    subcategories: [
      "Missing persons alerts",
      "Assistance for vulnerable persons",
    ],
  },
];

export default function AddReport() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = Array.isArray(categories)
    ? categories.filter(
        (category) =>
          category?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          category?.subcategories?.some((sub) =>
            sub?.toLowerCase()?.includes(searchQuery.toLowerCase())
          )
      )
    : [];

  const handleCategorySelect = (categoryId, subcategory, categoryTitle) => {
    router.push({
      pathname: "/report-form",
      params: {
        categoryId,
        subcategory: subcategory || "",
        categoryTitle,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report a new Issue</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={16} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Category"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8E8E93"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCategories.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: `${category.color}15` },
                ]}
              >
                <category.icon size={20} color={category.color} />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            {category.subcategories.map((subcategory, index) => (
              <TouchableOpacity
                key={index}
                style={styles.subcategoryItem}
                onPress={() =>
                  handleCategorySelect(category.id, subcategory, category.title)
                }
              >
                <Text style={styles.subcategoryText}>{subcategory}</Text>
                <ChevronRight size={16} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9EB",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  subcategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  subcategoryText: {
    fontSize: 15,
    color: "#000000",
    flex: 1,
  },
});
