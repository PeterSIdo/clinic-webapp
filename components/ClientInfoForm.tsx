import { ClientInfo } from '@/types/consent';
import React, { useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface ClientInfoFormProps {
  onSubmit: (clientInfo: ClientInfo) => void;
  initialData?: Partial<ClientInfo>;
}

export function ClientInfoForm({ onSubmit, initialData }: ClientInfoFormProps) {
  const [formData, setFormData] = useState<Partial<ClientInfo>>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dateOfBirth: initialData?.dateOfBirth || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email is optional, but validate format if provided
    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Date of birth validation (optional field, but validate format if provided)
    if (formData.dateOfBirth?.trim()) {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = formData.dateOfBirth.trim().match(dateRegex);
      
      if (!match) {
        newErrors.dateOfBirth = 'Date must be in DD/MM/YYYY format';
      } else {
        const [, day, month, year] = match;
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        // Check if it's a valid date
        const date = new Date(yearNum, monthNum - 1, dayNum);
        
        if (date.getDate() !== dayNum || 
            date.getMonth() !== monthNum - 1 || 
            date.getFullYear() !== yearNum) {
          newErrors.dateOfBirth = 'Invalid date';
        } else if (date > new Date()) {
          newErrors.dateOfBirth = 'Date of birth cannot be in the future';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const clientInfo: ClientInfo = {
        id: initialData?.id || Date.now().toString(),
        firstName: formData.firstName!.trim(),
        lastName: formData.lastName!.trim(),
        email: formData.email!.trim(),
        phone: formData.phone!.trim(),
        dateOfBirth: formData.dateOfBirth?.trim(),
      };
      onSubmit(clientInfo);
    }
  };

  const updateField = (field: keyof ClientInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="subtitle" style={styles.title}>
            Client Information
          </ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>First Name *</ThemedText>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              value={formData.firstName}
              onChangeText={(text) => updateField('firstName', text)}
              placeholder="Enter first name"
              placeholderTextColor="#999"
            />
            {errors.firstName && (
              <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText>
            )}
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Last Name *</ThemedText>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              value={formData.lastName}
              onChangeText={(text) => updateField('lastName', text)}
              placeholder="Enter last name"
              placeholderTextColor="#999"
            />
            {errors.lastName && (
              <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText>
            )}
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Email </ThemedText>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="email@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.email && (
              <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
            )}
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Phone Number *</ThemedText>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            {errors.phone && (
              <ThemedText style={styles.errorText}>{errors.phone}</ThemedText>
            )}
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Date of Birth (Optional)</ThemedText>
            <TextInput
              style={[styles.input, errors.dateOfBirth && styles.inputError]}
              value={formData.dateOfBirth}
              onChangeText={(text) => updateField('dateOfBirth', text)}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              keyboardType="numbers-and-punctuation"
            />
            {errors.dateOfBirth && (
              <ThemedText style={styles.errorText}>{errors.dateOfBirth}</ThemedText>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Continue to Consent Form"
              onPress={handleSubmit}
              color="#007AFF"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
});
