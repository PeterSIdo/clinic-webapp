import { getCurrentConfig } from '@/config/api';
import { ClientInfo, HealthCheckData } from '@/types/consent';

// API response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

// Email consent data structure
export interface EmailConsentData {
  therapistEmail: string;
  clientEmail?: string;
  clientName: string;
  clientInfo?: ClientInfo;
  consentText: string;
  signature: string;
  agreedAt: string;
  templateName: string;
  healthCheckData?: HealthCheckData;
}

class EmailService {
  private baseUrl: string;

  constructor() {
    const config = getCurrentConfig();
    this.baseUrl = config.api.baseUrl;
    
    // Log configuration on initialization
    if (process.env.EXPO_PUBLIC_DEBUG === 'true' || __DEV__) {
      console.log('📧 EmailService initialized');
      console.log('📡 API Base URL:', this.baseUrl);
    }
  }

  /**
   * Send consent form via email
   */
  async sendConsentForm(data: EmailConsentData): Promise<ApiResponse> {
    const endpoint = '/send-consent-email';
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log('📧 ==== EMAIL SEND ATTEMPT ====');
      console.log('📡 Full URL:', fullUrl);
      console.log('📧 To:', data.therapistEmail);
      console.log('👤 Client:', data.clientName);
      console.log('🔑 Template:', data.templateName);
      
      // Create abort controller for timeout
      // Increased timeout for Railway deployment (PDF generation can take time)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 300 second timeout (5 minutes)
      
      try {
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            therapistEmail: data.therapistEmail,
            clientEmail: data.clientEmail || '',
            clientName: data.clientName,
            clientInfo: data.clientInfo,
            consentText: data.consentText,
            signature: data.signature,
            agreedAt: data.agreedAt,
            templateName: data.templateName,
            healthCheckData: data.healthCheckData,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Response status:', response.status, response.statusText);
        
        const result = await response.json();
        console.log('📡 Response data:', JSON.stringify(result, null, 2));

        if (!response.ok) {
          const errorMsg = result.error || `HTTP ${response.status}: ${response.statusText}`;
          console.error('❌ Email send failed:', errorMsg);
          return {
            success: false,
            error: errorMsg,
          };
        }

        console.log('✅ Email sent successfully');

        return {
          success: true,
          message: result.message || 'Email sent successfully',
          details: result.details,
        };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      let errorMsg = 'Unknown error';
      let userFriendlyMsg = 'Failed to send email';
      
      if (error instanceof Error) {
        errorMsg = error.message;
        
        // Provide user-friendly error messages
        if (error.name === 'AbortError') {
          userFriendlyMsg = 'Request timeout - please check your internet connection';
        } else if (errorMsg.includes('Network request failed')) {
          userFriendlyMsg = 'Cannot reach server - check if API server is running and accessible';
        } else if (errorMsg.includes('Failed to fetch')) {
          userFriendlyMsg = 'Network error - check your internet connection';
        } else if (errorMsg.includes('ECONNREFUSED')) {
          userFriendlyMsg = 'Server is not running - please start the API server';
        } else {
          userFriendlyMsg = `Network error: ${errorMsg}`;
        }
      }
      
      console.error('❌ Network Error:', errorMsg);
      console.error('❌ Full error:', error);
      
      return {
        success: false,
        error: userFriendlyMsg,
      };
    }
  }

  /**
   * Check email service status
   */
  async checkEmailStatus(): Promise<ApiResponse> {
    const endpoint = '/email/status';
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Email service check failed',
        };
      }

      return {
        success: result.success,
        message: result.message,
        data: result,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        error: `Failed to check email status: ${errorMsg}`,
      };
    }
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<ApiResponse> {
    const endpoint = '/health';
    const fullUrl = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log('🏥 Health check URL:', fullUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const result = await response.json();
      console.log('🏥 Health check result:', result);

      if (!response.ok) {
        return {
          success: false,
          error: 'API health check failed',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      console.error('🏥 Health check failed:', errorMsg);
      return {
        success: false,
        error: `API unreachable: ${errorMsg}`,
      };
    }
  }
  
  /**
   * Test network connectivity before sending email
   */
  async testConnection(): Promise<ApiResponse> {
    console.log('🌐 Testing network connection...');
    console.log('🌐 Base URL:', this.baseUrl);
    
    // First try health check
    const healthResult = await this.healthCheck();
    
    if (healthResult.success) {
      console.log('✅ Network connection OK');
      return healthResult;
    }
    
    console.error('❌ Network connection failed');
    return {
      success: false,
      error: 'Cannot connect to server. Please check: 1) API server is running, 2) Device is on same network, 3) IP address is correct',
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type { ApiResponse };

