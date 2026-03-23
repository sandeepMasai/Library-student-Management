import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store';

export default function AdminQrCode() {
  const dailyQrToken = useAppStore((state) => state.dailyQrToken);
  const generateDailyQr = useAppStore((state) => state.generateDailyQr);
  const [qrGeneratedAt, setQrGeneratedAt] = useState<string | null>(null);

  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const qrMonthKey = qrGeneratedAt ? format(new Date(qrGeneratedAt), 'yyyy-MM') : null;
  const isQrGeneratedThisMonth = Boolean(qrMonthKey && qrMonthKey === currentMonthKey);

  useEffect(() => {
    const init = async () => {
      const qrInfo = await generateDailyQr();
      if (qrInfo?.generatedAt) {
        setQrGeneratedAt(qrInfo.generatedAt);
      }
    };
    init();
  }, [generateDailyQr]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Admin QR Code</Text>
        <Text style={styles.subtitle}>Generate once per month. All students scan same QR daily.</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="calendar-outline" size={14} color="#1D4ED8" />
            <Text style={styles.metaText}>{format(new Date(), 'MMMM yyyy')}</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="time-outline" size={14} color="#16A34A" />
            <Text style={styles.metaText}>Valid 30 days</Text>
          </View>
        </View>

        <View style={styles.qrWrap}>
          {dailyQrToken ? (
            <QRCode value={dailyQrToken} size={210} color="#000" backgroundColor="#fff" />
          ) : (
            <Text style={styles.loadingText}>Generating QR...</Text>
          )}
        </View>

        {isQrGeneratedThisMonth ? (
          <View style={[styles.button, styles.buttonDisabled]}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Already generated this month</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              const qrInfo = await generateDailyQr();
              if (qrInfo?.generatedAt) {
                setQrGeneratedAt(qrInfo.generatedAt);
              }
            }}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Generate This Month QR</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    marginLeft: 6,
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '700',
  },
  qrWrap: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  button: {
    marginTop: 18,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
