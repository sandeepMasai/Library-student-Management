import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppStore, FeeStatus } from '../../store';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AdminStudentForm() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const studentId = route.params?.studentId;
  
  const users = useAppStore((state) => state.users);
  const addStudent = useAppStore((state) => state.addStudent);
  const updateStudent = useAppStore((state) => state.updateStudent);

  const isEditing = !!studentId;
  const existingStudent = isEditing ? users.find(u => u.id === studentId) : null;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    mobile: '',
    pin: '',
    feeAmount: '',
    feeStatus: 'Paid' as FeeStatus,
  });

  useEffect(() => {
    if (existingStudent) {
      setFormData({
        name: existingStudent.name,
        username: existingStudent.username,
        mobile: existingStudent.mobile,
        pin: existingStudent.pin,
        feeAmount: existingStudent.feeAmount.toString(),
        feeStatus: existingStudent.feeStatus,
      });
    }
  }, [existingStudent]);

  const handleSave = () => {
    if (!formData.name || !formData.username || !formData.mobile || !formData.pin || !formData.feeAmount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (isEditing) {
      updateStudent(studentId, {
        name: formData.name,
        username: formData.username,
        mobile: formData.mobile,
        pin: formData.pin,
        feeAmount: Number(formData.feeAmount),
        feeStatus: formData.feeStatus,
      });
    } else {
      addStudent({
        name: formData.name,
        username: formData.username,
        mobile: formData.mobile,
        pin: formData.pin,
        feeAmount: Number(formData.feeAmount),
        feeStatus: formData.feeStatus,
        isBlocked: false,
      });
    }
    
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="John Doe"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(text) => setFormData({...formData, username: text})}
            placeholder="johndoe"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={formData.mobile}
            onChangeText={(text) => setFormData({...formData, mobile: text})}
            placeholder="1234567890"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Login PIN</Text>
          <TextInput
            style={styles.input}
            value={formData.pin}
            onChangeText={(text) => setFormData({...formData, pin: text})}
            placeholder="1234"
            keyboardType="numeric"
            secureTextEntry={!isEditing}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fee Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={formData.feeAmount}
            onChangeText={(text) => setFormData({...formData, feeAmount: text})}
            placeholder="500"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fee Status</Text>
          <View style={styles.statusContainer}>
            {['Paid', 'Half Paid', 'Pending'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusBtn,
                  formData.feeStatus === status && styles.statusBtnActive
                ]}
                onPress={() => setFormData({...formData, feeStatus: status as FeeStatus})}
              >
                <Text style={[
                  styles.statusText,
                  formData.feeStatus === status && styles.statusTextActive
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{isEditing ? 'Update Student' : 'Add Student'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  statusText: {
    color: '#374151',
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#fff',
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
