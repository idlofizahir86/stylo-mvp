import { wardrobeService } from '../services/firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('Testing Firebase connection...');
  
  try {
    const connectionTest = await wardrobeService.testConnection();
    if (connectionTest) {
      console.log('✅ Firebase connection successful');
      return true;
    } else {
      console.error('❌ Firebase connection test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection error:', error);
    return false;
  }
};

// Test on app startup
export const initializeApp = async () => {
  const isFirebaseConnected = await testFirebaseConnection();
  
  if (!isFirebaseConnected) {
    console.warn('Firebase not connected. App will run in offline mode.');
    // You can set up a local storage fallback here
  }
  
  return isFirebaseConnected;
};