import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppStore, FeeStatus } from '../../store';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import { differenceInDays, format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function AdminStudentForm() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const studentId = route.params?.studentId;

  const users = useAppStore((state) => state.users);
  const fetchStudents = useAppStore((state) => state.fetchStudents);
  const addStudent = useAppStore((state) => state.addStudent);
  const updateStudent = useAppStore((state) => state.updateStudent);

  const isEditing = !!studentId;
  const existingStudent = isEditing ? users.find(u => u.id === studentId) : null;

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    mobile: '',
    pin: '',
    joinDate: new Date().toISOString().slice(0, 10),
    feeAmount: '',
    feeStatus: 'Paid' as FeeStatus,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!isEditing);
  const [activities, setActivities] = useState<Array<{ id: string; date: string; status: string }>>([]);
  const daysRemaining = existingStudent
    ? Math.max(0, differenceInDays(new Date(existingStudent.expiryDate), new Date()))
    : 30;

  useEffect(() => {
    if (existingStudent) {
      setFormData({
        name: existingStudent.name,
        username: existingStudent.username,
        mobile: existingStudent.mobile,
        pin: existingStudent.pin,
        joinDate: existingStudent.joinDate.slice(0, 10),
        feeAmount: existingStudent.feeAmount.toString(),
        feeStatus: existingStudent.feeStatus,
      });
    }
  }, [existingStudent]);

  useEffect(() => {
    setIsEditMode(!isEditing);
  }, [isEditing, studentId]);

  useEffect(() => {
    const resolveApiUrl = () => {
      if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
      const hostUri =
        Constants.expoConfig?.hostUri ||
        (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } }).manifest2?.extra
          ?.expoGo?.debuggerHost;
      const host = hostUri?.split(':')[0];
      if (host) return `http://${host}:5000`;
      if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
      return 'http://localhost:5000';
    };

    const loadActivity = async () => {
      if (!studentId) return;
      try {
        const response = await fetch(`${resolveApiUrl()}/api/attendance/student-logs/${studentId}?limit=12`);
        if (!response.ok) return;
        const data = (await response.json()) as Array<{ id: string; date: string; status: string }>;
        setActivities(data);
      } catch {
        // ignore and keep empty activity
      }
    };

    loadActivity();
  }, [studentId]);

  const handleSave = async () => {
    if (!formData.name || !formData.username || !formData.mobile || !formData.pin || !formData.feeAmount || !formData.joinDate) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const parsedJoinDate = new Date(formData.joinDate);
    if (Number.isNaN(parsedJoinDate.getTime())) {
      Alert.alert('Error', 'Joining date is invalid. Use YYYY-MM-DD');
      return;
    }

    const payload = {
      name: formData.name,
      username: formData.username,
      mobile: formData.mobile,
      pin: formData.pin,
      joinDate: parsedJoinDate.toISOString(),
      feeAmount: Number(formData.feeAmount),
      feeStatus: formData.feeStatus,
    };

    let result: { ok: boolean; message?: string };
    if (isEditing) {
      result = await updateStudent(studentId, payload);
    } else {
      result = await addStudent({
        ...payload,
        isBlocked: false,
      });
    }

    if (!result.ok) {
      Alert.alert('Error', result.message || 'Failed to save student');
      return;
    }

    await fetchStudents();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isEditing && existingStudent && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{existingStudent.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>{existingStudent.isBlocked ? 'BLOCKED' : 'ACTIVE'}</Text>
                </View>
              </View>
              <Text style={styles.heroName}>{existingStudent.name}</Text>
              <Text style={styles.heroMobile}>{existingStudent.mobile}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="school-outline" size={18} color="#0F6FB6" />
                <Text style={styles.infoCardTitle}>MEMBERSHIP</Text>
              </View>
              <Text style={styles.planTitle}>{existingStudent.feeStatus === 'Paid' ? 'Premium Study Plan' : 'Standard Plan'}</Text>
              <Text style={styles.expiryText}>Expires {format(new Date(existingStudent.expiryDate), 'MMM dd, yyyy')}</Text>
              <View style={styles.remainingRow}>
                <Text style={styles.remainingNumber}>{daysRemaining}</Text>
                <Text style={styles.remainingLabel}>days remaining</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(8, (daysRemaining / 30) * 100))}%` }]} />
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Ionicons name="person-outline" size={18} color="#16A34A" />
                <Text style={styles.infoCardTitle}>TODAY'S STATUS</Text>
              </View>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[styles.statusValue, { color: existingStudent.isBlocked ? '#EF4444' : '#16A34A' }]}>
                {existingStudent.isBlocked ? 'Blocked' : 'Checked In'}
              </Text>
              <View style={styles.timeRow}>
                <View style={styles.timeBox}>
                  <Text style={styles.timeLabel}>IN</Text>
                  <Text style={styles.timeValue}>{format(new Date(existingStudent.joinDate), 'hh:mm a')}</Text>
                </View>
                <View style={styles.timeBox}>
                  <Text style={styles.timeLabel}>OUT</Text>
                  <Text style={styles.timeValue}>--:--</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Activity History</Text>
                <Text style={styles.historyLink}>See All</Text>
              </View>
              {activities.length === 0 ? (
                <Text style={styles.emptyHistory}>No attendance activity yet</Text>
              ) : (
                activities.map((activity) => (
                  <View key={activity.id} style={styles.historyRow}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="calendar-outline" size={14} color="#4B5563" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDate}>{format(new Date(activity.date), 'MMM dd, yyyy')}</Text>
                      <Text style={styles.historyDuration}>Check-in: {format(new Date(activity.date), 'hh:mm a')}</Text>
                    </View>
                    <Text style={styles.historyStatus}>{String(activity.status || 'completed').toUpperCase()}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {isEditing && !isEditMode ? (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.startEditBtn} onPress={() => setIsEditMode(true)}>
              <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.startEditBtnText}>Edit Student Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{isEditing ? 'Edit Student Details' : 'Add New Student'}</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="John Doe"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                placeholder="johndoe"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={formData.mobile}
                onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                placeholder="1234567890"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Login PIN</Text>
              <TextInput
                style={styles.input}
                value={formData.pin}
                onChangeText={(text) => setFormData({ ...formData, pin: text })}
                placeholder="1234"
                keyboardType="numeric"
                secureTextEntry={!isEditing}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Joining Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color="#4B5563" />
                <Text style={styles.dateText}>{formData.joinDate}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.joinDate)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_event, selectedDate) => {
                    if (Platform.OS !== 'ios') setShowDatePicker(false);
                    if (selectedDate) {
                      setFormData({ ...formData, joinDate: format(selectedDate, 'yyyy-MM-dd') });
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fee Amount (₹)</Text>
              <TextInput
                style={styles.input}
                value={formData.feeAmount}
                onChangeText={(text) => setFormData({ ...formData, feeAmount: text })}
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
                    onPress={() => setFormData({ ...formData, feeStatus: status as FeeStatus })}
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

            <View style={styles.editActions}>
              {isEditing && (
                <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setIsEditMode(false)}>
                  <Text style={styles.cancelEditBtnText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1, marginTop: 0 }]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>{isEditing ? 'Update Student' : 'Add Student'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  heroTop: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 20,
    backgroundColor: '#D1E8D5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#3A5A40',
  },
  activeBadge: {
    marginTop: -10,
    backgroundColor: '#86EFAC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activeBadgeText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroName: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 34,
    color: '#1F2937',
    fontWeight: '800',
    lineHeight: 38,
  },
  heroMobile: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 24,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCardTitle: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    flex: 1,
    textAlign: 'right',
  },
  planTitle: {
    marginTop: 10,
    color: '#0F6FB6',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 32,
  },
  expiryText: {
    marginTop: 3,
    color: '#6B7280',
    fontSize: 23,
  },
  remainingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  remainingNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 40,
  },
  remainingLabel: {
    color: '#4B5563',
    fontSize: 28,
    lineHeight: 32,
  },
  progressTrack: {
    marginTop: 10,
    height: 7,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0F6FB6',
    borderRadius: 8,
  },
  statusLabel: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 25,
  },
  statusValue: {
    fontWeight: '800',
    fontSize: 33,
    marginTop: 2,
  },
  timeRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  timeBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
  },
  timeLabel: {
    color: '#6B7280',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.7,
  },
  timeValue: {
    marginTop: 3,
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '800',
  },
  historyLink: {
    fontSize: 12,
    color: '#0F6FB6',
    fontWeight: '700',
  },
  emptyHistory: {
    color: '#6B7280',
    fontSize: 13,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  historyIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  historyDate: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '700',
  },
  historyDuration: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  historyStatus: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTitle: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
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
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
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
  },
  editActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 10,
  },
  startEditBtn: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  startEditBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelEditBtn: {
    width: 110,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditBtnText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
  },
});
