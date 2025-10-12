// app/_layout.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from "./context/ThemeContext";

const PUBLIC_ROUTES = new Set(["/login", "/register", "/onboard"]);

export default function RootLayout() {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [token, storedRole, onboardingStatus] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("role"),
          AsyncStorage.getItem("onboardingCompleted"),
        ]);
        setAuthed(!!token);
        setRole(storedRole || null);
        setOnboardingCompleted(onboardingStatus === "true");
      } catch (e) {
        setAuthed(false);
        setRole(null);
        setOnboardingCompleted(false);
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

  // If onboarding not completed and not on onboarding screen, redirect to onboarding
  if (!onboardingCompleted && !pathname.startsWith("/onboard")) {
    return <Redirect href="/onboard" />;
  }

  // If not authenticated, allow only /login, /register, and /onboard
  if (
    !authed &&
    !PUBLIC_ROUTES.has(pathname) &&
    !pathname.startsWith("/onboard")
  ) {
    return <Redirect href="/login" />;
  }

  // If authenticated and currently on /login or /register,
  // send them to the right home:
  if (authed && PUBLIC_ROUTES.has(pathname)) {
    if (role === "policeman") return <Redirect href="/police" />;
    return <Redirect href="/" />; // (tabs)/index
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="onboard">
        <StatusBar style="auto" />
        {/* Onboarding */}
        <Stack.Screen name="onboard" />

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
    </ThemeProvider>
    </Stack>
    </GestureHandlerRootView>
  );
}
