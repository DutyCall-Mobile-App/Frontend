// app/(police-tabs)/profile.jsx
import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from "@expo/vector-icons";

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove(['token', 'role']);
              // Navigate to login screen
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Officer Profile</Text>
      <Text>Name: Inspector Nimal</Text>
      <Text>Badge: PC-2025-007</Text>

      <View style={styles.buttonContainer}>
        <Pressable 
          style={styles.back} 
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>⬅️ Back</Text>
        </Pressable>

        <Pressable 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: "center" 
  },
  title: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10
  },
  back: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 6,
  },
  backText: { 
    color: "white", 
    textAlign: "center" 
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center"
  }
});
