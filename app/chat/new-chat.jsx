import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createChat, getUsers } from '../../services/apiService';

const NewChat = () => {
  const [participants, setParticipants] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getUsers();
      setAllUsers(users);
    };
    fetchUsers();
  }, []);

  const handleSelectUser = (user) => {
    if (selectedUsers.includes(user._id)) {
      setSelectedUsers(selectedUsers.filter(id => id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user._id]);
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length > 0) {
      await createChat({ participants: selectedUsers });
      navigation.navigate('ChatList'); // Navigate to chat list after creating chat
    } else {
      alert('Please select at least one participant');
    }
  };

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Chat</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={user => user._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.userItem, selectedUsers.includes(item._id) && styles.selectedUser]}
            onPress={() => handleSelectUser(item)}
          >
            <Text style={styles.userName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Create Chat" onPress={handleCreateChat} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedUser: {
    backgroundColor: '#e0f7fa',
  },
  userName: {
    fontSize: 18,
  },
});

export default NewChat;