import React, { useRef, useState } from 'react';
import { Alert, Button, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
}

interface Point {
  x: number;
  y: number;
}

export function SignaturePadSimple({ onSave, onClear }: SignaturePadProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [isSigned, setIsSigned] = useState(false);
  const currentPathRef = useRef<Point[]>([]);
  const [, forceUpdate] = useState(0);

  const pointsToSvgPath = (points: Point[]): string => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current = [{ x: locationX, y: locationY }];
        setIsSigned(true);
        forceUpdate(prev => prev + 1);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current.push({ x: locationX, y: locationY });
        forceUpdate(prev => prev + 1);
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current.length > 0) {
          const pathString = pointsToSvgPath(currentPathRef.current);
          setPaths(prevPaths => [...prevPaths, pathString]);
          currentPathRef.current = [];
          forceUpdate(prev => prev + 1);
        }
      },
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    currentPathRef.current = [];
    setIsSigned(false);
    onClear?.();
  };

  const handleSave = () => {
    if (paths.length === 0 && currentPathRef.current.length === 0) {
      Alert.alert('Empty Signature', 'Please provide a signature before saving.');
      return;
    }
    
    // Create a simple signature data representation
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

      <View style={styles.signatureContainer} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          {paths.map((path, index) => (
            <Path
              key={`path-${index}`}
              d={path}
              stroke="black"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPathRef.current.length > 0 && (
            <Path
              key="current-path"
              d={pointsToSvgPath(currentPathRef.current)}
              stroke="black"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
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

      {isSigned && (
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
