import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "../hooks/useFrameworkReady";

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="emergency-sos" options={{ headerShown: false }} />
        <Stack.Screen name="my-reports" options={{ headerShown: false }} />
        <Stack.Screen name="report-form" options={{ headerShown: false }} />
        <Stack.Screen name="report-details" options={{ headerShown: false }} />
        <Stack.Screen
          name="submission-success"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="edit-report" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile-settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
