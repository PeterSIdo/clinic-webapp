import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { temporaryStorage } from '@/services/temporaryStorage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [draftCount, setDraftCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadDraftCount();
    }, [])
  );

  const loadDraftCount = async () => {
    try {
      const drafts = await temporaryStorage.getDraftList();
      setDraftCount(drafts.length);
      console.log(`✅ Loaded ${drafts.length} drafts from local storage`);
    } catch (error) {
      console.error('Error loading drafts:', error);
      setDraftCount(0);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Client Consent App
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Digital Consent Form Management
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/consent')}
          >
            <ThemedText style={styles.primaryButtonText}>
              📝 Start New Form
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/history')}
          >
            <ThemedText style={styles.secondaryButtonText}>
              📋 View All Forms
            </ThemedText>
          </TouchableOpacity>

          {draftCount > 0 && (
            <ThemedText style={styles.draftInfo}>
              {draftCount} {draftCount === 1 ? 'draft' : 'drafts'} saved locally
            </ThemedText>
          )}
        </View>

        <View style={styles.infoSection}>
          <ThemedText type="subtitle" style={styles.infoTitle}>
            How it works:
          </ThemedText>
          <View style={styles.stepItem}>
            <ThemedText style={styles.stepNumber}>1</ThemedText>
            <ThemedText style={styles.stepText}>
              Client enters their information
            </ThemedText>
          </View>
          <View style={styles.stepItem}>
            <ThemedText style={styles.stepNumber}>2</ThemedText>
            <ThemedText style={styles.stepText}>
              Client reads the consent form
            </ThemedText>
          </View>
          <View style={styles.stepItem}>
            <ThemedText style={styles.stepNumber}>3</ThemedText>
            <ThemedText style={styles.stepText}>
              Client signs with their finger
            </ThemedText>
          </View>
          <View style={styles.stepItem}>
            <ThemedText style={styles.stepNumber}>4</ThemedText>
            <ThemedText style={styles.stepText}>
              Form is sent via email
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  statsCard: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  draftInfo: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoSection: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  infoTitle: {
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '600',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
  },
});
