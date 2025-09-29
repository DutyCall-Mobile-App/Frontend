import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { getMessages, sendMessage } from '../../services/apiService';
import { subscribeToChat } from '../../services/fcmService';

const ChatRoom = () => {
  const route = useRoute();
  const { chatId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await getMessages(chatId);
      if (response.success) {
        setMessages(response.data);
      }
    };

    fetchMessages();
    const unsubscribe = subscribeToChat(chatId, (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const response = await sendMessage(chatId, newMessage);
      if (response.success) {
        setNewMessage('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.senderName}>{item.senderId.name}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item._id}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  messageContainer: {
    marginVertical: 5,
  },
  senderName: {
    fontWeight: 'bold',
  },
  messageText: {
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default ChatRoom;