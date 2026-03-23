import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const users = useAppStore((state) => state.users);
  const fetchStudents = useAppStore((state) => state.fetchStudents);
  const fetchTodayAttendance = useAppStore((state) => state.fetchTodayAttendance);
  const getTodayAttendance = useAppStore((state) => state.getTodayAttendance);
  const logout = useAppStore((state) => state.logout);
  const navigation = useNavigation<any>();

  const openAddStudent = () => {
    try {
      // Primary path: stack route
      navigation.navigate('AdminStudentForm');
    } catch {
      // Fallback for nested navigation state issues
      const parentNav = navigation.getParent();
      parentNav?.navigate('AdminStudentForm');
    }
  };

  const openAttendance = () => {
    try {
      // Explicitly target tab screen under AdminMain.
      navigation.navigate('AdminMain', { screen: 'Attendance' });
    } catch {
      navigation.navigate('Attendance');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTodayAttendance();
  }, [fetchStudents, fetchTodayAttendance]);

  const students = users.filter((u) => u.role === 'student');
  const totalStudents = students.length;

  const todayAttendance = getTodayAttendance().length;

  const activeStudents = students.filter((s) => differenceInDays(new Date(s.expiryDate), new Date()) >= 0).length;
  const expiredStudents = totalStudents - activeStudents;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, Admin!</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
          <Ionicons name="people" size={32} color="#4F46E5" />
          <Text style={styles.statValue}>{totalStudents}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
          <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          <Text style={styles.statValue}>{todayAttendance}</Text>
          <Text style={styles.statLabel}>Today's Attendance</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="time" size={32} color="#D97706" />
          <Text style={styles.statValue}>{activeStudents}</Text>
          <Text style={styles.statLabel}>Active Members</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
          <Ionicons name="alert-circle" size={32} color="#EF4444" />
          <Text style={styles.statValue}>{expiredStudents}</Text>
          <Text style={styles.statLabel}>Expired Members</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={openAddStudent}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4F46E5' }]}>
              <Ionicons name="person-add" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Add Student</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={openAttendance}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="qr-code" size={24} color="#fff" />
            </View>
            <Text style={styles.actionText}>Generate QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  logoutBtn: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  }
});
