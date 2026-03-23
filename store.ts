import { create } from 'zustand';
import { addDays, differenceInDays, isSameDay, format } from 'date-fns';

export type Role = 'admin' | 'student';
export type FeeStatus = 'Paid' | 'Half Paid' | 'Pending';

export interface User {
  id: string;
  role: Role;
  name: string;
  username: string;
  mobile: string;
  pin: string;
  joinDate: string;
  expiryDate: string;
  feeStatus: FeeStatus;
  feeAmount: number;
  isBlocked: boolean;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // ISO string
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  targetId?: string; // 'all' or studentId
}

interface AppState {
  currentUser: User | null;
  users: User[];
  attendances: Attendance[];
  notifications: Notification[];
  dailyQrToken: string | null;
  
  // Auth
  login: (usernameOrMobile: string, pin: string) => boolean;
  logout: () => void;
  
  // Admin - Students
  addStudent: (student: Omit<User, 'id' | 'role' | 'joinDate' | 'expiryDate'>) => void;
  updateStudent: (id: string, data: Partial<User>) => void;
  deleteStudent: (id: string) => void;
  toggleBlockStudent: (id: string) => void;
  
  // Admin - Attendance
  generateDailyQr: () => string;
  
  // Admin - Notifications
  sendNotification: (title: string, message: string, targetId?: string) => void;
  
  // Student - Attendance
  markAttendance: (token: string) => boolean;
  
  // Helpers
  getTodayAttendance: () => Attendance[];
  getStudentAttendance: (studentId: string) => Attendance[];
  getStudentNotifications: (studentId: string) => Notification[];
}

const initialAdmin: User = {
  id: 'admin-1',
  role: 'admin',
  name: 'Admin',
  username: 'admin',
  mobile: '0000000000',
  pin: 'admin123',
  joinDate: new Date().toISOString(),
  expiryDate: addDays(new Date(), 3650).toISOString(),
  feeStatus: 'Paid',
  feeAmount: 0,
  isBlocked: false,
};

const initialStudent: User = {
  id: 'student-1',
  role: 'student',
  name: 'John Doe',
  username: 'john',
  mobile: '1234567890',
  pin: '1234',
  joinDate: new Date().toISOString(),
  expiryDate: addDays(new Date(), 30).toISOString(),
  feeStatus: 'Paid',
  feeAmount: 500,
  isBlocked: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [initialAdmin, initialStudent],
  attendances: [],
  notifications: [
    {
      id: 'notif-1',
      title: 'Welcome!',
      message: 'Welcome to the Library Management System.',
      date: new Date().toISOString(),
      targetId: 'all',
    }
  ],
  dailyQrToken: null,

  login: (usernameOrMobile, pin) => {
    const { users } = get();
    const user = users.find(
      (u) => (u.username === usernameOrMobile || u.mobile === usernameOrMobile) && u.pin === pin
    );
    if (user && !user.isBlocked) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null }),

  addStudent: (studentData) => {
    const now = new Date();
    const newStudent: User = {
      ...studentData,
      id: `student-${Date.now()}`,
      role: 'student',
      joinDate: now.toISOString(),
      expiryDate: addDays(now, 30).toISOString(),
    };
    set((state) => ({ users: [...state.users, newStudent] }));
  },

  updateStudent: (id, data) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }));
  },

  deleteStudent: (id) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
  },

  toggleBlockStudent: (id) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, isBlocked: !u.isBlocked } : u)),
    }));
  },

  generateDailyQr: () => {
    const token = `LIB-ATT-${format(new Date(), 'yyyy-MM-dd')}-${Math.random().toString(36).substring(7)}`;
    set({ dailyQrToken: token });
    return token;
  },

  sendNotification: (title, message, targetId = 'all') => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: new Date().toISOString(),
      targetId,
    };
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
  },

  markAttendance: (token) => {
    const { currentUser, dailyQrToken, attendances } = get();
    if (!currentUser || currentUser.role !== 'student') return false;
    
    // In a real app we'd validate the token against the backend
    // Here we just check if it matches the generated one or starts with LIB-ATT
    if (token !== dailyQrToken && !token.startsWith('LIB-ATT')) return false;

    const today = new Date();
    const alreadyMarked = attendances.some(
      (a) => a.studentId === currentUser.id && isSameDay(new Date(a.date), today)
    );

    if (alreadyMarked) return true; // Already marked today

    const newAttendance: Attendance = {
      id: `att-${Date.now()}`,
      studentId: currentUser.id,
      date: today.toISOString(),
    };

    set((state) => ({ attendances: [...state.attendances, newAttendance] }));
    return true;
  },

  getTodayAttendance: () => {
    const { attendances } = get();
    const today = new Date();
    return attendances.filter((a) => isSameDay(new Date(a.date), today));
  },

  getStudentAttendance: (studentId) => {
    const { attendances } = get();
    return attendances.filter((a) => a.studentId === studentId);
  },

  getStudentNotifications: (studentId) => {
    const { notifications, users } = get();
    const student = users.find((u) => u.id === studentId);
    if (!student) return [];

    const studentNotifs = notifications.filter((n) => n.targetId === 'all' || n.targetId === studentId);
    
    // Auto-generate expiry reminders
    const daysRemaining = differenceInDays(new Date(student.expiryDate), new Date());
    if (daysRemaining <= 3 && daysRemaining >= 0) {
      studentNotifs.unshift({
        id: 'sys-reminder',
        title: 'Membership Expiring Soon',
        message: `Your library membership will expire in ${daysRemaining} days. Please renew soon.`,
        date: new Date().toISOString(),
        targetId: studentId,
      });
    } else if (daysRemaining < 0) {
      studentNotifs.unshift({
        id: 'sys-expired',
        title: 'Membership Expired',
        message: `Your library membership has expired. Please renew to continue access.`,
        date: new Date().toISOString(),
        targetId: studentId,
      });
    }

    return studentNotifs;
  },
}));
