import React, { useRef, useState } from 'react';
import { Alert, Button, Image, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
}

export function SignaturePadWorking({ onSave, onClear }: SignaturePadProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [savedSignature, setSavedSignature] = useState<string>('');
  const [containerDimensions, setContainerDimensions] = useState({ width: 400, height: 250 });
  const isDrawing = useRef(false);

  const handleTouchStart = (event: any) => {
    isDrawing.current = true;
    const touch = event.nativeEvent.touches?.[0] || event.nativeEvent;
    const x = touch.locationX ?? touch.pageX;
    const y = touch.locationY ?? touch.pageY;
    setCurrentPath(`M ${x} ${y}`);
  };

  const handleTouchMove = (event: any) => {
    if (!isDrawing.current) return;
    
    const touch = event.nativeEvent.touches?.[0] || event.nativeEvent;
    const x = touch.locationX ?? touch.pageX;
    const y = touch.locationY ?? touch.pageY;
    
    setCurrentPath(prev => `${prev} L ${x} ${y}`);
  };

  const handleTouchEnd = () => {
    if (currentPath && isDrawing.current) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath('');
    }
    isDrawing.current = false;
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    setSavedSignature('');
    isDrawing.current = false;
    onClear?.();
  };

  const handleSave = () => {
    if (paths.length === 0) {
      Alert.alert('Empty Signature', 'Please provide a signature before saving.');
      return;
    }
    
    // Create SVG string from the signature paths using actual container dimensions
    const svgWidth = containerDimensions.width;
    const svgHeight = containerDimensions.height;
    
    const svgContent = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">
      ${paths.map((path, index) => 
        `<path d="${path}" stroke="#000000" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`
      ).join('')}
    </svg>`;
    
    // Convert SVG to Base64 (keep as SVG for app display)
    const base64Signature = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    
    // Save the signature for preview
    setSavedSignature(base64Signature);
    
    onSave(base64Signature);
  };

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Sign Below
      </ThemedText>
      <ThemedText style={styles.instruction}>
        Use your finger or mouse to sign in the box below
      </ThemedText>

      <View
        style={styles.signatureContainer}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        <Svg height="100%" width="100%" style={styles.svg}>
          {paths.map((path, index) => (
            <Path
              key={`stroke-${index}`}
              d={path}
              stroke="#000000"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath}
              stroke="#000000"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
        
        {paths.length === 0 && !currentPath && (
          <View style={styles.placeholderContainer}>
            <ThemedText style={styles.placeholderText}>
              ✍️ Sign here
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button
            title="Clear"
            onPress={handleClear}
            color="#FF6B6B"
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Save Signature"
            onPress={handleSave}
            color="#4CAF50"
          />
        </View>
      </View>

      {paths.length > 0 && (
        <View style={styles.signedIndicator}>
          <ThemedText style={styles.signedText}>
            ✓ {paths.length} stroke{paths.length !== 1 ? 's' : ''} captured
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  instruction: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
  signatureContainer: {
    height: 250,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  svg: {
    flex: 1,
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  placeholderText: {
    color: '#999',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  signedIndicator: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    alignItems: 'center',
  },
  signedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
