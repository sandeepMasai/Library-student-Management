import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useAppStore } from '../../store';
import QRCode from 'react-native-qrcode-svg';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function AdminAttendance() {
  const dailyQrToken = useAppStore((state) => state.dailyQrToken);
  const generateDailyQr = useAppStore((state) => state.generateDailyQr);
  const getTodayAttendance = useAppStore((state) => state.getTodayAttendance);
  const users = useAppStore((state) => state.users);

  const [todayAtt, setTodayAtt] = useState(getTodayAttendance());

  useEffect(() => {
    if (!dailyQrToken) {
      generateDailyQr();
    }
  }, []);

  // Poll for updates (in a real app this would be real-time via websockets)
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayAtt(getTodayAttendance());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderAttendanceItem = ({ item }: { item: any }) => {
    const student = users.find(u => u.id === item.studentId);
    if (!student) return null;

    return (
      <View style={styles.attCard}>
        <View style={styles.attInfo}>
          <Text style={styles.attName}>{student.name}</Text>
          <Text style={styles.attTime}>{format(new Date(item.date), 'hh:mm a')}</Text>
        </View>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>Today's Attendance QR</Text>
        <Text style={styles.qrSubtitle}>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</Text>
        
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

        <TouchableOpacity style={styles.refreshBtn} onPress={() => generateDailyQr()}>
          <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.refreshBtnText}>Refresh QR Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Present Today ({todayAtt.length})</Text>
        <FlatList
          data={todayAtt}
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
  refreshBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  listSection: {
    flex: 1,
    padding: 20,
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
