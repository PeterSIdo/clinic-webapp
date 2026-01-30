import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  DRAFT_PREFIX: '@clinic_consent_draft_',
  DRAFT_LIST: '@clinic_consent_drafts',
  SETTINGS: '@clinic_consent_settings',
};

// Draft metadata
export interface DraftMetadata {
  id: string;
  clientName?: string;
  createdAt: string;
  updatedAt: string;
  step: string; // Allow any step value
}

// Settings structure
export interface AppSettings {
  therapistEmail?: string;
  therapistName?: string;
  practiceName?: string;
}

class TemporaryStorage {
  /**
   * Save a draft
   */
  async saveDraft(draftId: string, data: any, metadata?: Partial<DraftMetadata>): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.DRAFT_PREFIX}${draftId}`;
      
      // Save draft data
      await AsyncStorage.setItem(key, JSON.stringify(data));
      
      // Update draft metadata
      const drafts = await this.getDraftList();
      const existingIndex = drafts.findIndex(d => d.id === draftId);
      
      const draftMeta: DraftMetadata = {
        id: draftId,
        clientName: metadata?.clientName || data.clientInfo?.firstName + ' ' + data.clientInfo?.lastName || 'Unknown',
        createdAt: existingIndex >= 0 ? drafts[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        step: metadata?.step || 'client-info',
      };
      
      if (existingIndex >= 0) {
        drafts[existingIndex] = draftMeta;
      } else {
        drafts.push(draftMeta);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_LIST, JSON.stringify(drafts));
      
      if (__DEV__) {
        console.log('💾 Draft saved:', draftId);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  /**
   * Get a draft by ID
   */
  async getDraft(draftId: string): Promise<any | null> {
    try {
      const key = `${STORAGE_KEYS.DRAFT_PREFIX}${draftId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting draft:', error);
      return null;
    }
  }

  /**
   * Get list of all drafts
   */
  async getDraftList(): Promise<DraftMetadata[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_LIST);
      
      if (!data) {
        return [];
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting draft list:', error);
      return [];
    }
  }

  /**
   * Delete a specific draft
   */
  async clearDraft(draftId: string): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.DRAFT_PREFIX}${draftId}`;
      
      // Remove draft data
      await AsyncStorage.removeItem(key);
      
      // Update draft list
      const drafts = await this.getDraftList();
      const filtered = drafts.filter(d => d.id !== draftId);
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_LIST, JSON.stringify(filtered));
      
      if (__DEV__) {
        console.log('🗑️  Draft deleted:', draftId);
      }
    } catch (error) {
      console.error('Error clearing draft:', error);
      throw error;
    }
  }

  /**
   * Delete all drafts
   */
  async clearAllDrafts(): Promise<void> {
    try {
      const drafts = await this.getDraftList();
      
      // Remove all draft data
      for (const draft of drafts) {
        const key = `${STORAGE_KEYS.DRAFT_PREFIX}${draft.id}`;
        await AsyncStorage.removeItem(key);
      }
      
      // Clear draft list
      await AsyncStorage.removeItem(STORAGE_KEYS.DRAFT_LIST);
      
      if (__DEV__) {
        console.log('🗑️  All drafts cleared');
      }
    } catch (error) {
      console.error('Error clearing all drafts:', error);
      throw error;
    }
  }

  /**
   * Clean up old drafts (older than specified days)
   */
  async cleanupOldDrafts(daysOld: number = 7): Promise<number> {
    try {
      const drafts = await this.getDraftList();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      let deletedCount = 0;
      
      for (const draft of drafts) {
        const draftDate = new Date(draft.updatedAt);
        if (draftDate < cutoffDate) {
          await this.clearDraft(draft.id);
          deletedCount++;
        }
      }
      
      if (__DEV__ && deletedCount > 0) {
        console.log(`🗑️  Cleaned up ${deletedCount} old drafts`);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old drafts:', error);
      return 0;
    }
  }

  /**
   * Save app settings
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      
      if (__DEV__) {
        console.log('⚙️  Settings saved');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Get app settings
   */
  async getSettings(): Promise<AppSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  }

  /**
   * Clear all app data (for testing/reset)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      
      if (__DEV__) {
        console.log('🗑️  All storage cleared');
      }
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw error;
    }
  }

  /**
   * Generate a unique draft ID
   */
  generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const temporaryStorage = new TemporaryStorage();

