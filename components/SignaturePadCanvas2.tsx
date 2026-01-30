import React, { useRef, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
}

export function SignaturePadCanvas2({ onSave, onClear }: SignaturePadProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isSigned, setIsSigned] = useState(false);
  const pathRef = useRef<string>('');

  const onTouchStart = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    pathRef.current = `M${locationX},${locationY}`;
    setCurrentPath(pathRef.current);
    setIsSigned(true);
  };

  const onTouchMove = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    pathRef.current += ` L${locationX},${locationY}`;
    setCurrentPath(pathRef.current);
  };

  const onTouchEnd = () => {
    if (pathRef.current) {
      setPaths([...paths, pathRef.current]);
      pathRef.current = '';
      setCurrentPath('');
    }
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
    setIsSigned(false);
    onClear?.();
  };

  const handleSave = () => {
    if (paths.length === 0) {
      Alert.alert('Empty Signature', 'Please provide a signature before saving.');
      return;
    }
    
    const signatureData = `signature_${Date.now()}_${paths.length}strokes`;
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

      <View
        style={styles.signatureContainer}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Svg height="100%" width="100%" style={styles.svg}>
          <G>
            {paths.map((path, index) => (
              <Path
                key={`saved-${index}`}
                d={path}
                stroke="#000"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath && (
              <Path
                d={currentPath}
                stroke="#000"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </G>
        </Svg>
        {!isSigned && (
          <View style={styles.placeholderContainer}>
            <ThemedText style={styles.placeholderText}>
              Sign here with your finger
            </ThemedText>
          </View>
        )}
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

      {isSigned && paths.length > 0 && (
        <View style={styles.signedIndicator}>
          <ThemedText style={styles.signedText}>
            ✓ Signature captured ({paths.length} stroke{paths.length !== 1 ? 's' : ''})
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
    backgroundColor: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  svg: {
    backgroundColor: 'transparent',
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
    fontSize: 16,
    fontStyle: 'italic',
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
