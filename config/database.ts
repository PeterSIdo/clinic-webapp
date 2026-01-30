import { Platform } from 'react-native';

// Database configuration for different environments
export const DATABASE_CONFIG = {
  // Local development configuration
  local: {
    host: 'localhost',
    port: 5432,
    database: 'clinic_consent_db',
    user: 'postgres',
    password: 'gazda',
    ssl: false,
  },
  
  // Network configuration for tablet connecting to laptop
  network: {
    host: 'localhost',
    port: 5432,
    database: 'clinic_consent_db',
    user: 'postgres',
    password: 'gazda',
    ssl: false,
  },
  
  // Cloud/Production configuration (values will be loaded from environment variables)
  production: {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    connectionString: process.env.DATABASE_URL, // For cloud providers like Heroku, Railway, etc.
  },
};

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
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://your-app-api.com/api',
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
    database: DATABASE_CONFIG[env],
    api: {
      baseUrl: apiBaseUrl,
    },
    environment: env,
  };
};

// Helper function to log current configuration (useful for debugging)
export const logCurrentConfig = () => {
  const config = getCurrentConfig();
  console.log('=== API Configuration ===');
  console.log('Environment:', config.environment);
  console.log('API Base URL:', config.api.baseUrl);
  console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('EXPO_PUBLIC_ENV_MODE:', process.env.EXPO_PUBLIC_ENV_MODE);
  console.log('========================');
  return config;
};
