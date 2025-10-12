import { Tabs } from "expo-router";
import { Home, Plus, Settings } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../utils/theme";

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const colors = getTheme(isDarkMode);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-report"
        options={{
          title: "Reports",
          tabBarIcon: ({ size, color }) => (
            <Plus
              size={size + 8}
              color="#FFFFFF"
              strokeWidth={2}
              style={{
                backgroundColor: "#007AFF",
                borderRadius: 20,
                padding: 8,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
