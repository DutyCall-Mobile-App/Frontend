import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginPoliceman, loginUser } from '../../services/apiService';

const Login = () => {
  const [mode, setMode] = useState('citizen'); // 'citizen' or 'policeman'
  const [username, setUsername] = useState('');
  const [policeId, setPoliceId] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      let response;
      if (mode === 'citizen') {
        response = await loginUser(username, password);
      } else {
        response = await loginPoliceman(policeId, password);
      }
      if (response.success) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Login Failed', response.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while logging in. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[styles.switchButton, mode === 'citizen' && styles.activeSwitch]}
          onPress={() => setMode('citizen')}
        >
          <Text style={styles.switchText}>Citizen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, mode === 'policeman' && styles.activeSwitch]}
          onPress={() => setMode('policeman')}
        >
          <Text style={styles.switchText}>Policeman</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Login as {mode === 'citizen' ? 'Citizen' : 'Policeman'}</Text>
      {mode === 'citizen' ? (
        <TextInput
          style={styles.input}
          placeholder="Citizen Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Police ID"
          value={policeId}
          onChangeText={setPoliceId}
          autoCapitalize="none"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      {mode === 'citizen' && (
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Don't have an account? Register
        </Text>
      )}
      <Text style={styles.link} onPress={() => navigation.navigate('ResetPassword')}>
        Forgot Password?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  switchButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  activeSwitch: {
    backgroundColor: '#007AFF',
  },
  switchText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  link: {
    color: 'blue',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default Login;