import { ClientInfoForm } from '@/components/ClientInfoForm';
import { ConsentText } from '@/components/ConsentText';
import EmailDialog from '@/components/EmailDialog';
import { MassageHealthCheckForm } from '@/components/MassageHealthCheckForm';
import { AcupunctureHealthCheckForm } from '@/components/AcupunctureHealthCheckForm';
import { SignaturePadWorking } from '@/components/SignaturePadWorking';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { APP_CONFIG, getCurrentConfig } from '@/config/api';
import { consentTemplateService } from '@/services/consentTemplate';
import { emailService } from '@/services/emailService';
import { temporaryStorage } from '@/services/temporaryStorage';
import { ClientInfo, ConsentTemplate, HealthCheckData } from '@/types/consent';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';

type Step = 'template-select' | 'info' | 'health-check' | 'consent' | 'signature' | 'email' | 'complete';

export default function ConsentScreen() {
  const params = useLocalSearchParams();
  const lastDraftIdRef = useRef<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('template-select');
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [consentTemplate, setConsentTemplate] = useState<ConsentTemplate | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<ConsentTemplate[]>([]);
  const [signature, setSignature] = useState<string>('');
  const [hasReadConsent, setHasReadConsent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [healthCheckData, setHealthCheckData] = useState<HealthCheckData | null>(null);
  const [draftId, setDraftId] = useState<string>('');
  const [emailDialogVisible, setEmailDialogVisible] = useState(false);
  const [therapistEmail, setTherapistEmail] = useState<string>('');
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const resumeDraftDataRef = useRef<{clientInfo: ClientInfo | null, consentTemplate: ConsentTemplate | null, signature: string, healthCheckData: HealthCheckData | null} | null>(null);

  // Load templates and settings on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        await loadConsentTemplates();
        await loadSettings();
      };
      
      initialize();
    }, [])
  );

  // Handle draft loading when screen comes into focus with params
  useFocusEffect(
    useCallback(() => {
      const loadDraftFromParams = async () => {
        const currentDraftParam = params.draftId as string | undefined;
        const resumeToEmail = params.resumeToEmail as string | undefined;
        
        console.log('🔄 useFocusEffect triggered:', { 
          currentDraftParam, 
          resumeToEmail,
          lastDraftId: lastDraftIdRef.current 
        });
        
        // If params exist but we shouldn't be loading them (already processed or stale)
        if (currentDraftParam && lastDraftIdRef.current === currentDraftParam) {
          // We've already loaded this draft, params are stale
          console.log('🔄 Params are stale, clearing URL');
          router.replace('/(tabs)/consent');
          return;
        }
        
        // Check if we're resuming a specific draft
        if (currentDraftParam && resumeToEmail === 'true') {
          console.log('🔄 Loading draft from Resume button:', currentDraftParam);
          lastDraftIdRef.current = currentDraftParam;
          await loadDraftAndResume(currentDraftParam, true);
          // Clear params IMMEDIATELY after loading to prevent navigation issues
          console.log('🔄 Clearing URL params immediately');
          router.replace('/(tabs)/consent');
        } else if (currentDraftParam) {
          // URL has params but shouldn't - clear them
          console.log('🔄 Clearing unexpected URL params');
          router.replace('/(tabs)/consent');
        } else if (!currentDraftParam) {
          // No draft params - user clicked "New Consent" tab or navigated fresh
          console.log('🔄 No draft params - fresh navigation');
          
          // If we previously had a draft loaded, reset the form
          if (lastDraftIdRef.current) {
            console.log('🔄 Resetting form (clearing previous draft)');
            lastDraftIdRef.current = null;
            resetForm();
          }
        }
      };
      
      loadDraftFromParams();
    }, [params.draftId, params.resumeToEmail])
  );

  // Auto-save draft whenever data changes
  useEffect(() => {
    if (clientInfo || healthCheckData || signature) {
      saveDraft();
    }
  }, [clientInfo, healthCheckData, signature, consentTemplate, currentStep]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 STATE UPDATE:');
    console.log('  - currentStep:', currentStep);
    console.log('  - clientInfo:', clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName}` : 'null');
    console.log('  - consentTemplate:', consentTemplate?.title || 'null');
    console.log('  - signature:', signature ? `${signature.length} chars` : 'null');
    console.log('  - draftId:', draftId || 'none');
    console.log('  - emailDialogVisible:', emailDialogVisible);
  }, [currentStep, clientInfo, consentTemplate, signature, draftId, emailDialogVisible]);

  const loadSettings = async () => {
    try {
      const settings = await temporaryStorage.getSettings();
      if (settings?.therapistEmail) {
        setTherapistEmail(settings.therapistEmail);
      } else if (APP_CONFIG.defaultTherapistEmail) {
        setTherapistEmail(APP_CONFIG.defaultTherapistEmail);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkForDrafts = async () => {
    try {
      const drafts = await temporaryStorage.getDraftList();
      if (drafts.length > 0) {
        Alert.alert(
          'Resume Draft?',
          `You have ${drafts.length} saved draft(s). Would you like to resume the most recent one?`,
          [
            { text: 'Start Fresh', style: 'cancel' },
            { text: 'Resume', onPress: () => loadLatestDraft(drafts[0].id) },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking drafts:', error);
    }
  };

  const loadLatestDraft = async (id: string) => {
    try {
      const draft = await temporaryStorage.getDraft(id);
      if (draft) {
        setDraftId(id);
        setClientInfo(draft.clientInfo || null);
        setConsentTemplate(draft.consentTemplate || null);
        setHealthCheckData(draft.healthCheckData || null);
        setSignature(draft.signature || '');
        setCurrentStep((draft.step as Step) || 'template-select');
        Alert.alert('Draft Loaded', 'Your previous work has been restored.');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      Alert.alert('Error', 'Failed to load draft');
    }
  };

  const loadDraftAndResume = async (id: string, goToEmail: boolean) => {
    setIsLoadingDraft(true);
    try {
      console.log('📄 ==== LOADING DRAFT FOR RESUME ====');
      console.log('📄 Draft ID:', id);
      console.log('📄 Go to email:', goToEmail);
      
      const draft = await temporaryStorage.getDraft(id);
      
      if (draft) {
        console.log('✅ Draft loaded successfully');
        console.log('📄 Draft data:', {
          hasClientInfo: !!draft.clientInfo,
          hasTemplate: !!draft.consentTemplate,
          hasSignature: !!draft.signature,
          hasHealthCheck: !!draft.healthCheckData,
          step: draft.step
        });
        
        if (draft.clientInfo) {
          console.log('👤 Client:', draft.clientInfo.firstName, draft.clientInfo.lastName);
        }
        if (draft.consentTemplate) {
          console.log('📋 Template:', draft.consentTemplate.title);
        }
        if (draft.signature) {
          console.log('✍️ Signature length:', draft.signature.length, 'chars');
        }
        
        // Store draft data in ref for immediate access
        resumeDraftDataRef.current = {
          clientInfo: draft.clientInfo || null,
          consentTemplate: draft.consentTemplate || null,
          signature: draft.signature || '',
          healthCheckData: draft.healthCheckData || null
        };
        
        // Set all state
        setDraftId(id);
        setClientInfo(draft.clientInfo || null);
        setConsentTemplate(draft.consentTemplate || null);
        setHealthCheckData(draft.healthCheckData || null);
        setSignature(draft.signature || '');
        
        if (goToEmail && draft.signature && draft.clientInfo) {
          console.log('📧 ✅ Has required data (signature + clientInfo), will open email dialog');
          setIsResuming(true);
          setCurrentStep('email');
          // Open dialog immediately - we'll use the ref data if state isn't ready
          setTimeout(() => {
            console.log('📧 Opening email dialog now with validated state');
            setEmailDialogVisible(true);
          }, 100); // Much shorter delay since we have ref data
        } else {
          console.log('📧 ❌ Cannot open email dialog:');
          console.log('  - goToEmail:', goToEmail);
          console.log('  - has signature:', !!draft.signature);
          console.log('  - has clientInfo:', !!draft.clientInfo);
          setCurrentStep((draft.step as Step) || 'template-select');
        }
      } else {
        console.warn('⚠️ Draft not found:', id);
        Alert.alert('Error', 'Draft not found');
      }
    } catch (error) {
      console.error('❌ Error loading draft:', error);
      Alert.alert('Error', 'Failed to load draft');
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const saveDraft = async () => {
    try {
      // Ensure we have a draft ID
      let currentDraftId = draftId;
      if (!currentDraftId) {
        currentDraftId = temporaryStorage.generateDraftId();
        setDraftId(currentDraftId);
      }
      
      const draftData = {
        clientInfo,
        consentTemplate,
        healthCheckData,
        signature,
        step: currentStep,
      };

      await temporaryStorage.saveDraft(currentDraftId, draftData, {
        clientName: clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName}` : undefined,
        step: currentStep,
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const clearDraft = async () => {
    try {
      if (draftId) {
        await temporaryStorage.clearDraft(draftId);
      }
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  const loadConsentTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const templates = await consentTemplateService.getActiveTemplates();
      
      // Filter templates based on user settings
      const { storageService } = await import('@/utils/storage');
      const settings = await storageService.getSettings();
      
      let filteredTemplates = templates;
      if (settings.selectedForms && settings.selectedForms.length > 0) {
        // Only show selected forms
        filteredTemplates = templates.filter(template => 
          settings.selectedForms.includes(template.name)
        );
      }
      
      setAvailableTemplates(filteredTemplates);
    } catch (error) {
      console.error('Error loading consent templates:', error);
      Alert.alert('Error', 'Failed to load consent templates. Please try again.');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (template: ConsentTemplate) => {
    setConsentTemplate(template);
    setCurrentStep('info');
  };

  const handleClientInfoSubmit = (info: ClientInfo) => {
    setClientInfo(info);
    // If it's a health check form, go to health check step, otherwise go to consent
    if (consentTemplate?.name === 'acupuncture_health_check_consent' || consentTemplate?.name === 'health_check_consent') {
      setCurrentStep('health-check');
    } else {
      setCurrentStep('consent');
    }
  };

  const handleHealthCheckSubmit = (data: HealthCheckData) => {
    setHealthCheckData(data);
    setCurrentStep('signature');
  };

  const handleConsentRead = () => {
    setHasReadConsent(true);
  };

  const handleContinueToSignature = () => {
    if (!hasReadConsent) {
      Alert.alert(
        'Please Read Consent',
        'You must scroll through and read the entire consent form before proceeding.'
      );
      return;
    }
    setCurrentStep('signature');
  };

  const handleSignatureSave = async (sig: string) => {
    setSignature(sig);
    // Show email dialog
    setEmailDialogVisible(true);
  };

  const handleEmailDialogClose = () => {
    console.log('📧 Email dialog closing');
    setEmailDialogVisible(false);
    // Don't automatically navigate - let user stay on consent form
    // They can manually go back to history if needed
  };

  const handleEmailSend = async (therapistEmailInput: string, clientEmailInput: string) => {
    console.log('📧 ==== EMAIL SEND HANDLER CALLED ====');
    console.log('📧 Therapist email:', therapistEmailInput);
    console.log('📧 Client email:', clientEmailInput);
    console.log('📧 Is resuming:', isResuming);
    console.log('📧 Has ref data:', !!resumeDraftDataRef.current);
    console.log('📧 State check:');
    console.log('  - clientInfo:', !!clientInfo, clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName}` : 'null');
    console.log('  - consentTemplate:', !!consentTemplate, consentTemplate?.title || 'null');
    console.log('  - signature:', !!signature, signature ? `${signature.length} chars` : 'null');
    console.log('  - draftId:', draftId || 'none');
    
    // Use ref data if resuming and state isn't ready
    let effectiveClientInfo = clientInfo;
    let effectiveConsentTemplate = consentTemplate;
    let effectiveSignature = signature;
    let effectiveHealthCheckData = healthCheckData;
    
    if (isResuming && resumeDraftDataRef.current && (!clientInfo || !consentTemplate || !signature)) {
      console.log('⚠️ State not ready, using ref data from resume');
      effectiveClientInfo = resumeDraftDataRef.current.clientInfo;
      effectiveConsentTemplate = resumeDraftDataRef.current.consentTemplate;
      effectiveSignature = resumeDraftDataRef.current.signature;
      effectiveHealthCheckData = resumeDraftDataRef.current.healthCheckData;
      console.log('📧 Using ref data:');
      console.log('  - clientInfo:', !!effectiveClientInfo);
      console.log('  - consentTemplate:', !!effectiveConsentTemplate);
      console.log('  - signature:', !!effectiveSignature);
    }
    
    if (!effectiveClientInfo || !effectiveConsentTemplate || !effectiveSignature) {
      console.error('❌ Missing required information!');
      const missing = [];
      if (!effectiveClientInfo) missing.push('Client Info');
      if (!effectiveConsentTemplate) missing.push('Consent Template');
      if (!effectiveSignature) missing.push('Signature');
      
      Alert.alert(
        'Cannot Send Email', 
        `Missing required data: ${missing.join(', ')}\n\nThe draft may not have been saved correctly. Please fill out the form again.`
      );
      return;
    }

    setIsSending(true);
    try {
      console.log('📧 ==== CONSENT SCREEN: Starting email send ====');
      const clientName = `${effectiveClientInfo.firstName} ${effectiveClientInfo.lastName}`;
      console.log('📧 Sending for client:', clientName);
      
      const response = await emailService.sendConsentForm({
        therapistEmail: therapistEmailInput,
        clientEmail: clientEmailInput || undefined,
        clientName,
        clientInfo: effectiveClientInfo,
        consentText: effectiveConsentTemplate.content,
        signature: effectiveSignature,
        agreedAt: new Date().toISOString(),
        templateName: effectiveConsentTemplate.title,
        healthCheckData: effectiveHealthCheckData || undefined,
      });

      console.log('📧 Email send response:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('✅ Email sent successfully, clearing draft...');
        // Clear draft after successful send
        await clearDraft();
        lastDraftIdRef.current = null;
        resumeDraftDataRef.current = null;
        setIsResuming(false);
        
        // Save therapist email for next time
        await temporaryStorage.saveSettings({
          therapistEmail: therapistEmailInput,
        });
        
        setEmailDialogVisible(false);
        setCurrentStep('complete');
        
        Alert.alert(
          'Success!',
          'Consent form has been sent via email successfully.',
          [
            {
              text: 'View Drafts',
              onPress: () => router.push('/(tabs)/history'),
            },
            {
              text: 'New Form',
              onPress: resetForm,
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('❌ Error sending consent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Error',
        `Failed to send consent form: ${errorMessage}\n\nPlease check:\n- API server is running\n- Device is on same network (${getCurrentConfig().api.baseUrl})\n- Internet connection is stable`
      );
      throw error; // Re-throw for EmailDialog to handle
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('template-select');
    setClientInfo(null);
    setConsentTemplate(null);
    setSignature('');
    setHasReadConsent(false);
    setHealthCheckData(null);
    setDraftId('');
    lastDraftIdRef.current = null; // Clear the ref when resetting
  };

  const renderStepIndicator = () => {
    // Determine steps based on template type
    const isHealthCheckForm = consentTemplate?.name === 'acupuncture_health_check_consent' || 
                               consentTemplate?.name === 'health_check_consent';
    
    const steps = isHealthCheckForm
      ? [
          { key: 'template-select', label: 'Select' },
          { key: 'info', label: 'Info' },
          { key: 'health-check', label: 'Health' },
          { key: 'signature', label: 'Sign' },
        ]
      : [
          { key: 'template-select', label: 'Select' },
          { key: 'info', label: 'Info' },
          { key: 'consent', label: 'Read' },
          { key: 'signature', label: 'Sign' },
        ];

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => {
          // Treat 'email' step as part of 'signature' for indicator purposes
          const isActive = currentStep === step.key || (currentStep === 'email' && step.key === 'signature');
          const currentStepIndex = steps.findIndex(s => s.key === currentStep || (currentStep === 'email' && s.key === 'signature'));
          const isComplete = currentStepIndex > index;
          
          return (
            <View key={step.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isComplete && styles.stepCircleComplete,
                ]}
              >
                <ThemedText
                  style={[
                    styles.stepNumber,
                    (isActive || isComplete) && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={styles.stepLabel}>{step.label}</ThemedText>
            </View>
          );
        })}
      </View>
    );
  };

  // Show loading state while draft is being loaded
  if (isLoadingDraft) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText type="title">Loading Draft...</ThemedText>
          <ThemedText style={{ marginTop: 10 }}>Please wait</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Debug Info Button - Only in dev mode */}
      {__DEV__ && (
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => {
            const config = getCurrentConfig();
            Alert.alert(
              'Debug Info',
              `Environment: ${config.environment}\nAPI URL: ${config.api.baseUrl}\nPlatform: ${Platform.OS}\n\nThis info helps troubleshoot connection issues.`
            );
          }}
        >
          <ThemedText style={styles.debugButtonText}>ℹ️</ThemedText>
        </TouchableOpacity>
      )}
      
      {renderStepIndicator()}

      <View style={styles.content}>
        {currentStep === 'template-select' && (
          <View style={styles.stepContainer}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Select Consent Form Type
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Please choose the type of consent form you need to complete
            </ThemedText>
            
            {isLoadingTemplates ? (
              <ThemedText style={styles.loadingText}>Loading templates...</ThemedText>
            ) : availableTemplates.length === 0 ? (
              <ThemedText style={styles.errorText}>
                No templates available. Please contact support.
              </ThemedText>
            ) : (
              <View style={styles.templateList}>
                {availableTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.templateCard}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <ThemedText type="subtitle" style={styles.templateTitle}>
                      {template.title}
                    </ThemedText>
                    <ThemedText style={styles.templateVersion}>
                      Version {template.version}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {currentStep === 'info' && (
          <View style={styles.stepContainer}>
            <ClientInfoForm 
              onSubmit={handleClientInfoSubmit}
              initialData={clientInfo || undefined}
            />
            <View style={styles.buttonContainer}>
              <Button
                title="Back to Template Selection"
                onPress={resetForm}
                color="#999"
              />
            </View>
          </View>
        )}

        {currentStep === 'health-check' && (
          <View style={styles.stepContainer}>
            {consentTemplate?.name === 'acupuncture_health_check_consent' ? (
              <AcupunctureHealthCheckForm 
                onSubmit={handleHealthCheckSubmit}
                onBack={() => setCurrentStep('info')}
              />
            ) : (
              <MassageHealthCheckForm 
                onSubmit={handleHealthCheckSubmit}
                onBack={() => setCurrentStep('info')}
              />
            )}
          </View>
        )}

        {currentStep === 'consent' && (
          <View style={styles.stepContainer}>
            <ConsentText template={consentTemplate || undefined} onScrollEnd={handleConsentRead} />
            <View style={styles.buttonContainer}>
              <Button
                title="Back"
                onPress={() => setCurrentStep('info')}
                color="#999"
              />
              <Button
                title="Continue to Sign"
                onPress={handleContinueToSignature}
                color="#007AFF"
                disabled={!hasReadConsent}
              />
            </View>
          </View>
        )}

        {currentStep === 'signature' && (
          <View style={styles.stepContainer}>
            <SignaturePadWorking
              onSave={handleSignatureSave}
              onClear={() => setSignature('')}
            />
            <View style={styles.buttonContainer}>
              <Button
                title="Back"
                onPress={() => {
                  // Go back to health-check if it's a health check form, otherwise go to consent
                  if (consentTemplate?.name === 'acupuncture_health_check_consent' || 
                      consentTemplate?.name === 'health_check_consent') {
                    setCurrentStep('health-check');
                  } else {
                    setCurrentStep('consent');
                  }
                }}
                color="#999"
                disabled={isSending}
              />
            </View>
          </View>
        )}

        {currentStep === 'complete' && (
          <View style={styles.completeContainer}>
            <ThemedText type="title" style={styles.completeTitle}>
              ✓ Consent Form Sent
            </ThemedText>
            <ThemedText style={styles.completeText}>
              Thank you, {clientInfo?.firstName}! The consent form has been sent via email successfully.
            </ThemedText>
            <ThemedText style={styles.completeSubtext}>
              📧 A copy has been sent to the therapist's email
            </ThemedText>
            <View style={styles.completeButtons}>
              <Button
                title="Start New Form"
                onPress={resetForm}
                color="#007AFF"
              />
              <View style={{ height: 12 }} />
              <Button
                title="View Drafts"
                onPress={() => router.push('/(tabs)/history')}
                color="#4CAF50"
              />
            </View>
          </View>
        )}
      </View>

      {/* Email Dialog */}
      <EmailDialog
        visible={emailDialogVisible}
        onClose={handleEmailDialogClose}
        onSend={handleEmailSend}
        clientEmail={clientInfo?.email || ''}
        clientName={clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName}` : ''}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#007AFF',
  },
  stepCircleComplete: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  completeTitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#4CAF50',
  },
  completeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  completeSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  completeButtons: {
    width: '100%',
    maxWidth: 300,
  },
  sectionTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  templateList: {
    gap: 16,
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateTitle: {
    marginBottom: 4,
    color: '#007AFF',
  },
  templateVersion: {
    fontSize: 12,
    opacity: 0.6,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ff3b30',
    marginTop: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  debugButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  debugButtonText: {
    fontSize: 18,
  },
});
