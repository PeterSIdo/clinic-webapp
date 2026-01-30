import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DraftMetadata, temporaryStorage } from '@/services/temporaryStorage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const [drafts, setDrafts] = useState<DraftMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [clearAllDialogVisible, setClearAllDialogVisible] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DraftMetadata | null>(null);

  const loadDrafts = async () => {
    try {
      const draftList = await temporaryStorage.getDraftList();
      // Sort by updated date, newest first
      const sortedDrafts = draftList.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setDrafts(sortedDrafts);
      console.log(`✅ Loaded ${sortedDrafts.length} drafts`);
    } catch (error) {
      console.error('Error loading drafts:', error);
      Alert.alert('Error', 'Failed to load drafts');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDrafts();
      // Clean up old drafts (older than 7 days)
      temporaryStorage.cleanupOldDrafts(7);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDrafts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleResumeDraft = (draft: DraftMetadata) => {
    // Navigate to consent screen with draft ID to load and go to email step
    router.replace({
      pathname: '/(tabs)/consent',
      params: { draftId: draft.id, resumeToEmail: 'true' }
    });
  };

  const handleDeleteDraft = (draft: DraftMetadata) => {
    console.log('🗑️ Delete button pressed for draft:', draft.id, draft.clientName);
    setSelectedDraft(draft);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteDraft = async () => {
    if (!selectedDraft) return;
    
    try {
      console.log('🗑️ Deleting draft:', selectedDraft.id);
      await temporaryStorage.clearDraft(selectedDraft.id);
      console.log('✅ Draft deleted, reloading list');
      await loadDrafts();
      setDeleteDialogVisible(false);
      setSelectedDraft(null);
    } catch (error) {
      console.error('❌ Error deleting draft:', error);
      Alert.alert('Error', 'Failed to delete draft: ' + error);
      setDeleteDialogVisible(false);
    }
  };

  const handleClearAllDrafts = () => {
    if (drafts.length === 0) return;
    console.log('🗑️ Clear All button pressed, deleting', drafts.length, 'drafts');
    setClearAllDialogVisible(true);
  };

  const confirmClearAllDrafts = async () => {
    try {
      await temporaryStorage.clearAllDrafts();
      console.log('✅ All drafts deleted, reloading list');
      await loadDrafts();
      setClearAllDialogVisible(false);
    } catch (error) {
      console.error('❌ Error clearing drafts:', error);
      Alert.alert('Error', 'Failed to clear drafts: ' + error);
      setClearAllDialogVisible(false);
    }
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'template-select': return 'Template Selection';
      case 'info': return 'Client Info';
      case 'health-check': return 'Health Check';
      case 'consent': return 'Consent Review';
      case 'signature': return 'Signature';
      case 'email': return 'Email';
      default: return step;
    }
  };

  const renderDraftItem = ({ item }: { item: DraftMetadata }) => (
    <View style={styles.draftCard}>
      <View style={styles.cardTouchable}>
        <View style={styles.cardHeader}>
          <ThemedText type="defaultSemiBold" style={styles.clientName}>
            {item.clientName || 'Unnamed Client'}
          </ThemedText>
          <View style={styles.draftBadge}>
            <ThemedText style={styles.draftText}>📝 Draft</ThemedText>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Step:</ThemedText>
            <ThemedText style={styles.detailValue}>{getStepLabel(item.step)}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Last Updated:</ThemedText>
            <ThemedText style={styles.detailValue}>{formatDate(item.updatedAt)}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Created:</ThemedText>
            <ThemedText style={styles.detailValue}>{formatDate(item.createdAt)}</ThemedText>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.resumeButton}
            onPress={() => {
              console.log('▶️ Resume button pressed');
              handleResumeDraft(item);
            }}
          >
            <ThemedText style={styles.resumeButtonText}>▶️ Resume</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              console.log('🗑️ Delete button CLICKED for:', item.clientName);
              handleDeleteDraft(item);
            }}
          >
            <ThemedText style={styles.deleteButtonText}>🗑️ Delete</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText type="title" style={styles.emptyTitle}>
        No Drafts
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        Drafts are automatically saved as you fill out consent forms.{'\n\n'}
        Start a new form to create a draft.
      </ThemedText>
      <TouchableOpacity 
        style={styles.newFormButton}
        onPress={() => router.push('/(tabs)/consent')}
      >
        <ThemedText style={styles.newFormButtonText}>+ New Form</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <ThemedText type="title">Saved Drafts</ThemedText>
          <ThemedText style={styles.subtitle}>
            {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
          </ThemedText>
        </View>
        {drafts.length > 0 && (
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={handleClearAllDrafts}
          >
            <ThemedText style={styles.clearAllButtonText}>Clear All</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.infoBox}>
        <ThemedText style={styles.infoText}>
          ℹ️ Drafts are stored locally on this device and automatically deleted after 7 days.
        </ThemedText>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading drafts...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={drafts}
        renderItem={renderDraftItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Draft"
        message={`Are you sure you want to delete the draft for ${selectedDraft?.clientName || 'this client'}?`}
        onConfirm={confirmDeleteDraft}
        onCancel={() => {
          setDeleteDialogVisible(false);
          setSelectedDraft(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
      
      <ConfirmDialog
        visible={clearAllDialogVisible}
        title="Clear All Drafts"
        message={`Are you sure you want to delete all ${drafts.length} draft${drafts.length > 1 ? 's' : ''}?`}
        onConfirm={confirmClearAllDrafts}
        onCancel={() => setClearAllDialogVisible(false)}
        confirmText="Delete All"
        cancelText="Cancel"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  clearAllButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
  },
  listContent: {
    flexGrow: 1,
  },
  draftCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardTouchable: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  draftBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  draftText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    color: '#000',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  deleteButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 24,
  },
  newFormButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newFormButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
