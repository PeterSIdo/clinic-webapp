import { ConsentData } from '@/types/consent';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONSENT_STORAGE_KEY = '@clinic_consents';
const SETTINGS_STORAGE_KEY = '@clinic_settings';

export interface AppSettings {
  selectedForms: string[]; // Array of template names
  theme: 'light' | 'dark' | 'auto';
  therapistEmail?: string;
}

export const storageService = {
  /**
   * Save a consent form to local storage
   */
  async saveConsent(consent: ConsentData): Promise<void> {
    try {
      const existingConsents = await this.getAllConsents();
      const updatedConsents = [...existingConsents, consent];
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updatedConsents));
    } catch (error) {
      console.error('Error saving consent:', error);
      throw new Error('Failed to save consent form');
    }
  },

  /**
   * Get all saved consent forms
   */
  async getAllConsents(): Promise<ConsentData[]> {
    try {
      const consentsJson = await AsyncStorage.getItem(CONSENT_STORAGE_KEY);
      return consentsJson ? JSON.parse(consentsJson) : [];
    } catch (error) {
      console.error('Error retrieving consents:', error);
      return [];
    }
  },

  /**
   * Get a specific consent by ID
   */
  async getConsentById(id: string): Promise<ConsentData | null> {
    try {
      const consents = await this.getAllConsents();
      return consents.find(consent => consent.id === id) || null;
    } catch (error) {
      console.error('Error retrieving consent:', error);
      return null;
    }
  },

  /**
   * Delete a consent by ID
   */
  async deleteConsent(id: string): Promise<void> {
    try {
      const consents = await this.getAllConsents();
      const filteredConsents = consents.filter(consent => consent.id !== id);
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(filteredConsents));
    } catch (error) {
      console.error('Error deleting consent:', error);
      throw new Error('Failed to delete consent form');
    }
  },

  /**
   * Clear all consents (use with caution)
   */
  async clearAllConsents(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing consents:', error);
      throw new Error('Failed to clear consent forms');
    }
  },

  /**
   * Search consents by client name
   */
  async searchConsents(query: string): Promise<ConsentData[]> {
    try {
      const consents = await this.getAllConsents();
      const lowerQuery = query.toLowerCase();
      return consents.filter(consent => 
        consent.clientInfo.firstName.toLowerCase().includes(lowerQuery) ||
        consent.clientInfo.lastName.toLowerCase().includes(lowerQuery) ||
        consent.clientInfo.email.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching consents:', error);
      return [];
    }
  },

  /**
   * Get app settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      // Return default settings - light mode by default
      return {
        selectedForms: [], // Empty means all forms are available
        theme: 'light',
      };
    } catch (error) {
      console.error('Error retrieving settings:', error);
      return {
        selectedForms: [],
        theme: 'light',
      };
    }
  },

  /**
   * Save app settings
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  },

  /**
   * Update selected forms
   */
  async updateSelectedForms(formNames: string[]): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings.selectedForms = formNames;
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error updating selected forms:', error);
      throw new Error('Failed to update selected forms');
    }
  },

  /**
   * Update theme preference
   */
  async updateTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings.theme = theme;
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error updating theme:', error);
      throw new Error('Failed to update theme');
    }
  },
};
