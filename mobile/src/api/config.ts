import { Platform } from 'react-native';

const androidExpoHost = '10.0.2.2';
const iosSimulatorHost = 'localhost';

// For Expo on Android emulator, 10.0.2.2 points to your Mac localhost.
// If you run on a physical device later, replace this with your machine LAN IP.
const defaultHost = Platform.OS === 'android' ? androidExpoHost : iosSimulatorHost;

export const API_BASE_URL = `http://${defaultHost}:8000/api/v1`;
export const REQUEST_TIMEOUT_MS = 10000;