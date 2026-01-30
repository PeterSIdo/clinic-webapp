import React, { useRef, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
}

export function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const signatureRef = useRef<any>(null);
  const [isSigned, setIsSigned] = useState(false);

  const handleSignature = (signature: string) => {
    setIsSigned(true);
    onSave(signature);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setIsSigned(false);
    onClear?.();
  };

  const handleEmpty = () => {
    Alert.alert('Empty Signature', 'Please provide a signature before saving.');
  };

  const handleBegin = () => {
    setIsSigned(false);
  };

  const style = `.m-signature-pad {
    box-shadow: none;
    border: 2px solid #ccc;
    border-radius: 8px;
  }
  .m-signature-pad--body {
    border: none;
  }
  .m-signature-pad--footer {
    display: none;
  }
  body,html {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }`;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Sign Below
      </ThemedText>
      <ThemedText style={styles.instruction}>
        Use your finger to sign in the box below
      </ThemedText>

      <View style={styles.signatureContainer}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={handleSignature}
          onEmpty={handleEmpty}
          onBegin={handleBegin}
          descriptionText=""
          clearText="Clear"
          confirmText="Save"
          webStyle={style}
          autoClear={false}
          imageType="image/png"
        />
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
            onPress={() => signatureRef.current?.readSignature()}
            color="#4CAF50"
            disabled={!isSigned}
          />
        </View>
      </View>

      {isSigned && (
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
