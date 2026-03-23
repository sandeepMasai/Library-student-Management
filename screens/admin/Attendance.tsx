import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useAppStore } from '../../store';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function AdminAttendance() {
  const fetchTodayAttendance = useAppStore((state) => state.fetchTodayAttendance);
  const fetchAttendanceByDate = useAppStore((state) => state.fetchAttendanceByDate);
  const users = useAppStore((state) => state.users);
  const attendances = useAppStore((state) => state.attendances);

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const totalCheckins = attendances.length;
  const currentlyInside = attendances.length;

  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  // Poll selected date list for near-live updates.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttendanceByDate(selectedDate);
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchAttendanceByDate, selectedDate]);

  const onApplyDateFilter = async () => {
    await fetchAttendanceByDate(selectedDate);
  };

  const renderAttendanceItem = ({ item }: { item: any }) => {
    const student = users.find(u => u.id === item.studentId);
    const name = student?.name || `Student ${item.studentId.slice(0, 4)}`;
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
    const checkInDate = new Date(item.date);
    const durationMin = Math.max(1, Math.floor((Date.now() - checkInDate.getTime()) / 60000));
    const durationText = durationMin >= 60 ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m` : `${durationMin}m`;

    return (
      <View style={styles.attCard}>
        <View style={styles.attHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'ST'}</Text>
          </View>
          <View style={styles.attInfo}>
            <Text style={styles.attName}>{name}</Text>
            <Text style={styles.attId}>ID: {student?.username || item.studentId.slice(0, 10)}</Text>
          </View>
        </View>

        <View style={styles.dataRow}>
          <View>
            <Text style={styles.dataLabel}>CHECK-IN</Text>
            <Text style={styles.dataValue}>{format(checkInDate, 'hh:mm a')}</Text>
          </View>
          <View>
            <Text style={styles.dataLabel}>DURATION</Text>
            <Text style={styles.dataValue}>{durationText}</Text>
          </View>
        </View>

        <View style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Check Out</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrSection}>
        <View style={styles.topBar}>
          <Text style={styles.qrTitle}>Today's Attendance</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>Active Now</Text>
          </View>
        </View>
        <Text style={styles.qrSubtitle}>Real-time tracking of library occupancy and student visits.</Text>

        <View style={styles.metrics}>
          <View style={styles.metricCard}>
            <View>
              <Text style={styles.metricLabel}>TOTAL CHECK-INS TODAY</Text>
              <Text style={styles.metricValue}>{totalCheckins}</Text>
            </View>
            <View style={styles.metricIconBlue}>
              <Ionicons name="walk-outline" size={20} color="#2563EB" />
            </View>
          </View>

          <View style={styles.metricCard}>
            <View>
              <Text style={styles.metricLabel}>CURRENTLY INSIDE</Text>
              <Text style={[styles.metricValue, { color: '#166534' }]}>{currentlyInside}</Text>
            </View>
            <View style={styles.metricIconGreen}>
              <Ionicons name="business-outline" size={20} color="#16A34A" />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.listSection}>
        <View style={styles.filterRow}>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.filterBtn} onPress={onApplyDateFilter}>
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.listTitle}>Live Occupancy</Text>
        <FlatList
          data={attendances}
          renderItem={renderAttendanceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No active attendance yet</Text>
            </View>
          }
        />

        <TouchableOpacity style={styles.quickBtn} onPress={onApplyDateFilter}>
          <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.quickBtnText}>Refresh Live</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  qrSection: {
    backgroundColor: '#ECEFF1',
    padding: 20,
    paddingTop: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  qrTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
  },
  liveBadge: {
    backgroundColor: '#86EFAC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveBadgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 14,
  },
  metrics: {
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  metricValue: {
    color: '#0F6FB6',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
  },
  metricIconBlue: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIconGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  filterBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  filterBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 80,
  },
  attCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0F6FB6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  attHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#0F6FB6',
    fontSize: 12,
    fontWeight: '800',
  },
  attInfo: {
    flex: 1,
  },
  attName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
  },
  attId: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dataLabel: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 0.8,
    fontWeight: '800',
    marginBottom: 3,
  },
  dataValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  checkoutBtn: {
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#0F6FB6',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
  quickBtn: {
    position: 'absolute',
    right: 20,
    bottom: 10,
    backgroundColor: '#0F6FB6',
    borderRadius: 999,
    height: 44,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F6FB6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  quickBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
