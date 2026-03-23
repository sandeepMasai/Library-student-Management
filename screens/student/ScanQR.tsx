import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useAppStore } from '../../store';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function StudentScanQR() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const markAttendance = useAppStore((state) => state.markAttendance);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (isSubmitting || scanned) return;
    setScanned(true);
    setIsSubmitting(true);

    const result = await markAttendance(data);

    if (result.ok && !result.alreadyMarked) {
      Alert.alert('Success', result.message || 'Attendance Marked', [
        {
          text: 'OK', onPress: () => {
            setScanned(false);
            navigation.navigate('Home');
          }
        }
      ]);
    } else if (result.ok && result.alreadyMarked) {
      Alert.alert('Already Marked', result.message || 'आज की attendance पहले से लग चुकी है', [
        {
          text: 'OK', onPress: () => {
            setScanned(false);
            navigation.navigate('Home');
          }
        }
      ]);
    } else {
      Alert.alert('Error', result.message || 'Invalid QR Code.', [
        { text: 'Try Again', onPress: () => setScanned(false) }
      ]);
    }
    setIsSubmitting(false);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mark Attendance</Text>
        <Text style={styles.subtitle}>Scan attendance QR (allowed 7:00 AM - 11:59 PM)</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => !isSubmitting && setScanned(false)}>
          <Ionicons name="scan" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.rescanBtnText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 8,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  rescanBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
  },
  rescanBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
