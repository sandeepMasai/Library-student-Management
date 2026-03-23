import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../../store';

export default function AdminProfile() {
  const currentUser = useAppStore((state) => state.currentUser);
  const fetchAdminProfile = useAppStore((state) => state.fetchAdminProfile);
  const updateAdminProfile = useAppStore((state) => state.updateAdminProfile);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setName(currentUser.name || '');
    setUsername(currentUser.username || '');
    setMobile(currentUser.mobile || '');
    setEmail(currentUser.email || '');
    setBio(currentUser.bio || '');
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const onSave = async () => {
    if (!name.trim() || !username.trim() || !mobile.trim()) {
      Alert.alert('Error', 'Name, username and mobile are required');
      return;
    }
    const result = await updateAdminProfile({
      name: name.trim(),
      username: username.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      bio: bio.trim(),
    });
    if (!result.ok) {
      Alert.alert('Error', result.message || 'Failed to save profile');
      return;
    }
    Alert.alert('Success', 'Admin profile saved successfully');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Admin Profile</Text>
        <Text style={styles.subtitle}>Create and manage your admin profile details.</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Admin Name" />

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

        <Text style={styles.label}>Mobile</Text>
        <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="About admin..."
        />

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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
  },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    color: '#111827',
  },
  bioInput: {
    height: 88,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  saveBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
