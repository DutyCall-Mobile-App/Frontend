import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { verifyOtp } from '../../services/apiService'; // Assuming you have a function to verify OTP

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const navigation = useNavigation();

  const handleVerifyOtp = async () => {
    try {
      const response = await verifyOtp(otp);
      if (response.success) {
        Alert.alert('Success', 'OTP verified successfully!');
        navigation.navigate('Login'); // Navigate to login or home screen
      } else {
        Alert.alert('Error', response.error);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while verifying OTP.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Verify OTP</Text>
      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
        }}
      />
      <Button title="Verify OTP" onPress={handleVerifyOtp} />
    </View>
  );
};

export default VerifyOtp;