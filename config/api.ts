import { Platform } from 'react-native';

// API configuration for different environments
export const API_CONFIG = {
  local: {
    baseUrl: Platform.OS === 'web' 
      ? 'http://localhost:3001/api' 
      : 'http://10.0.2.2:3001/api', // Android emulator localhost
  },
  
  // Network configuration for tablet connecting to laptop
  network: {
    baseUrl: 'http://192.168.1.11:3001/api',
  },
  
  production: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://clinic-consent-app-production.up.railway.app/api',
  },
};

// Get current environment
export const getEnvironment = (): 'local' | 'network' | 'production' => {
  // Check for explicit environment variable
  const envMode = process.env.EXPO_PUBLIC_ENV_MODE;
  if (envMode === 'network' || envMode === 'production') {
    return envMode;
  }
  
  // Check if we're explicitly set to use network mode via API URL
  if (process.env.EXPO_PUBLIC_API_URL?.includes('192.168.1.11')) {
    return 'network';
  }
  
  // Check if API URL is set to any non-localhost address
  if (process.env.EXPO_PUBLIC_API_URL && 
      !process.env.EXPO_PUBLIC_API_URL.includes('localhost') &&
      !process.env.EXPO_PUBLIC_API_URL.includes('10.0.2.2')) {
    return 'network';
  }
  
  return __DEV__ ? 'local' : 'production';
};

// Get current configuration
export const getCurrentConfig = () => {
  const env = getEnvironment();
  
  // Allow override via EXPO_PUBLIC_API_URL
  let apiBaseUrl = API_CONFIG[env].baseUrl;
  if (process.env.EXPO_PUBLIC_API_URL) {
    apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
  }
  
  return {
    api: {
      baseUrl: apiBaseUrl,
    },
    environment: env,
  };
};

// App configuration
export const APP_CONFIG = {
  // Default therapist email (can be overridden in settings)
  defaultTherapistEmail: process.env.EXPO_PUBLIC_THERAPIST_EMAIL || '',
  
  // Draft auto-save interval (milliseconds)
  draftAutoSaveInterval: 30000, // 30 seconds
  
  // Draft expiry time (milliseconds)
  draftExpiryTime: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Helper function to log current configuration (useful for debugging)
export const logCurrentConfig = () => {
  const config = getCurrentConfig();
  console.log('=== API Configuration ===');
  console.log('Environment:', config.environment);
  console.log('API Base URL:', config.api.baseUrl);
  console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('EXPO_PUBLIC_ENV_MODE:', process.env.EXPO_PUBLIC_ENV_MODE);
  console.log('Default Therapist Email:', APP_CONFIG.defaultTherapistEmail || 'Not set');
  console.log('========================');
  return config;
};
