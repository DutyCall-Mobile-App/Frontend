// import React, { useEffect, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   TouchableOpacity, 
//   StyleSheet, 
//   RefreshControl 
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API from '../utils/api';
// import Toast from 'react-native-toast-message';
// import { Ionicons } from '@expo/vector-icons';

// export default function PoliceDashboardScreen({ navigation }) {
//   const [message, setMessage] = useState('');
//   const [chats, setChats] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [lastMessageCount, setLastMessageCount] = useState({});

//   const fetchDashboardMessage = async () => {
//     try {
//       const res = await API.get('/police/dashboard');
//       setMessage(res.data.message);
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: 'Session Expired',
//         text2: 'Please login again',
//       });
//       await AsyncStorage.removeItem('token');
//       await AsyncStorage.removeItem('role');
//       navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
//     }
//   };

//   const fetchChats = async () => {
//     try {
//       const res = await API.get('/chat');
//       const updatedChats = res.data.data;

//       updatedChats.forEach(chat => {
//         const prevCount = lastMessageCount[chat._id] || 0;
//         const newMessages = chat.messages.slice(prevCount);

//         newMessages.forEach(msg => {
//           if (msg.sender === 'user') {
//             Toast.show({
//               type: 'info',
//               text1: `New message from ${chat.user.name}`,
//               text2: msg.text,
//             });
//           }
//         });

//         lastMessageCount[chat._id] = chat.messages.length;
//       });

//       setLastMessageCount({ ...lastMessageCount });
//       setChats(updatedChats);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const deleteChat = async (chatId) => {
//     try {
//       await API.delete(`/chat/${chatId}`);
//       Toast.show({
//         type: 'success',
//         text1: 'Chat deleted successfully',
//       });
//       fetchChats();
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: 'Failed to delete chat',
//         text2: err.response?.data?.message,
//       });
//     }
//   };

//   useEffect(() => {
//     fetchDashboardMessage();
//     fetchChats();
//     const interval = setInterval(fetchChats, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleLogout = async () => {
//     await AsyncStorage.removeItem('token');
//     await AsyncStorage.removeItem('role');
//     navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchChats();
//     setRefreshing(false);
//   };

//   // Generate consistent color per username
//   const getAvatarColor = (name) => {
//     const colors = ["#f44336", "#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#009688", "#4CAF50", "#FF9800", "#795548"];
//     let hash = 0;
//     for (let i = 0; i < name.length; i++) {
//       hash = name.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     return colors[Math.abs(hash) % colors.length];
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={26} color="#1877F2" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Police Dashboard</Text>
//         <TouchableOpacity onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={26} color="#E53935" />
//         </TouchableOpacity>
//       </View>

//       {/* Welcome Message */}
//       <Text style={styles.message}>{message}</Text>

//       {/* Chat List */}
//       <Text style={styles.sectionTitle}>User Chats</Text>
//       <FlatList
//         data={chats}
//         keyExtractor={(item) => item._id}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         renderItem={({ item }) => {
//           const firstLetter = item.user.name ? item.user.name.charAt(0).toUpperCase() : "?";
//           const bgColor = getAvatarColor(item.user.name || "user");
//           return (
//             <TouchableOpacity
//               style={styles.chatCard}
//               onPress={() => navigation.navigate('PoliceChatDetail', { chatId: item._id, userName: item.user.name })}
//             >
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <View style={[styles.avatar, { backgroundColor: bgColor }]}>
//                   <Text style={styles.avatarText}>{firstLetter}</Text>
//                 </View>
//                 <View>
//                   <Text style={styles.chatUser}>{item.user.name}</Text>
//                   <Text style={styles.chatInfo}>💬 {item.messages.length} messages</Text>
//                 </View>
//               </View>
//               <TouchableOpacity onPress={() => deleteChat(item._id)}>
//                 <Ionicons name="trash" size={24} color="red" />
//               </TouchableOpacity>
//             </TouchableOpacity>
//           );
//         }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f0f2f5",
//     padding: 10,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1877F2",
//   },
//   message: {
//     fontSize: 15,
//     marginVertical: 12,
//     color: "#333",
//     textAlign: "center",
//   },
//   sectionTitle: {
//     fontWeight: "bold",
//     fontSize: 16,
//     marginVertical: 8,
//     color: "#1877F2",
//   },
//   chatCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 15,
//     marginBottom: 10,
//     borderRadius: 12,
//     backgroundColor: "#fff",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   avatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 25,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },
//   avatarText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   chatUser: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   chatInfo: {
//     fontSize: 13,
//     color: "#666",
//   },
// });
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import API from '../utils/api';

export default function PoliceDashboardScreen() {
  const router = useRouter();

  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState({});

  const fetchDashboardMessage = async () => {
    try {
      const res = await API.get('/police/dashboard');
      setMessage(res.data.message);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Session Expired',
        text2: 'Please login again',
      });
      await AsyncStorage.multiRemove(['token', 'role']);
      router.replace('/login');
    }
  };

  const fetchChats = async () => {
    try {
      const res = await API.get('/chat');
      const updatedChats = res.data.data;

      updatedChats.forEach(chat => {
        const prevCount = lastMessageCount[chat._id] || 0;
        const newMessages = chat.messages.slice(prevCount);

        newMessages.forEach(msg => {
          if (msg.sender === 'user') {
            Toast.show({
              type: 'info',
              text1: `New message from ${chat.user.name}`,
              text2: msg.text,
            });
          }
        });

        lastMessageCount[chat._id] = chat.messages.length;
      });

      setLastMessageCount({ ...lastMessageCount });
      setChats(updatedChats);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await API.delete(`/chat/${chatId}`);
      Toast.show({
        type: 'success',
        text1: 'Chat deleted successfully',
      });
      fetchChats();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete chat',
        text2: err.response?.data?.message,
      });
    }
  };

  useEffect(() => {
    fetchDashboardMessage();
    fetchChats();
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'role']);
    router.replace('/login');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  // Generate consistent color per username
  const getAvatarColor = (name) => {
    const colors = ["#f44336", "#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#009688", "#4CAF50", "#FF9800", "#795548"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#1877F2" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Police Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color="#E53935" />
        </TouchableOpacity>
      </View>

      {/* Welcome Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Chat List */}
      <Text style={styles.sectionTitle}>User Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const firstLetter = item.user.name ? item.user.name.charAt(0).toUpperCase() : "?";
          const bgColor = getAvatarColor(item.user.name || "user");
          return (
            <TouchableOpacity
              style={styles.chatCard}
              onPress={() =>
                router.push({
                  pathname: '/police-chat-detail',
                  params: { chatId: item._id, userName: item.user.name },
                })
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.avatar, { backgroundColor: bgColor }]}>
                  <Text style={styles.avatarText}>{firstLetter}</Text>
                </View>
                <View>
                  <Text style={styles.chatUser}>{item.user.name}</Text>
                  <Text style={styles.chatInfo}>💬 {item.messages.length} messages</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteChat(item._id)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1877F2",
  },
  message: {
    fontSize: 15,
    marginVertical: 12,
    color: "#333",
    textAlign: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 8,
    color: "#1877F2",
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatUser: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  chatInfo: {
    fontSize: 13,
    color: "#666",
  },
});
