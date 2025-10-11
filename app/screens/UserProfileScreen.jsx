import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useState(new Animated.Value(0))[0];

  // Fetch user info
  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data.data);
    } catch (err) {
      console.log('Session expired or network error');
    }
  };

  // Fetch user's chat
  const fetchChat = async () => {
    try {
      const res = await API.get('/chat');
      if (res.data.data.length > 0) setChat(res.data.data[0]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const sendMessage = async () => {
    if (!text) return Alert.alert('Enter message');
    try {
      await API.post('/chat', { text });
      setText('');
      fetchChat();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const extraHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // tuned for iPhone 11
      >
        {/* Header / User Info Card */}
        {user && (
          <Animated.View style={[styles.userCard, { minHeight: extraHeight }]}>
            <TouchableOpacity 
              style={styles.cardContent} 
              onPress={toggleExpand}
              activeOpacity={0.8}
            >
              <View style={styles.topSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.statusIndicator} />
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.roleBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#1877F2" />
                    <Text style={styles.userRole}>{user.role}</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.expandBtn}
                    onPress={toggleExpand}
                  >
                    <Ionicons 
                      name={expanded ? "chevron-up" : "chevron-down"} 
                      size={22} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {expanded && (
                <Animated.View style={styles.expandedContent}>
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubbles" size={22} color="#1877F2" />
                      <Text style={styles.statNumber}>{chat?.messages?.length || 0}</Text>
                      <Text style={styles.statLabel}>Messages</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Ionicons name="time" size={22} color="#4CAF50" />
                      <Text style={styles.statNumber}>Active</Text>
                      <Text style={styles.statLabel}>Status</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Ionicons name="person-circle" size={22} color="#FF9800" />
                      <Text style={styles.statNumber}>User</Text>
                      <Text style={styles.statLabel}>Role</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.logoutButton} 
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.logoutText}>Exit</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Chat Section */}
        <FlatList
          data={chat?.messages || []}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 90 }} // extra padding for iPhone 11 bottom space
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userMsg : styles.policemanMsg,
              ]}
            >
              <Text style={[
                item.sender === 'user' ? styles.userMsgText : styles.policemanMsgText
              ]}>
                {item.text}
              </Text>
            </View>
          )}
        />
        {/* Header / Chat Profile Bar */}



        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Type a message..."
            value={text}
            onChangeText={setText}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f7fb" },
  container: { flex: 1, paddingHorizontal: 12 },

  // User Card
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  
  cardContent: { padding: 16 },
  topSection: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: "relative", marginRight: 12 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "#1877F2", alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3,
  },
  statusIndicator: {
    position: "absolute", bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#4CAF50", borderWidth: 2, borderColor: "#fff",
  },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginBottom: 3 },
  userEmail: { fontSize: 13, color: "#777", marginBottom: 6 },
  roleBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#E3F2FD", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, alignSelf: "flex-start",
  },
  userRole: { fontSize: 12, color: "#1877F2", fontWeight: "600", marginLeft: 4, textTransform: "capitalize" },
  actionButtons: { justifyContent: "center" },
  expandBtn: { padding: 6 },
  expandedContent: { marginTop: 12, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#f0f0f0" },

  // Stats
  statsContainer: {
    flexDirection: "row", justifyContent: "space-around",
    marginBottom: 14, paddingVertical: 12,
    backgroundColor: "#fafbfc", borderRadius: 12,
  },
  statItem: { alignItems: "center", flex: 1 },
  statDivider: { width: 1, backgroundColor: "#e0e0e0" },
  statNumber: { fontSize: 15, fontWeight: "700", color: "#1a1a1a", marginTop: 6 },
  statLabel: { fontSize: 12, color: "#777", marginTop: 2 },
  logoutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#E53935", paddingVertical: 12,
    borderRadius: 12, gap: 6,
    shadowColor: "#E53935", shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  logoutText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  // Chat Bubbles
  messageBubble: {
    padding: 12, marginVertical: 5, marginHorizontal: 10,
    borderRadius: 20, maxWidth: "78%",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3,
  },
  userMsg: { backgroundColor: "#1877F2", alignSelf: "flex-end", borderBottomRightRadius: 6 },
  policemanMsg: { backgroundColor: "#E9ECEF", alignSelf: "flex-start", borderBottomLeftRadius: 6 },
  userMsgText: { color: "#fff", fontSize: 15, lineHeight: 20 },
  policemanMsgText: { color: "#111", fontSize: 15, lineHeight: 20 },

  // Input Bar
  inputBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#fff", position: "absolute",
    bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, borderTopColor: "#eee",
    paddingBottom: Platform.OS === "ios" ? 24 : 14,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: -2 },
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: "#ddd",
    borderRadius: 24, paddingHorizontal: 15, paddingVertical: 8,
    backgroundColor: "#fafafa", marginRight: 10, fontSize: 15,
  },
  sendBtn: { backgroundColor: "#1877F2", padding: 11, borderRadius: 50, alignItems: "center", justifyContent: "center" },
});
