import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAppStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const users = useAppStore((state) => state.users);
  const fetchStudents = useAppStore((state) => state.fetchStudents);
  const deleteStudent = useAppStore((state) => state.deleteStudent);
  const toggleBlockStudent = useAppStore((state) => state.toggleBlockStudent);
  const navigation = useNavigation<any>();

  const students = users.filter((u) => u.role === 'student');
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile.includes(searchQuery) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Student', 'Are you sure you want to delete this student?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteStudent(id);
          if (!result.ok) {
            Alert.alert('Error', result.message || 'Failed to delete student');
          }
        }
      }
    ]);
  };

  const renderStudent = ({ item }: { item: any }) => {
    const daysRemaining = differenceInDays(new Date(item.expiryDate), new Date());
    const isExpired = daysRemaining < 0;
    const isExpanded = expandedStudentId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.8}
          onPress={() => setExpandedStudentId((prev) => (prev === item.id ? null : item.id))}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentUsername}>@{item.username}</Text>
          </View>
          <View style={styles.headerRight}>
            <Ionicons
              name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color="#6B7280"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: isExpired ? '#FEE2E2' : '#D1FAE5' }]}>
                <Text style={[styles.badgeText, { color: isExpired ? '#EF4444' : '#10B981' }]}>
                  {isExpired ? 'Expired' : 'Active'}
                </Text>
              </View>
              {item.isBlocked && (
                <View style={[styles.badge, { backgroundColor: '#F3F4F6', marginLeft: 4 }]}>
                  <Text style={[styles.badgeText, { color: '#4B5563' }]}>Blocked</Text>
                </View>
              )}
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.infoText}>Mobile: {item.mobile}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.infoText}>Join: {format(new Date(item.joinDate), 'MMM dd, yyyy')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-clear-outline" size={16} color="#6B7280" />
                <Text style={styles.infoText}>Expires: {format(new Date(item.expiryDate), 'MMM dd, yyyy')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={16} color="#6B7280" />
                <Text style={styles.infoText}>Fee: {item.feeStatus} (₹{item.feeAmount})</Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
                onPress={() => navigation.navigate('AdminStudentForm', { studentId: item.id })}
              >
                <Ionicons name="create-outline" size={20} color="#4F46E5" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: item.isBlocked ? '#ECFDF5' : '#FEF2F2' }]}
                onPress={async () => {
                  const result = await toggleBlockStudent(item.id);
                  if (!result.ok) {
                    Alert.alert('Error', result.message || 'Failed to update block status');
                  }
                }}
              >
                <Ionicons
                  name={item.isBlocked ? 'lock-open-outline' : 'lock-closed-outline'}
                  size={20}
                  color={item.isBlocked ? '#10B981' : '#EF4444'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or username..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AdminStudentForm')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  headerRight: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  studentUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  }
});
