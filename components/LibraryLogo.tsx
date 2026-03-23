import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title?: string;
  subtitle?: string;
  size?: number;
  compact?: boolean;
  light?: boolean;
};

export default function LibraryLogo({
  title = 'Library Manager',
  subtitle,
  size = 72,
  compact = false,
  light = false,
}: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -3,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    floatLoop.start();

    return () => {
      pulseLoop.stop();
      floatLoop.stop();
    };
  }, [floatY, pulse]);

  const iconColor = light ? '#FFFFFF' : '#4F46E5';
  const iconBg = light ? 'rgba(255,255,255,0.2)' : '#EEF2FF';
  const titleColor = light ? '#FFFFFF' : '#111827';
  const subColor = light ? 'rgba(255,255,255,0.85)' : '#6B7280';

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Animated.View
        style={[
          styles.iconWrap,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: iconBg },
          { transform: [{ scale: pulse }, { translateY: floatY }] },
        ]}
      >
        <Ionicons name="library-outline" size={size * 0.55} color={iconColor} />
      </Animated.View>
      <View style={[styles.textWrap, compact && styles.compactTextWrap]}>
        <Text style={[styles.title, { color: titleColor }, compact && styles.compactTitle]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: subColor }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  textWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  compactTextWrap: {
    marginTop: 0,
    marginLeft: 12,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  compactTitle: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
});
