import { DEFAULT_CONSENT_TEXT } from '@/constants/consentText';
import { ConsentTemplate } from '@/types/consent';
import React from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { ThemedText } from './themed-text';

interface ConsentTextProps {
  template?: ConsentTemplate;
  text?: string;
  onScrollEnd?: () => void;
}

export function ConsentText({ template, text, onScrollEnd }: ConsentTextProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);
  const [contentHeight, setContentHeight] = React.useState(0);
  const [scrollViewHeight, setScrollViewHeight] = React.useState(0);

  // Use template content if available, otherwise fall back to provided text or default
  const consentText = template?.content || text || DEFAULT_CONSENT_TEXT;
  const consentTitle = template?.title || 'Please Read the Consent Form';

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    
    if (isCloseToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      onScrollEnd?.();
    }
  };

  // Handle content layout to detect if scrolling is needed
  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height);
    checkIfScrollable(scrollViewHeight, height);
  };

  // Handle scroll view layout
  const handleScrollViewLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
    checkIfScrollable(height, contentHeight);
  };

  // Check if content fits entirely on screen (no scrolling needed)
  const checkIfScrollable = (viewHeight: number, contentH: number) => {
    // If both measurements are available and content fits on screen
    if (viewHeight > 0 && contentH > 0 && contentH <= viewHeight) {
      // Content fits entirely - automatically mark as read
      if (!hasScrolledToBottom) {
        setHasScrolledToBottom(true);
        onScrollEnd?.();
      }
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          {consentTitle}
        </ThemedText>
        {template && (
          <ThemedText style={styles.version}>
            Version {template.version}
          </ThemedText>
        )}
        <ThemedText style={styles.instruction}>
          {contentHeight > scrollViewHeight 
            ? 'Scroll down to read the entire document before signing'
            : 'Please read the document before signing'}
        </ThemedText>
      </View>
      
      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          showsVerticalScrollIndicator={true}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleScrollViewLayout}
        >
          <ThemedText style={styles.consentText}>
            {consentText}
          </ThemedText>
        </ScrollView>
      </View>

      {hasScrolledToBottom && (
        <View style={styles.readIndicator}>
          <ThemedText style={styles.readText}>✓ Document read</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingBottom: 12,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  instruction: {
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 16,
  },
  consentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  readIndicator: {
    padding: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    alignItems: 'center',
  },
  readText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
