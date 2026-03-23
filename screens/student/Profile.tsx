import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAppStore } from '../../store';

export default function StudentProfile() {
  const currentUser = useAppStore((state) => state.currentUser);
  const fetchStudentProfile = useAppStore((state) => state.fetchStudentProfile);
  const updateStudentProfile = useAppStore((state) => state.updateStudentProfile);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') return;
    setName(currentUser.name);
    setMobile(currentUser.mobile);
    setUsername(currentUser.username);
    setPin(currentUser.pin);
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'student') return null;

  const onSave = async () => {
    if (!name.trim() || !mobile.trim() || !username.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const result = await updateStudentProfile({
      name: name.trim(),
      mobile: mobile.trim(),
      username: username.trim(),
      pin: pin.trim(),
    });
    if (!result.ok) {
      Alert.alert('Error', result.message || 'Failed to update profile');
      return;
    }
    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{currentUser.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.username}>@{currentUser.username}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Joined: {format(new Date(currentUser.joinDate), 'MMM dd, yyyy')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="hourglass-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>Expires: {format(new Date(currentUser.expiryDate), 'MMM dd, yyyy')}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

        <Text style={styles.label}>Mobile</Text>
        <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />

        <Text style={styles.label}>PIN</Text>
        <TextInput style={styles.input} value={pin} onChangeText={setPin} secureTextEntry />

        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#1E40AF',
    fontSize: 24,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  username: {
    marginTop: 2,
    color: '#6B7280',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  saveBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0F6FB6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
