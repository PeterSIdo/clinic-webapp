import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { emailService } from '@/services/emailService';
import { temporaryStorage } from '@/services/temporaryStorage';
import { APP_CONFIG } from '@/config/api';

interface EmailDialogProps {
  visible: boolean;
  onClose: () => void;
  onSend: (therapistEmail: string, clientEmail: string) => Promise<void>;
  clientEmail?: string;
  clientName: string;
}

export default function EmailDialog({
  visible,
  onClose,
  onSend,
  clientEmail = '',
  clientName,
}: EmailDialogProps) {
  const [therapistEmail, setTherapistEmail] = useState('');
  const [clientEmailInput, setClientEmailInput] = useState(clientEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ therapist?: string; client?: string }>({});
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'ok' | 'failed' | null>(null);

  // Test connection when dialog opens
  useEffect(() => {
    if (visible) {
      testConnection();
      loadSavedTherapistEmail();
    }
  }, [visible]);

  const loadSavedTherapistEmail = async () => {
    try {
      const settings = await temporaryStorage.getSettings();
      if (settings?.therapistEmail && !therapistEmail) {
        console.log('📧 Loading saved therapist email:', settings.therapistEmail);
        setTherapistEmail(settings.therapistEmail);
      } else if (APP_CONFIG.defaultTherapistEmail && !therapistEmail) {
        console.log('📧 Using default therapist email:', APP_CONFIG.defaultTherapistEmail);
        setTherapistEmail(APP_CONFIG.defaultTherapistEmail);
      }
    } catch (error) {
      console.error('Error loading saved email:', error);
    }
  };

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const result = await emailService.testConnection();
      if (result.success) {
        setConnectionStatus('ok');
      } else {
        setConnectionStatus('failed');
        Alert.alert(
          'Connection Issue',
          result.error || 'Cannot connect to server. Please check your network connection.',
          [{ text: 'Retry', onPress: testConnection }, { text: 'Cancel', style: 'cancel' }]
        );
      }
    } catch (error) {
      setConnectionStatus('failed');
      console.error('Connection test error:', error);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    console.log('📧 ==== EMAIL DIALOG: Send button pressed ====');
    
    // Reset errors
    setErrors({});

    // Check connection first
    console.log('📧 Connection status:', connectionStatus);
    if (connectionStatus !== 'ok') {
      console.warn('⚠️ Connection not OK, cannot send');
      Alert.alert(
        'No Connection',
        'Cannot connect to server. Please check your connection and try again.',
        [{ text: 'Retry Connection', onPress: testConnection }, { text: 'Cancel', style: 'cancel' }]
      );
      return;
    }

    // Validate therapist email (required)
    console.log('📧 Validating emails...');
    console.log('  - Therapist email:', therapistEmail);
    console.log('  - Client email:', clientEmailInput);
    
    if (!therapistEmail.trim()) {
      console.error('❌ Therapist email is empty');
      setErrors({ therapist: 'Therapist email is required' });
      return;
    }

    if (!validateEmail(therapistEmail)) {
      console.error('❌ Therapist email invalid format');
      setErrors({ therapist: 'Please enter a valid email address' });
      return;
    }

    // Validate client email (optional, but must be valid if provided)
    if (clientEmailInput.trim() && !validateEmail(clientEmailInput)) {
      console.error('❌ Client email invalid format');
      setErrors({ client: 'Please enter a valid email address' });
      return;
    }

    console.log('✅ Validation passed, calling onSend...');
    setIsLoading(true);
    try {
      console.log('📧 EmailDialog: Starting email send...');
      await onSend(therapistEmail, clientEmailInput.trim());
      console.log('📧 EmailDialog: Email sent successfully');
      // Reset form
      setTherapistEmail('');
      setClientEmailInput('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('📧 EmailDialog: Email send error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Email Failed', 
        `Failed to send email: ${errorMessage}\n\nPlease check:\n- API server is running\n- Device is on same network\n- Internet connection is stable`,
        [{ text: 'Retry', onPress: handleSend }, { text: 'Cancel', style: 'cancel' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTherapistEmail('');
      setClientEmailInput('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                📧 Send Consent Form by Email
              </ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Sending form for: {clientName}
              </ThemedText>
              
              {/* Connection Status Indicator */}
              {connectionStatus && (
                <View style={[
                  styles.connectionStatus,
                  connectionStatus === 'checking' && styles.connectionChecking,
                  connectionStatus === 'ok' && styles.connectionOk,
                  connectionStatus === 'failed' && styles.connectionFailed,
                ]}>
                  {connectionStatus === 'checking' && (
                    <>
                      <ActivityIndicator size="small" color="#666" />
                      <Text style={styles.connectionText}>Checking connection...</Text>
                    </>
                  )}
                  {connectionStatus === 'ok' && (
                    <>
                      <Text style={styles.connectionIcon}>✅</Text>
                      <Text style={styles.connectionText}>Connected to server</Text>
                    </>
                  )}
                  {connectionStatus === 'failed' && (
                    <>
                      <Text style={styles.connectionIcon}>⚠️</Text>
                      <Text style={styles.connectionText}>Connection failed</Text>
                      <TouchableOpacity onPress={testConnection} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>

            <View style={styles.modalBody}>
              {/* Therapist Email (Required) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Therapist Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.therapist && styles.inputError]}
                  placeholder="therapist@example.com"
                  placeholderTextColor="#999"
                  value={therapistEmail}
                  onChangeText={(text) => {
                    setTherapistEmail(text);
                    if (errors.therapist) {
                      setErrors({ ...errors, therapist: undefined });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {errors.therapist && (
                  <Text style={styles.errorText}>{errors.therapist}</Text>
                )}
                <Text style={styles.helperText}>
                  The therapist will receive a copy of the consent form
                </Text>
              </View>

              {/* Client Email (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Client Email (Optional)</Text>
                <TextInput
                  style={[styles.input, errors.client && styles.inputError]}
                  placeholder="client@example.com"
                  placeholderTextColor="#999"
                  value={clientEmailInput}
                  onChangeText={(text) => {
                    setClientEmailInput(text);
                    if (errors.client) {
                      setErrors({ ...errors, client: undefined });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {errors.client && (
                  <Text style={styles.errorText}>{errors.client}</Text>
                )}
                <Text style={styles.helperText}>
                  If provided, the client will also receive a copy
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  The email will include the consent text and the client&apos;s digital
                  signature.
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.sendButton, isLoading && styles.buttonDisabled]}
                onPress={handleSend}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: '#2196F3',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 12,
    borderRadius: 6,
    gap: 8,
  },
  connectionChecking: {
    backgroundColor: '#f5f5f5',
  },
  connectionOk: {
    backgroundColor: '#e8f5e9',
  },
  connectionFailed: {
    backgroundColor: '#ffebee',
  },
  connectionIcon: {
    fontSize: 16,
  },
  connectionText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
