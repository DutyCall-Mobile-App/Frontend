// app/(police-tabs)/profile.jsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Officer Profile</Text>
      <Text>Name: Inspector Nimal</Text>
      <Text>Badge: PC-2025-007</Text>

      <Pressable style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  back: {
    marginTop: 20,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 6,
  },
  backText: { color: "white", textAlign: "center" },
});
