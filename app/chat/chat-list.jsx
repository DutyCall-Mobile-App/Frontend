import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getUserChats } from '../../services/apiService';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getUserChats();
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, []);

  const handleChatPress = (chatId) => {
    navigation.navigate('ChatRoom', { chatId });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item._id)}>
      <Text style={styles.chatTitle}>{item.issueId.title}</Text>
      <Text style={styles.chatLastMessage}>{item.lastMessage?.text || 'No messages yet'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  list: {
    paddingBottom: 16,
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#666',
  },
});

export default ChatList;