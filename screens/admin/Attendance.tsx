import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useAppStore } from '../../store';
import QRCode from 'react-native-qrcode-svg';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function AdminAttendance() {
  const dailyQrToken = useAppStore((state) => state.dailyQrToken);
  const generateDailyQr = useAppStore((state) => state.generateDailyQr);
  const fetchTodayAttendance = useAppStore((state) => state.fetchTodayAttendance);
  const fetchAttendanceByDate = useAppStore((state) => state.fetchAttendanceByDate);
  const users = useAppStore((state) => state.users);
  const attendances = useAppStore((state) => state.attendances);

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [qrGeneratedAt, setQrGeneratedAt] = useState<string | null>(null);

  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const qrMonthKey = qrGeneratedAt ? format(new Date(qrGeneratedAt), 'yyyy-MM') : null;
  const isQrGeneratedThisMonth = Boolean(qrMonthKey && qrMonthKey === currentMonthKey);

  useEffect(() => {
    const init = async () => {
      const qrInfo = await generateDailyQr();
      if (qrInfo?.generatedAt) {
        setQrGeneratedAt(qrInfo.generatedAt);
      }
      await fetchTodayAttendance();
    };
    init();
  }, [dailyQrToken, fetchTodayAttendance, generateDailyQr]);

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

    return (
      <View style={styles.attCard}>
        <View style={styles.attInfo}>
          <Text style={styles.attName}>{student?.name || `Student (${item.studentId.slice(0, 6)})`}</Text>
          <Text style={styles.attTime}>{format(new Date(item.date), 'hh:mm a')}</Text>
        </View>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>Attendance QR (30 Days)</Text>
        <Text style={styles.qrSubtitle}>
          Valid for 30 days - all students use same QR
        </Text>

        <View style={styles.qrContainer}>
          {dailyQrToken ? (
            <QRCode
              value={dailyQrToken}
              size={200}
              color="black"
              backgroundColor="white"
            />
          ) : (
            <Text>Generating...</Text>
          )}
        </View>

        {isQrGeneratedThisMonth ? (
          <View style={[styles.refreshBtn, styles.refreshBtnDisabled]}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.refreshBtnText}>QR already generated this month</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={async () => {
              const qrInfo = await generateDailyQr();
              if (qrInfo?.generatedAt) {
                setQrGeneratedAt(qrInfo.generatedAt);
              }
            }}
          >
            <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.refreshBtnText}>Generate This Month QR</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.listTitle}>Present Students ({attendances.length})</Text>
        <FlatList
          data={attendances}
          renderItem={renderAttendanceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No attendance marked yet</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  qrSection: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  refreshBtnDisabled: {
    backgroundColor: '#6B7280',
  },
  refreshBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  listSection: {
    flex: 1,
    padding: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  attCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  attInfo: {
    flex: 1,
  },
  attName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  attTime: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  }
});
