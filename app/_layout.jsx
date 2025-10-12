// app/_layout.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const PUBLIC_ROUTES = new Set(["/login", "/register"]);

export default function RootLayout() {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [token, storedRole] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("role"),
        ]);
        setAuthed(!!token);
        setRole(storedRole || null);
      } catch (e) {
        setAuthed(false);
        setRole(null);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // If not authenticated, allow only /login and /register
  if (!authed && !PUBLIC_ROUTES.has(pathname)) {
    return <Redirect href="/login" />;
  }

  // If authenticated and currently on /login or /register,
  // send them to the right home:
  if (authed && PUBLIC_ROUTES.has(pathname)) {
    if (role === "policeman") return <Redirect href="/police-dashboard" />;
    return <Redirect href="/" />; // (tabs)/index
  }

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
      {/* Public */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />

      {/* Tabs group (your Home, Add Report, Settings) */}
      <Stack.Screen name="(tabs)" />

      {/* Private routes (short aliases added in step 2) */}
      <Stack.Screen name="police-dashboard" />
      <Stack.Screen name="police-chat-detail" />
      <Stack.Screen name="user-profile" />

      <Stack.Screen name="emergency-sos"  />
        <Stack.Screen name="my-reports"  />
         <Stack.Screen name="report-form"  />
         <Stack.Screen name="report-details"  />
    </Stack>
  );
}
