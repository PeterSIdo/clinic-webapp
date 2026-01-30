import React, { useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

// For web and platforms without WebView support
import { Canvas, Path, Skia, TouchInfo, useTouchHandler } from '@shopify/react-native-skia';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
}

export function SignaturePadCanvas({ onSave, onClear }: SignaturePadProps) {
  const [paths, setPaths] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<any>(null);

  const onTouch = useTouchHandler({
    onStart: (touchInfo: TouchInfo) => {
      const { x, y } = touchInfo;
      const newPath = Skia.Path.Make();
      newPath.moveTo(x, y);
      setCurrentPath(newPath);
    },
    onActive: (touchInfo: TouchInfo) => {
      const { x, y } = touchInfo;
      if (currentPath) {
        currentPath.lineTo(x, y);
        setCurrentPath(currentPath.copy());
      }
    },
    onEnd: () => {
      if (currentPath) {
        setPaths([...paths, currentPath]);
        setCurrentPath(null);
      }
    },
  });

  const handleClear = () => {
    setPaths([]);
    setCurrentPath(null);
    onClear?.();
  };

  const handleSave = () => {
    if (paths.length === 0 && !currentPath) {
      Alert.alert('Empty Signature', 'Please provide a signature before saving.');
      return;
    }
    
    // For now, we'll save a placeholder. In production, you'd capture the canvas as image
    const signatureData = `data:image/png;base64,signature_${Date.now()}`;
    onSave(signatureData);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Sign Below
      </ThemedText>
      <ThemedText style={styles.instruction}>
        Use your finger to sign in the box below
      </ThemedText>

      <View style={styles.signatureContainer}>
        <Canvas style={styles.canvas} onTouch={onTouch}>
          {paths.map((path, index) => (
            <Path
              key={index}
              path={path}
              color="black"
              style="stroke"
              strokeWidth={3}
            />
          ))}
          {currentPath && (
            <Path
              path={currentPath}
              color="black"
              style="stroke"
              strokeWidth={3}
            />
          )}
        </Canvas>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button
            title="Clear Signature"
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
          <ThemedText style={styles.signedText}>✓ Signature captured</ThemedText>
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
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
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
