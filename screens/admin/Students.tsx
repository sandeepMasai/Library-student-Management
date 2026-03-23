import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useAppStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'member'>('all');
  const users = useAppStore((state) => state.users);
  const fetchStudents = useAppStore((state) => state.fetchStudents);
  const navigation = useNavigation<any>();

  const students = users.filter((u) => u.role === 'student');
  const filteredStudents = students
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.mobile.includes(searchQuery) || s.username.toLowerCase().includes(q);
    })
    .filter((s) => {
      if (filter === 'all') return true;
      const daysRemaining = differenceInDays(new Date(s.expiryDate), new Date());
      if (filter === 'active') return daysRemaining >= 0 && !s.isBlocked;
      if (filter === 'inactive') return s.isBlocked || daysRemaining < 0;
      if (filter === 'member') return s.feeStatus === 'Paid' || s.feeStatus === 'Half Paid';
      return true;
    });

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const renderStudent = ({ item }: { item: any }) => {
    const daysRemaining = differenceInDays(new Date(item.expiryDate), new Date());
    const isExpired = daysRemaining < 0;
    const checkedIn = daysRemaining >= 0 && !item.isBlocked;
    const initials = item.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join('');

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AdminStudentForm', { studentId: item.id })}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'ST'}</Text>
          </View>
          <View style={styles.headerLeft}>
            <Text style={styles.studentName}>{item.name}</Text>
            <View style={styles.mobileRow}>
              <Ionicons name="call-outline" size={12} color="#4B5563" />
              <Text style={styles.studentUsername}>+{item.mobile}</Text>
            </View>
          </View>
          <View style={styles.statusCol}>
            <View style={[styles.statusPill, { backgroundColor: isExpired ? '#FEE2E2' : '#86EFAC' }]}>
              <Text style={[styles.statusPillText, { color: isExpired ? '#DC2626' : '#166534' }]}>
                {isExpired ? 'EXPIRED' : 'ACTIVE'}
              </Text>
            </View>
            {checkedIn && (
              <View style={[styles.statusPill, { backgroundColor: '#DBEAFE', marginTop: 6 }]}>
                <Text style={[styles.statusPillText, { color: '#1D4ED8' }]}>CHECKED IN</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Ionicons name="menu" size={18} color="#1F2937" />
          <Text style={styles.brandText}>LibTrack</Text>
        </View>
        <View style={styles.profileDot}>
          <Ionicons name="person" size={14} color="#1F2937" />
        </View>
      </View>

      <View style={styles.headerText}>
        <Text style={styles.title}>Students</Text>
        <Text style={styles.subtitle}>Manage member records and attendance status.</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or student ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, filter === 'all' && styles.filterChipActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>All Students</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filter === 'active' && styles.filterChipActive]} onPress={() => setFilter('active')}>
          <Text style={[styles.filterChipText, filter === 'active' && styles.filterChipTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filter === 'inactive' && styles.filterChipActive]} onPress={() => setFilter('inactive')}>
          <Text style={[styles.filterChipText, filter === 'inactive' && styles.filterChipTextActive]}>Inactive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filter === 'member' && styles.filterChipActive]} onPress={() => setFilter('member')}>
          <Text style={[styles.filterChipText, filter === 'member' && styles.filterChipTextActive]}>Members</Text>
        </TouchableOpacity>
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
    backgroundColor: '#ECEFF1',
    paddingTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F6FB6',
  },
  profileDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 46,
  },
  subtitle: {
    marginTop: 4,
    color: '#4B5563',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    margin: 16,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
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
    paddingTop: 10,
    paddingBottom: 80,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: '#0F6FB6',
  },
  filterChipText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '800',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  mobileRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  studentUsername: {
    marginLeft: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
