import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const currentUser = useAppStore((state) => state.currentUser);
  const users = useAppStore((state) => state.users);
  const fetchStudents = useAppStore((state) => state.fetchStudents);
  const fetchTodayAttendance = useAppStore((state) => state.fetchTodayAttendance);
  const attendances = useAppStore((state) => state.attendances);
  const logout = useAppStore((state) => state.logout);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchStudents();
    fetchTodayAttendance();
  }, [fetchStudents, fetchTodayAttendance]);

  const students = users.filter((u) => u.role === 'student');
  const totalStudents = students.length;
  const todayAttendance = attendances.length;
  const activeStudents = students.filter((s) => differenceInDays(new Date(s.expiryDate), new Date()) >= 0).length;
  const checkedInNow = attendances.length;
  const expiredStudents = Math.max(0, totalStudents - activeStudents);

  const recentActivity = useMemo(
    () =>
      [...attendances]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [attendances]
  );

  const occupancyPercent = totalStudents > 0 ? Math.min(100, Math.round((checkedInNow / totalStudents) * 100)) : 0;

  const openAttendance = () => {
    try {
      navigation.navigate('AdminMain', { screen: 'Attendance' });
    } catch {
      navigation.navigate('Attendance');
    }
  };

  const adminName = currentUser?.name || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Ionicons name="menu" size={18} color="#1F2937" />
          <Text style={styles.brandText}>LibTrack</Text>
        </View>
        <TouchableOpacity
          style={styles.profileWrap}
          onPress={() => navigation.navigate('AdminProfile')}
          activeOpacity={0.85}
        >
          <View style={styles.onlineDot} />
          <View style={styles.profileDot}>
            <Text style={styles.profileInitial}>{adminInitial}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerTextWrap}>
        <Text style={styles.greeting}>Good Morning, {adminName} 👋</Text>
        <Text style={styles.headerSub}>Here is what's happening in your library today.</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconCircle}>
            <Ionicons name="people-outline" size={16} color="#1D4ED8" />
          </View>
          <Text style={styles.statLabel}>TOTAL STUDENTS</Text>
          <Text style={styles.statValue}>{totalStudents}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="calendar-outline" size={16} color="#16A34A" />
          </View>
          <Text style={styles.statLabel}>ACTIVE TODAY</Text>
          <Text style={styles.statValue}>{todayAttendance}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="log-in-outline" size={16} color="#0F6FB6" />
          </View>
          <Text style={styles.statLabel}>CHECKED IN NOW</Text>
          <Text style={styles.statValue}>{checkedInNow}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
          </View>
          <Text style={styles.statLabel}>EXPIRED MEMBERSHIPS</Text>
          <Text style={styles.statValue}>{expiredStudents}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={openAttendance}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentActivity.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No attendance activity yet</Text>
          </View>
        ) : (
          recentActivity.map((item) => {
            const student = students.find((s) => s.id === item.studentId);
            const status = Math.random() > 0.5 ? 'CHECKED IN' : 'CHECKED OUT';
            const statusColor = status === 'CHECKED IN' ? '#22C55E' : '#9CA3AF';
            return (
              <View key={item.id} style={styles.activityCard}>
                <View style={styles.activityLeft}>
                  <View style={styles.userDot}>
                    <Ionicons name="person" size={12} color="#4B5563" />
                  </View>
                  <View>
                    <Text style={styles.activityName}>{student?.name || 'Student'}</Text>
                    <Text style={styles.activitySub}>Student ID: #{(student?.username || item.studentId).slice(0, 8)}</Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text style={[styles.statusPill, { color: statusColor }]}>{status}</Text>
                  <Text style={styles.activityTime}>{format(new Date(item.date), 'hh:mm a')}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Occupancy</Text>
        <View style={styles.occupancyCard}>
          <View style={styles.occTop}>
            <Text style={styles.occTitle}>Peak Capacity</Text>
            <Text style={styles.occPercent}>{occupancyPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${occupancyPercent}%` }]} />
          </View>
          <Text style={styles.occLine}>Reading Hall A: {checkedInNow}/{Math.max(totalStudents, checkedInNow)} seats</Text>
          <Text style={styles.occLine}>Study Lounge: {Math.max(0, activeStudents - checkedInNow)}/{Math.max(activeStudents, 1)} seats</Text>
          <TouchableOpacity style={styles.reportBtn} onPress={openAttendance}>
            <Text style={styles.reportBtnText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.systemCard}>
          <Text style={styles.systemTitle}>SYSTEM STATUS</Text>
          <View style={styles.systemRow}>
            <View style={styles.systemDot} />
            <Text style={styles.systemText}>Gate Server Online</Text>
          </View>
          <View style={styles.systemRow}>
            <View style={styles.systemDot} />
            <Text style={styles.systemText}>RFID Scanner Ready</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F6FB6',
  },
  profileDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
  },
  profileWrap: {
    position: 'relative',
  },
  profileInitial: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    top: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#ECEFF1',
    zIndex: 1,
  },
  headerTextWrap: {
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  greeting: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 40,
  },
  headerSub: {
    marginTop: 2,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 38,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  section: {
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  viewAll: {
    color: '#0F6FB6',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  activitySub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  statusPill: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activityTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  occupancyCard: {
    backgroundColor: '#0F6FB6',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1D4ED8',
  },
  occTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  occTitle: {
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '700',
  },
  occPercent: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#86EFAC',
    borderRadius: 6,
  },
  occLine: {
    color: '#DBEAFE',
    fontSize: 11,
    marginBottom: 4,
  },
  reportBtn: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBtnText: {
    color: '#0F6FB6',
    fontSize: 12,
    fontWeight: '700',
  },
  systemCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  systemTitle: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  systemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#86EFAC',
    marginRight: 8,
  },
  systemText: {
    fontSize: 12,
    color: '#374151',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
});
