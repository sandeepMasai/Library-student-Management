import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useAppStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, format, isSameDay } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

export default function StudentHome() {
  const currentUser = useAppStore((state) => state.currentUser);
  const logout = useAppStore((state) => state.logout);
  const fetchTodayAttendance = useAppStore((state) => state.fetchTodayAttendance);
  const attendances = useAppStore((state) => state.attendances);
  const fetchNotifications = useAppStore((state) => state.fetchNotifications);
  const getStudentNotifications = useAppStore((state) => state.getStudentNotifications);
  const navigation = useNavigation<any>();
  const cardAnim = useRef(new Animated.Value(0)).current;

  if (!currentUser) return null;

  useEffect(() => {
    fetchTodayAttendance();
    fetchNotifications(currentUser.id);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [cardAnim, currentUser.id, fetchNotifications, fetchTodayAttendance]);

  const daysRemaining = differenceInDays(new Date(currentUser.expiryDate), new Date());
  const isExpired = daysRemaining < 0;
  const todayMarked = attendances.some(
    (a) => a.studentId === currentUser.id && isSameDay(new Date(a.date), new Date())
  );
  const notifications = getStudentNotifications(currentUser.id).slice(0, 2);

  const progressPercent = useMemo(() => {
    const join = new Date(currentUser.joinDate).getTime();
    const expiry = new Date(currentUser.expiryDate).getTime();
    const now = Date.now();
    if (expiry <= join) return 0;
    const total = expiry - join;
    const used = Math.max(0, Math.min(now - join, total));
    return Math.round((used / total) * 100);
  }, [currentUser.expiryDate, currentUser.joinDate]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topBrandRow}>
          <View style={styles.logoRow}>
            <Ionicons name="library-outline" size={18} color="#0F6FB6" />
            <Text style={styles.brandText}>LibTrack</Text>
          </View>
          <Ionicons name="notifications" size={18} color="#1F2937" />
        </View>
        <Text style={styles.greeting}>Welcome back, {currentUser.name.split(' ')[0]}</Text>
        <Text style={styles.subtitle}>Ready for some focused reading today?</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.mainStack,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.statusGrid}>
            <View style={styles.smallCard}>
              <View style={[styles.smallIcon, { backgroundColor: '#86EFAC' }]}>
                <Ionicons name="checkmark-circle" size={18} color="#166534" />
              </View>
              <Text style={styles.smallLabel}>STATUS</Text>
              <Text style={styles.smallTitle}>{todayMarked ? 'Checked In' : 'Not Checked In'}</Text>
              <Text style={styles.smallSub}>{todayMarked ? 'Active Session: Today' : 'Please scan QR to mark'}</Text>
            </View>

            <View style={styles.smallCard}>
              <View style={[styles.smallIcon, { backgroundColor: '#BFDBFE' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#1D4ED8" />
              </View>
              <Text style={styles.smallLabel}>MEMBERSHIP</Text>
              <Text style={styles.smallTitle}>{currentUser.feeStatus === 'Paid' ? 'Academic Pro' : 'Basic Plan'}</Text>
              <View style={styles.daysPill}>
                <Text style={styles.daysPillText}>{Math.max(0, daysRemaining)} Days Left</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.scanCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Scan Attendance')}
          >
            <View style={styles.scanIconWrap}>
              <Ionicons name="qr-code-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.scanTitle}>Scan to Check In/Out</Text>
            <Text style={styles.scanSub}>Tap here to activate library access</Text>
          </TouchableOpacity>

          <View style={styles.progressCard}>
            <View style={styles.progressHead}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Ionicons name="trending-up-outline" size={18} color="#6B7280" />
            </View>

            <View style={styles.progressRow}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>{progressPercent}%</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.progressLine}>Membership valid until {format(new Date(currentUser.expiryDate), 'MMM dd')}</Text>
                <Text style={styles.progressSub}>Join Date: {format(new Date(currentUser.joinDate), 'MMM dd, yyyy')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.notificationsWrap}>
            <View style={styles.notificationsHead}>
              <Text style={styles.notificationsTitle}>Recent Notifications</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                <Text style={styles.viewAll}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
              <View style={styles.notificationCard}>
                <Text style={styles.notificationMessage}>No recent notifications</Text>
              </View>
            ) : (
              notifications.map((item) => (
                <View key={item.id} style={styles.notificationCard}>
                  <View style={styles.notificationIcon}>
                    <Ionicons name="notifications-outline" size={16} color="#1D4ED8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
                  </View>
                  <Text style={styles.notificationTime}>{format(new Date(item.date), 'd MMM')}</Text>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  header: {
    padding: 20,
    paddingTop: 48,
    backgroundColor: '#ECEFF1',
  },
  topBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F6FB6',
  },
  greeting: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 21,
    color: '#4B5563',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    position: 'absolute',
    right: 24,
    top: 96,
  },
  content: {
    padding: 20,
    paddingTop: 8,
  },
  mainStack: {
    gap: 14,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  smallIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#6B7280',
    marginBottom: 8,
  },
  smallTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  smallSub: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  daysPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 999,
    marginTop: 4,
  },
  daysPillText: {
    color: '#B91C1C',
    fontSize: 10,
    fontWeight: '700',
  },
  scanCard: {
    backgroundColor: '#0E76C9',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#0E76C9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  scanIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scanTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  scanSub: {
    color: '#DBEAFE',
    fontSize: 13,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#0E76C9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  progressCircleText: {
    color: '#0E76C9',
    fontSize: 16,
    fontWeight: '800',
  },
  progressLine: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '800',
  },
  progressSub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  notificationsWrap: {
    marginBottom: 20,
  },
  notificationsHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F6FB6',
    letterSpacing: 0.6,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notificationTitle: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  notificationMessage: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 16,
    paddingRight: 6,
  },
  notificationTime: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
});
