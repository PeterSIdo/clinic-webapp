import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HealthCheckData } from '@/types/consent';
import React, { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface AcupunctureHealthCheckFormProps {
  onSubmit: (data: HealthCheckData) => void;
  onBack?: () => void;
}

export function AcupunctureHealthCheckForm({ onSubmit, onBack }: AcupunctureHealthCheckFormProps) {
  const [formData, setFormData] = useState<HealthCheckData>({
    // Medical History
    heartConditions: false,
    bleedingDisorders: false,
    diabetes: false,
    epilepsy: false,
    infectiousDiseases: false,
    skinConditions: false,
    pregnancy: false,
    allergies: false,
    allergiesDetails: '',
    otherConditions: false,
    otherConditionsDetails: '',
    
    // Current Health
    underMedicalCare: false,
    takingMedications: false,
    medicationsList: '',
    recentInjuriesSurgeries: false,
    recentInjuriesDetails: '',
    concernsAboutAcupuncture: false,
    
    // Lifestyle
    smokes: false,
    drinksAlcohol: false,
    exercisesRegularly: false,
    
    // Consent confirmations
    disclosedHealthInfo: false,
    understandsTreatment: false,
    understandsWithdrawal: false,
    consentsToTreatment: false,
  });

  const updateField = (field: keyof HealthCheckData, value: boolean | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate consent checkboxes
    if (!formData.disclosedHealthInfo || !formData.understandsTreatment || 
        !formData.understandsWithdrawal || !formData.consentsToTreatment) {
      Alert.alert(
        'Consent Required',
        'Please check all 4 consent checkboxes at the bottom of the form before proceeding.'
      );
      return;
    }

    // Validate details fields if checkboxes are checked
    if (formData.allergies && !formData.allergiesDetails?.trim()) {
      Alert.alert('Missing Information', 'Please specify your allergies.');
      return;
    }

    if (formData.otherConditions && !formData.otherConditionsDetails?.trim()) {
      Alert.alert('Missing Information', 'Please specify your other medical conditions.');
      return;
    }

    if (formData.takingMedications && !formData.medicationsList?.trim()) {
      Alert.alert('Missing Information', 'Please list your medications.');
      return;
    }

    if (formData.recentInjuriesSurgeries && !formData.recentInjuriesDetails?.trim()) {
      Alert.alert('Missing Information', 'Please describe your recent injuries or surgeries.');
      return;
    }

    console.log('Form validation passed, submitting data');
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.formContainer}>
        <ThemedText type="title" style={styles.mainTitle}>
          Acupuncture Health Check Form
        </ThemedText>

        {/* Medical History Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Medical History
        </ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Please tick if you have ever experienced the following:
        </ThemedText>

        <CheckboxField
          label="Heart conditions / pacemaker"
          value={formData.heartConditions}
          onChange={(val) => updateField('heartConditions', val)}
        />
        <CheckboxField
          label="Bleeding disorders / use of blood thinners"
          value={formData.bleedingDisorders || false}
          onChange={(val) => updateField('bleedingDisorders', val)}
        />
        <CheckboxField
          label="Diabetes"
          value={formData.diabetes}
          onChange={(val) => updateField('diabetes', val)}
        />
        <CheckboxField
          label="Epilepsy or seizures"
          value={formData.epilepsy}
          onChange={(val) => updateField('epilepsy', val)}
        />
        <CheckboxField
          label="Infectious diseases (e.g., hepatitis, HIV)"
          value={formData.infectiousDiseases}
          onChange={(val) => updateField('infectiousDiseases', val)}
        />
        <CheckboxField
          label="Skin conditions or infections"
          value={formData.skinConditions}
          onChange={(val) => updateField('skinConditions', val)}
        />
        <CheckboxField
          label="Pregnancy (current or recent)"
          value={formData.pregnancy}
          onChange={(val) => updateField('pregnancy', val)}
        />
        
        <CheckboxField
          label="Allergies"
          value={formData.allergies}
          onChange={(val) => updateField('allergies', val)}
        />
        {formData.allergies && (
          <TextInput
            style={styles.textInput}
            placeholder="Please specify allergies"
            value={formData.allergiesDetails}
            onChangeText={(text) => updateField('allergiesDetails', text)}
            multiline
          />
        )}

        <CheckboxField
          label="Other medical conditions"
          value={formData.otherConditions}
          onChange={(val) => updateField('otherConditions', val)}
        />
        {formData.otherConditions && (
          <View>
            <TextInput
              style={styles.textInput}
              placeholder="Please specify other conditions"
              value={formData.otherConditionsDetails}
              onChangeText={(text) => updateField('otherConditionsDetails', text)}
              multiline
            />
            {(!formData.otherConditionsDetails || formData.otherConditionsDetails.trim() === '') && (
              <ThemedText style={styles.warningText}>
                ⚠️ Please specify other conditions
              </ThemedText>
            )}
          </View>
        )}

        {/* Current Health Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Current Health
        </ThemedText>

        <YesNoField
          label="Are you currently under medical care?"
          value={formData.underMedicalCare}
          onChange={(val) => updateField('underMedicalCare', val)}
        />

        <YesNoField
          label="Are you taking any prescribed medications?"
          value={formData.takingMedications}
          onChange={(val) => updateField('takingMedications', val)}
        />
        {formData.takingMedications && (
          <TextInput
            style={styles.textInput}
            placeholder="Please list medications"
            value={formData.medicationsList}
            onChangeText={(text) => updateField('medicationsList', text)}
            multiline
          />
        )}

        <YesNoField
          label="Do you have any recent injuries or surgeries?"
          value={formData.recentInjuriesSurgeries}
          onChange={(val) => updateField('recentInjuriesSurgeries', val)}
        />
        {formData.recentInjuriesSurgeries && (
          <TextInput
            style={styles.textInput}
            placeholder="Please describe the injuries or surgeries"
            value={formData.recentInjuriesDetails}
            onChangeText={(text) => updateField('recentInjuriesDetails', text)}
            multiline
          />
        )}

        <YesNoField
          label="Do you have any concerns about receiving acupuncture?"
          value={formData.concernsAboutAcupuncture || false}
          onChange={(val) => updateField('concernsAboutAcupuncture', val)}
        />

        {/* Lifestyle Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Lifestyle
        </ThemedText>

        <YesNoField
          label="Do you smoke?"
          value={formData.smokes}
          onChange={(val) => updateField('smokes', val)}
        />

        <YesNoField
          label="Do you drink alcohol?"
          value={formData.drinksAlcohol}
          onChange={(val) => updateField('drinksAlcohol', val)}
        />

        <YesNoField
          label="Do you exercise regularly?"
          value={formData.exercisesRegularly}
          onChange={(val) => updateField('exercisesRegularly', val)}
        />

        {/* Consent Section */}
        <View style={styles.consentSection}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: '#fff' }]}>
            Consent (Required)
          </ThemedText>
          <ThemedText style={styles.consentIntro}>
            I understand that acupuncture involves the insertion of fine needles into the skin and 
            may cause minor side effects such as bruising, bleeding, or temporary discomfort. I confirm that:
          </ThemedText>

          <CheckboxField
            label="I have disclosed all relevant health information"
            value={formData.disclosedHealthInfo}
            onChange={(val) => updateField('disclosedHealthInfo', val)}
            lightText
          />
          <CheckboxField
            label="I understand the nature of acupuncture treatment"
            value={formData.understandsTreatment}
            onChange={(val) => updateField('understandsTreatment', val)}
            lightText
          />
          <CheckboxField
            label="I understand I can withdraw from the treatment at any time"
            value={formData.understandsWithdrawal || false}
            onChange={(val) => updateField('understandsWithdrawal', val)}
            lightText
          />
          <CheckboxField
            label="I give my consent to receiving acupuncture"
            value={formData.consentsToTreatment}
            onChange={(val) => updateField('consentsToTreatment', val)}
            lightText
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onBack && (
            <Button
              title="Back"
              onPress={onBack}
              color="#999"
            />
          )}
          <Button
            title="Continue to Signature"
            onPress={handleSubmit}
            color="#007AFF"
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

// Helper component for checkbox fields
function CheckboxField({ 
  label, 
  value, 
  onChange,
  lightText = false
}: { 
  label: string; 
  value: boolean; 
  onChange: (value: boolean) => void;
  lightText?: boolean;
}) {
  return (
    <TouchableOpacity 
      style={styles.checkboxRow} 
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxBox}>
        {value && (
          <View style={styles.checkboxTick} />
        )}
      </View>
      <ThemedText style={[styles.checkboxLabel, lightText && { color: '#fff' }]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

// Helper component for Yes/No fields
function YesNoField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: boolean; 
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.yesNoContainer}>
      <ThemedText style={styles.yesNoLabel}>{label}</ThemedText>
      <View style={styles.yesNoButtons}>
        <Button
          title="Yes"
          onPress={() => onChange(true)}
          color={value ? '#4CAF50' : '#ccc'}
        />
        <View style={{ width: 8 }} />
        <Button
          title="No"
          onPress={() => onChange(false)}
          color={!value ? '#f44336' : '#ccc'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  mainTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    color: '#007AFF',
  },
  sectionDescription: {
    marginBottom: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxTick: {
    width: 14,
    height: 14,
    backgroundColor: '#4CAF50',
    borderRadius: 7,
  },
  checkboxLabel: {
    marginLeft: 12,
    flex: 1,
    fontSize: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginLeft: 48,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  warningText: {
    color: '#ff9800',
    fontSize: 14,
    marginLeft: 48,
    marginTop: -12,
    marginBottom: 16,
    fontWeight: '500',
  },
  yesNoContainer: {
    marginBottom: 16,
  },
  yesNoLabel: {
    marginBottom: 8,
    fontSize: 15,
  },
  yesNoButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  consentIntro: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
  },
  consentSection: {
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#34495e',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 40,
    gap: 12,
  },
});
