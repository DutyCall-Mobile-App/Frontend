// import React, { useEffect, useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   FlatList, 
//   StyleSheet, 
//   Alert, 
//   KeyboardAvoidingView, 
//   Platform,
//   SafeAreaView
// } from 'react-native';
// import API from '../utils/api';
// import { Ionicons } from '@expo/vector-icons';

// export default function PoliceChatDetailScreen({ route }) {
//   const { chatId, userName } = route.params;
//   const [chat, setChat] = useState(null);
//   const [text, setText] = useState('');
//   const flatListRef = useRef(null);

//   const fetchChat = async () => {
//     try {
//       const res = await API.get(`/chat/${chatId}`);
//       setChat(res.data.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     fetchChat();
//     const interval = setInterval(fetchChat, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   const sendReply = async () => {
//     if (!text) return Alert.alert('Enter a message');
//     try {
//       await API.post('/chat', { text, chatId });
//       setText('');
//       fetchChat();
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeContainer}>
//       <KeyboardAvoidingView 
//         style={styles.container} 
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//       >
//         {/* Chat Header */}
//         <View style={styles.header}>
//           <Ionicons name="chatbubbles" size={22} color="#1877F2" />
//           <Text style={styles.headerText}>Chat with {userName}</Text>
//         </View>

//         {/* Messages */}
//         <FlatList
//           ref={flatListRef}
//           data={chat?.messages || []}
//           keyExtractor={(item, index) => index.toString()}
//           contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
//           onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//           renderItem={({ item }) => (
//             <View
//               style={[
//                 styles.messageBubble,
//                 item.sender === 'policeman' ? styles.policemanMsg : styles.userMsg,
//               ]}
//             >
//               <Text 
//                 style={[
//                   styles.msgText, 
//                   item.sender === 'policeman' && styles.policemanMsgText
//                 ]}
//               >
//                 {item.text}
//               </Text>
//             </View>
//           )}
//         />

//         {/* Input bar */}
//         <View style={styles.inputBar}>
//           <TextInput
//             placeholder="Type your message..."
//             value={text}
//             onChangeText={setText}
//             style={styles.input}
//             multiline
//           />
//           <TouchableOpacity style={styles.sendBtn} onPress={sendReply}>
//             <Ionicons name="send" size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeContainer: { flex: 1, backgroundColor: "#f0f2f5" },
//   container: { flex: 1 },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 15,
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowOffset: { width: 0, height: 2 },
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   headerText: { fontSize: 17, fontWeight: "600", color: "#1877F2", marginLeft: 8 },

//   messageBubble: {
//     padding: 12,
//     marginVertical: 4,
//     borderRadius: 20,
//     maxWidth: "75%",
//     elevation: 1,
//   },
//   userMsg: { 
//     backgroundColor: "#e4e6eb", 
//     alignSelf: "flex-start",
//     borderBottomLeftRadius: 6 
//   },
//   policemanMsg: { 
//     backgroundColor: "#1877F2", 
//     alignSelf: "flex-end",
//     borderBottomRightRadius: 6 
//   },
//   msgText: { fontSize: 15, color: "#000" },
//   policemanMsgText: { color: "#fff" },

//   inputBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     backgroundColor: "#fff",
//     borderTopWidth: 1,
//     borderTopColor: "#ddd",
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     backgroundColor: "#f9f9f9",
//     marginRight: 10,
//     maxHeight: 100, // prevent overflow when typing long messages
//   },
//   sendBtn: {
//     backgroundColor: "#1877F2",
//     padding: 12,
//     borderRadius: 50,
//   },
// });
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import API from '../utils/api';

export default function PoliceChatDetailScreen() {
  const router = useRouter();
  const { chatId, userName } = useLocalSearchParams();
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const flatListRef = useRef(null);

  const fetchChat = async () => {
    try {
      const res = await API.get(`/chat/${chatId}`);
      setChat(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendReply = async () => {
    if (!text) return Alert.alert('Enter a message');
    try {
      await API.post('/chat', { text, chatId });
      setText('');
      fetchChat();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#1877F2" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
            <Ionicons name="chatbubbles" size={22} color="#1877F2" />
            <Text style={styles.headerText}>Chat with {userName}</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={chat?.messages || []}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === 'policeman' ? styles.policemanMsg : styles.userMsg,
              ]}
            >
              <Text 
                style={[
                  styles.msgText, 
                  item.sender === 'policeman' && styles.policemanMsgText
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Type your message..."
            value={text}
            onChangeText={setText}
            style={styles.input}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendReply}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#f0f2f5" },
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: { fontSize: 17, fontWeight: "600", color: "#1877F2", marginLeft: 8 },

  messageBubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: "75%",
    elevation: 1,
  },
  userMsg: { 
    backgroundColor: "#e4e6eb", 
    alignSelf: "flex-start",
    borderBottomLeftRadius: 6 
  },
  policemanMsg: { 
    backgroundColor: "#1877F2", 
    alignSelf: "flex-end",
    borderBottomRightRadius: 6 
  },
  msgText: { fontSize: 15, color: "#000" },
  policemanMsgText: { color: "#fff" },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
    marginRight: 10,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#1877F2",
    padding: 12,
    borderRadius: 50,
  },
});
