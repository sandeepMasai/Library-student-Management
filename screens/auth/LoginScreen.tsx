import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated, Easing } from 'react-native';
import { useAppStore } from '../../store';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const login = useAppStore((state) => state.login);
  const navAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const loginScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(navAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardAnim, heroAnim, navAnim]);

  const pressInLogin = () => {
    Animated.timing(loginScale, {
      toValue: 0.97,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const pressOutLogin = () => {
    Animated.timing(loginScale, {
      toValue: 1,
      duration: 110,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (!username || !pin) {
      Alert.alert('Error', 'Please enter username/mobile and PIN');
      return;
    }
    
    const result = await login(username, pin);
    if (!result.ok) {
      Alert.alert('Error', result.message || 'Invalid credentials or account blocked.');
    }
  };

  const isStudentTab = activeTab === 'student';

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={[
          styles.topNavbar,
          {
            opacity: navAnim,
            transform: [
              {
                translateY: navAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-18, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.navText}>Library Student Management</Text>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.brandIconWrap}>
            <Ionicons name={isStudentTab ? 'school-outline' : 'book-outline'} size={32} color="#fff" />
          </View>
          <Text style={styles.brandTitle}>LibTrack</Text>
          <Text style={styles.brandSubtitle}>{isStudentTab ? 'STUDENT PORTAL' : 'ADMINISTRATOR PORTAL'}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [22, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabBtn, isStudentTab && styles.tabBtnActive]}
              onPress={() => setActiveTab('student')}
              activeOpacity={0.9}
            >
              <Ionicons
                name="school-outline"
                size={16}
                color={isStudentTab ? '#FFFFFF' : '#4B5563'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, isStudentTab && styles.tabTextActive]}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, !isStudentTab && styles.tabBtnActive]}
              onPress={() => setActiveTab('admin')}
              activeOpacity={0.9}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={!isStudentTab ? '#FFFFFF' : '#4B5563'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, !isStudentTab && styles.tabTextActive]}>Administrator</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSubtitle}>
            {isStudentTab
              ? 'Enter your credentials to access the digital library shelf.'
              : 'Sign in to manage students, attendance and notifications.'}
          </Text>

          <Text style={styles.inputLabel}>
            {isStudentTab ? 'STUDENT ID OR PHONE NUMBER' : 'PHONE NUMBER / EMAIL'}
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name={isStudentTab ? 'id-card-outline' : 'person-outline'} size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={isStudentTab ? 'STU-2024-001 or +91...' : 'admin@libtrack.com'}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text style={styles.inputLabel}>{isStudentTab ? 'ACCESS PIN' : 'PASSWORD / PIN'}</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="********"
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Animated.View style={{ transform: [{ scale: loginScale }] }}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              onPressIn={pressInLogin}
              onPressOut={pressOutLogin}
              activeOpacity={0.95}
            >
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.forgotWrap} activeOpacity={0.8}>
            <Text style={styles.forgotText}>
              {isStudentTab ? 'Forgot your access code?' : 'Forgot Password?'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        <View style={styles.portalCard}>
          <View style={styles.portalIcon}>
            <Ionicons name={isStudentTab ? 'shield-checkmark-outline' : 'briefcase-outline'} size={22} color="#1D4ED8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.portalTitle}>
              {isStudentTab ? 'Student Access Gateway' : 'Administrator Portal'}
            </Text>
            <Text style={styles.portalSub}>
              {isStudentTab
                ? 'Secure academic gateway for student logins.'
                : 'Secure endpoint for library staff and curators.'}
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  topNavbar: {
    height: 72,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
  },
  navText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 24,
    paddingTop: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  brandIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E76C9',
    shadowColor: '#0E76C9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    marginTop: 12,
    fontSize: 48,
    fontWeight: '800',
    color: '#0F6FB6',
    lineHeight: 50,
  },
  brandSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabBtnActive: {
    backgroundColor: '#0E76C9',
  },
  tabText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  welcomeTitle: {
    fontSize: 36,
    color: '#111827',
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 18,
    paddingHorizontal: 16,
    height: 58,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  loginButton: {
    backgroundColor: '#0E76C9',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  forgotWrap: {
    marginTop: 14,
    alignItems: 'center',
  },
  forgotText: {
    color: '#0F6FB6',
    fontSize: 16,
    fontWeight: '700',
  },
  portalCard: {
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  portalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  portalTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  portalSub: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
});
