import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type AttendanceDayStatus = 'present' | 'absent' | 'future' | 'empty';

interface AttendanceCardProps {
  day: number | null;
  status: AttendanceDayStatus;
  isToday?: boolean;
}

export default function AttendanceCard({ day, status, isToday = false }: AttendanceCardProps) {
  if (status === 'empty') {
    return <View style={styles.emptyCell} />;
  }

  const isFuture = status === 'future';

  return (
    <View style={[styles.cell, isToday && styles.todayCell, isFuture && styles.futureCell]}>
      <Text style={[styles.dayText, isFuture && styles.futureText]}>{day}</Text>
      {status === 'present' && <Ionicons name="checkmark-circle" size={18} color="#16A34A" />}
      {status === 'absent' && <Ionicons name="close-circle" size={18} color="#DC2626" />}
      {status === 'future' && <Ionicons name="remove-circle-outline" size={18} color="#9CA3AF" />}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCell: {
    flex: 1,
    margin: 4,
    minHeight: 62,
  },
  cell: {
    flex: 1,
    margin: 4,
    minHeight: 62,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  todayCell: {
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  futureCell: {
    backgroundColor: '#F3F4F6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  futureText: {
    color: '#9CA3AF',
  },
});
