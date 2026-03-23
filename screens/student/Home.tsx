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
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{currentUser.name.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser.name}</Text>
              <Text style={styles.profileId}>@{currentUser.username}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isExpired ? '#FEE2E2' : '#D1FAE5' }]}>
              <Text style={[styles.statusText, { color: isExpired ? '#EF4444' : '#10B981' }]}>
                {isExpired ? 'Expired' : 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Join Date</Text>
              <Text style={styles.detailValue}>{format(new Date(currentUser.joinDate), 'MMM dd, yyyy')}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Expiry Date</Text>
              <Text style={styles.detailValue}>{format(new Date(currentUser.expiryDate), 'MMM dd, yyyy')}</Text>
            </View>
          </View>

          <View style={[styles.alertBox, { backgroundColor: isExpired ? '#FEF2F2' : (daysRemaining <= 5 ? '#FFFBEB' : '#ECFDF5') }]}>
            <Ionicons 
              name={isExpired ? "alert-circle" : (daysRemaining <= 5 ? "warning" : "checkmark-circle")} 
              size={24} 
              color={isExpired ? "#EF4444" : (daysRemaining <= 5 ? "#D97706" : "#10B981")} 
            />
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertTitle, { color: isExpired ? "#991B1B" : (daysRemaining <= 5 ? "#92400E" : "#065F46") }]}>
                {isExpired ? 'Membership Expired' : `${daysRemaining} Days Remaining`}
              </Text>
              <Text style={[styles.alertDesc, { color: isExpired ? "#B91C1C" : (daysRemaining <= 5 ? "#B45309" : "#047857") }]}>
                {isExpired ? 'Please renew your membership to continue access.' : 'Your membership is active and valid.'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Fee Status</Text>
        <View style={styles.feeCard}>
          <View style={styles.feeHeader}>
            <Ionicons name="wallet" size={24} color="#10B981" />
            <Text style={styles.feeTitle}>Current Plan</Text>
          </View>
          <View style={styles.feeDetails}>
            <Text style={styles.feeAmount}>₹{currentUser.feeAmount}</Text>
            <View style={[styles.feeStatusBadge, { 
              backgroundColor: currentUser.feeStatus === 'Paid' ? '#D1FAE5' : (currentUser.feeStatus === 'Pending' ? '#FEE2E2' : '#FEF3C7')
            }]}>
              <Text style={[styles.feeStatusText, {
                color: currentUser.feeStatus === 'Paid' ? '#10B981' : (currentUser.feeStatus === 'Pending' ? '#EF4444' : '#D97706')
              }]}>{currentUser.feeStatus}</Text>
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileId: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  alertBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  alertTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  feeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  feeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  feeStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  feeStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});
