import { Alert } from 'react-native';

export const toast = {
  success: (message: string) => {
    // For now use Alert, but can be replaced with a proper toast library
    Alert.alert("Success", message, [{ text: "OK" }]);
  },
  
  error: (message: string) => {
    Alert.alert("Error", message, [{ text: "OK" }]);
  },
  
  // Silent success for optimistic updates
  silentSuccess: () => {
    // Do nothing - optimistic update already shows success
  }
};