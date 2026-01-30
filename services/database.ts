import { getCurrentConfig } from '@/config/database';
import { ClientInfo, ConsentData, ConsentTemplate } from '@/types/consent';

// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ClientRecord extends ClientInfo {
  createdAt: string;
  updatedAt: string;
}

interface ConsentRecord {
  id: string;
  clientId: string;
  templateId: string;
  templateVersion: string;
  consentText: string;
  signatureData: string;
  agreedAt: string;
  ipAddress?: string;
  deviceInfo?: any;
  createdAt: string;
  updatedAt: string;
}

interface ConsentWithClient extends ConsentRecord {
  client: ClientRecord;
  template: ConsentTemplate;
}

class DatabaseService {
  private baseUrl: string;

  constructor() {
    const config = getCurrentConfig();
    this.baseUrl = config.api.baseUrl;
    
    // Log configuration on initialization
    if (process.env.EXPO_PUBLIC_DEBUG === 'true' || __DEV__) {
      console.log('🔧 DatabaseService initialized');
      console.log('📡 API Base URL:', this.baseUrl);
      console.log('🌍 Environment:', config.environment);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    try {
      if (process.env.EXPO_PUBLIC_DEBUG === 'true' || __DEV__) {
        console.log(`🌐 API Request: ${options.method || 'GET'} ${fullUrl}`);
      }
      
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(`❌ API Error: ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
        };
      }

      if (process.env.EXPO_PUBLIC_DEBUG === 'true' || __DEV__) {
        console.log(`✅ API Success: ${options.method || 'GET'} ${endpoint}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      console.error(`❌ Network Error: ${errorMsg} (URL: ${fullUrl})`);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  // Consent Template methods
  async getActiveConsentTemplates(): Promise<ApiResponse<ConsentTemplate[]>> {
    return this.makeRequest<ConsentTemplate[]>('/consent-templates?active=true');
  }

  async getConsentTemplate(id: string): Promise<ApiResponse<ConsentTemplate>> {
    return this.makeRequest<ConsentTemplate>(`/consent-templates/${id}`);
  }

  async getConsentTemplateByName(name: string): Promise<ApiResponse<ConsentTemplate>> {
    return this.makeRequest<ConsentTemplate>(`/consent-templates/by-name/${name}`);
  }

  async createConsentTemplate(template: Omit<ConsentTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ConsentTemplate>> {
    return this.makeRequest<ConsentTemplate>('/consent-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateConsentTemplate(id: string, updates: Partial<ConsentTemplate>): Promise<ApiResponse<ConsentTemplate>> {
    return this.makeRequest<ConsentTemplate>(`/consent-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deactivateConsentTemplate(id: string): Promise<ApiResponse<ConsentTemplate>> {
    return this.makeRequest<ConsentTemplate>(`/consent-templates/${id}/deactivate`, {
      method: 'PUT',
    });
  }

  // Client methods
  async createClient(clientInfo: Omit<ClientInfo, 'id'>): Promise<ApiResponse<ClientRecord>> {
    return this.makeRequest<ClientRecord>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientInfo),
    });
  }

  async getClient(id: string): Promise<ApiResponse<ClientRecord>> {
    return this.makeRequest<ClientRecord>(`/clients/${id}`);
  }

  async updateClient(id: string, updates: Partial<ClientInfo>): Promise<ApiResponse<ClientRecord>> {
    return this.makeRequest<ClientRecord>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async searchClients(query: {
    email?: string;
    phone?: string;
    name?: string;
  }): Promise<ApiResponse<ClientRecord[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });

    return this.makeRequest<ClientRecord[]>(`/clients/search?${searchParams}`);
  }

  async getAllClients(limit = 50, offset = 0): Promise<ApiResponse<ClientRecord[]>> {
    return this.makeRequest<ClientRecord[]>(`/clients?limit=${limit}&offset=${offset}`);
  }

  // Consent methods
  async createConsent(consentData: {
    clientId: string;
    templateId: string;
    consentText: string;
    signatureData: string;
    agreedAt: string;
    ipAddress?: string;
    deviceInfo?: any;
  }): Promise<ApiResponse<ConsentRecord>> {
    return this.makeRequest<ConsentRecord>('/consents', {
      method: 'POST',
      body: JSON.stringify(consentData),
    });
  }

  async getConsent(id: string): Promise<ApiResponse<ConsentWithClient>> {
    return this.makeRequest<ConsentWithClient>(`/consents/${id}`);
  }

  async getConsentsByClient(clientId: string): Promise<ApiResponse<ConsentRecord[]>> {
    return this.makeRequest<ConsentRecord[]>(`/clients/${clientId}/consents`);
  }

  async getAllConsents(limit = 50, offset = 0): Promise<ApiResponse<ConsentWithClient[]>> {
    return this.makeRequest<ConsentWithClient[]>(`/consents?limit=${limit}&offset=${offset}`);
  }

  // Combined method to save both client and consent in one transaction
  async saveConsentForm(consentData: ConsentData & { templateId: string }): Promise<ApiResponse<{
    client: ClientRecord;
    consent: ConsentRecord;
  }>> {
    return this.makeRequest('/consent-forms', {
      method: 'POST',
      body: JSON.stringify({
        clientInfo: consentData.clientInfo,
        templateId: consentData.templateId,
        consentText: consentData.consentText,
        signatureData: consentData.signature,
        agreedAt: consentData.agreedAt,
        ipAddress: consentData.ipAddress,
        deviceInfo: consentData.deviceInfo,
        healthCheckData: consentData.healthCheckData,
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest('/health');
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Export types for use in components
export type {
    ApiResponse,
    ClientRecord,
    ConsentRecord,
    ConsentWithClient
};

