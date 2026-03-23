import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function StudentNotifications() {
  const currentUser = useAppStore((state) => state.currentUser);
  const getStudentNotifications = useAppStore((state) => state.getStudentNotifications);

  if (!currentUser) return null;

  const notifications = getStudentNotifications(currentUser.id);

  const renderNotif = ({ item }: { item: any }) => {
    const isSystem = item.id.startsWith('sys-');
    
    return (
      <View style={[styles.card, isSystem && styles.systemCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, isSystem && styles.systemIconContainer]}>
            <Ionicons 
              name={isSystem ? "warning" : "notifications"} 
              size={20} 
              color={isSystem ? "#D97706" : "#10B981"} 
            />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDate}>{format(new Date(item.date), 'MMM dd, hh:mm a')}</Text>
          </View>
        </View>
        <Text style={styles.cardMessage}>{item.message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotif}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContainer: {
    padding: 20,
  },
  card: {
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
  systemCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  systemIconContainer: {
    backgroundColor: '#FEF3C7',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cardMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  }
});
