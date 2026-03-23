import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../../store';
import AttendanceCard, { AttendanceDayStatus } from '../../components/AttendanceCard';

type AttendanceApiItem = {
  date: string;
  status: 'present' | 'absent';
};

type CalendarCell = {
  key: string;
  day: number | null;
  status: AttendanceDayStatus;
  isToday: boolean;
};

function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } }).manifest2?.extra
      ?.expoGo?.debuggerHost;

  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:5000`;
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  return 'http://localhost:5000';
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function StudentCalendarScreen() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [attendance, setAttendance] = useState<AttendanceApiItem[]>([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const fetchAttendance = useCallback(async () => {
    if (!currentUser) return;
    const base = resolveApiUrl();
    try {
      const response = await fetch(
        `${base}/api/attendance/student/${currentUser.id}?year=${year}&month=${month}`
      );
      if (!response.ok) return;
      const data = (await response.json()) as AttendanceApiItem[];
      setAttendance(data);
    } catch {
      // keep existing state on network error
    }
  }, [currentUser, month, year]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useFocusEffect(
    useCallback(() => {
      fetchAttendance();
      const timer = setInterval(fetchAttendance, 5000);
      return () => clearInterval(timer);
    }, [fetchAttendance])
  );

  const presentSet = useMemo(() => new Set(attendance.map((a) => a.date)), [attendance]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const weekDay = firstDay.getDay(); // 0 Sunday

    const cells: CalendarCell[] = [];
    for (let i = 0; i < weekDay; i += 1) {
      cells.push({ key: `empty-${i}`, day: null, status: 'empty', isToday: false });
    }

    let presentCount = 0;
    let absentCount = 0;

    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = dateKey(year, month, day);
      const currentDate = new Date(year, month - 1, day);
      const isFuture = currentDate > new Date(today.getFullYear(), today.getMonth(), today.getDate());
      let status: AttendanceDayStatus;

      if (isFuture) {
        status = 'future';
      } else if (presentSet.has(key)) {
        status = 'present';
        presentCount += 1;
      } else {
        status = 'absent';
        absentCount += 1;
      }

      cells.push({
        key,
        day,
        status,
        isToday:
          day === today.getDate() &&
          month === today.getMonth() + 1 &&
          year === today.getFullYear(),
      });
    }

    return { cells, presentCount, absentCount };
  }, [attendance, month, presentSet, today, year]);

  if (!currentUser) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Calendar</Text>
      <Text style={styles.subTitle}>
        {today.toLocaleString('default', { month: 'long' })} {year}
      </Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>Present: {calendarCells.presentCount}</Text>
        <Text style={styles.summaryText}>Absent: {calendarCells.absentCount}</Text>
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendItem}>🟢 Present</Text>
        <Text style={styles.legendItem}>🔴 Absent</Text>
      </View>

      <View style={styles.weekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
          <Text key={w} style={styles.weekText}>{w}</Text>
        ))}
      </View>

      <FlatList
        data={calendarCells.cells}
        keyExtractor={(item) => item.key}
        numColumns={7}
        renderItem={({ item }) => (
          <AttendanceCard day={item.day} status={item.status} isToday={item.isToday} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subTitle: {
    marginTop: 4,
    marginBottom: 12,
    color: '#6B7280',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    fontSize: 13,
    color: '#4B5563',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  weekText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
});
