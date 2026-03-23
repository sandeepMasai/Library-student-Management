import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, format } from 'date-fns';

export default function StudentHome() {
  const currentUser = useAppStore((state) => state.currentUser);
  const logout = useAppStore((state) => state.logout);

  if (!currentUser) return null;

  const daysRemaining = differenceInDays(new Date(currentUser.expiryDate), new Date());
  const isExpired = daysRemaining < 0;
  const feeBg =
    currentUser.feeStatus === 'Paid' ? '#D1FAE5' : currentUser.feeStatus === 'Pending' ? '#FEE2E2' : '#FEF3C7';
  const feeText =
    currentUser.feeStatus === 'Paid' ? '#10B981' : currentUser.feeStatus === 'Pending' ? '#EF4444' : '#D97706';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {currentUser.name}</Text>
          <Text style={styles.subtitle}>Student Dashboard</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          {/* Blue top banner like your screenshot */}
          <View style={styles.banner}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{currentUser.name.charAt(0)}</Text>
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerName}>{currentUser.name}</Text>
              <Text style={styles.bannerSub}>Student Profile</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={22} color="#60A5FA" />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Join Date</Text>
                <Text style={styles.rowValue}>{format(new Date(currentUser.joinDate), 'MMM dd, yyyy')}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={22} color="#60A5FA" />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Expiry Date</Text>
                <Text style={styles.rowValue}>{format(new Date(currentUser.expiryDate), 'MMM dd, yyyy')}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Ionicons
                name={isExpired ? 'alert-circle' : 'hourglass-outline'}
                size={22}
                color={isExpired ? '#EF4444' : '#10B981'}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Remaining Days</Text>
                <Text style={[styles.remainingValue, { color: isExpired ? '#EF4444' : '#10B981' }]}>
                  {Math.max(0, daysRemaining)} Days
                </Text>
              </View>
            </View>

            <View style={styles.feeBlock}>
              <Text style={styles.feeLabel}>Fee Status</Text>
              <View style={[styles.feePill, { backgroundColor: feeBg }]}>
                <Text style={[styles.feePillText, { color: feeText }]}>{currentUser.feeStatus}</Text>
              </View>
              <Text style={styles.feeAmountText}>₹{currentUser.feeAmount}</Text>
            </View>
          </View>
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
    padding: 24,
    backgroundColor: '#10B981',
    paddingTop: 48,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  banner: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerText: {
    marginLeft: 16,
    flex: 1,
  },
  bannerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  cardBody: {
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  remainingValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  feeBlock: {
    marginTop: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
    marginBottom: 10,
  },
  feePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  feePillText: {
    fontSize: 16,
    fontWeight: '800',
  },
  feeAmountText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
});
