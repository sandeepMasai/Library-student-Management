import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from './store';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import AdminDashboard from './screens/admin/Dashboard';
import AdminStudents from './screens/admin/Students';
import AdminStudentForm from './screens/admin/StudentForm';
import AdminAttendance from './screens/admin/Attendance';
import AdminNotifications from './screens/admin/Notifications';
import StudentHome from './screens/student/Home';
import StudentScanQR from './screens/student/ScanQR';
import StudentNotifications from './screens/student/Notifications';
import StudentCalendarScreen from './screens/student/CalendarScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Students') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Attendance') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: { backgroundColor: '#4F46E5' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Students" component={AdminStudents} />
      <Tab.Screen name="Attendance" component={AdminAttendance} />
      <Tab.Screen name="Notifications" component={AdminNotifications} />
    </Tab.Navigator>
  );
}

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Scan Attendance') iconName = focused ? 'qr-code' : 'qr-code-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: { backgroundColor: '#10B981' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Home" component={StudentHome} />
      <Tab.Screen name="Scan Attendance" component={StudentScanQR} />
      <Tab.Screen name="Calendar" component={StudentCalendarScreen} />
      <Tab.Screen name="Notifications" component={StudentNotifications} />
    </Tab.Navigator>
  );
}

export default function App() {
  const currentUser = useAppStore((state) => state.currentUser);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : currentUser.role === 'admin' ? (
          <>
            <Stack.Screen name="AdminMain" component={AdminTabs} />
            <Stack.Screen
              name="AdminStudentForm"
              component={AdminStudentForm}
              options={{
                headerShown: true,
                title: 'Student Details',
                headerStyle: { backgroundColor: '#4F46E5' },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="StudentMain" component={StudentTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
