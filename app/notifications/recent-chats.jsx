import { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
// import { getRecentChats } from '../../services/apiService'; // Uncomment if implemented

const sampleChats = [
  {
    _id: '1',
    officer: 'Officer John',
    citizen: 'Alice',
    lastMessage: 'Your report has been reviewed.',
    updatedAt: new Date().toISOString(),
    urgent: false,
  },
  {
    _id: '2',
    officer: 'Officer Smith',
    citizen: 'Bob',
    lastMessage: 'URGENT: Please provide more details.',
    updatedAt: new Date().toISOString(),
    urgent: true,
  },
  {
    _id: '3',
    officer: 'Officer Lee',
    citizen: 'Charlie',
    lastMessage: 'Location confirmed for your report.',
    updatedAt: new Date().toISOString(),
    urgent: false,
  },
  {
    _id: '4',
    officer: 'Officer John',
    citizen: 'Diana',
    lastMessage: 'URGENT: Immediate assistance required.',
    updatedAt: new Date().toISOString(),
    urgent: true,
  },
];

const RecentChats = () => {
  const [chats, setChats] = useState(sampleChats);
  const [showUrgent, setShowUrgent] = useState(false);

  // Uncomment and use this if you have backend
  // useEffect(() => {
  //   const fetchChats = async () => {
  //     try {
  //       const response = await getRecentChats();
  //       setChats(response.data);
  //     } catch (error) {
  //       console.error('Error fetching recent chats:', error);
  //     }
  //   };
  //   fetchChats();
  // }, []);

  const filteredChats = showUrgent
    ? chats.filter((chat) => chat.urgent)
    : chats;

  const renderChat = ({ item }) => (
    <View style={styles.chatItem}>
      <Text style={styles.chatTitle}>
        {item.officer} ↔ {item.citizen}
      </Text>
      <Text style={[styles.chatLastMessage, item.urgent && styles.urgent]}>
        {item.lastMessage}
      </Text>
      <Text style={styles.chatDate}>{new Date(item.updatedAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View>
      <Button
        title={showUrgent ? "Show All Chats" : "Show Urgent Chats"}
        onPress={() => setShowUrgent((prev) => !prev)}
        color="#d9534f"
      />
      <FlatList
        data={filteredChats}
        renderItem={renderChat}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 16,
  },
  chatItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#555',
  },
  urgent: {
    color: '#d9534f',
    fontWeight: 'bold',
  },
  chatDate: {
    fontSize: 12,
    color: '#888',
  },
});

export default RecentChats;