import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { SessionCard } from '../../src/components/SessionCard';
import { COLORS, RADIUS } from '../../src/theme';
import { Session } from '../../src/types';

function groupByDate(sessions: Session[]): { date: string; items: Session[] }[] {
  const map = new Map<string, Session[]>();
  sessions.forEach((s) => {
    const d = new Date(s.startedAt).toDateString();
    const arr = map.get(d) ?? [];
    arr.push(s);
    map.set(d, arr);
  });
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export default function HistoryScreen() {
  const { sessions, removeSession } = useApp();
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  const filtered = useMemo(() => {
    const now = Date.now();
    return sessions.filter((s) => {
      if (filter === 'week') return now - new Date(s.startedAt).getTime() < 7 * 86400000;
      if (filter === 'month') return now - new Date(s.startedAt).getTime() < 30 * 86400000;
      return true;
    });
  }, [sessions, filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  type FlatItem =
    | { type: 'header'; date: string; key: string }
    | { type: 'session'; session: Session; key: string };

  const flatData: FlatItem[] = useMemo(() => {
    const out: FlatItem[] = [];
    grouped.forEach(({ date, items }) => {
      out.push({ type: 'header', date, key: `h_${date}` });
      items.forEach((s) =>
        out.push({ type: 'session', session: s, key: s.id })
      );
    });
    return out;
  }, [grouped]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.filterRow}>
          {(['all', 'week', 'month'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  filter === f && styles.filterBtnTextActive,
                ]}
              >
                {f === 'all' ? 'All' : f === 'week' ? '7 days' : '30 days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {flatData.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptyDesc}>
              Start a session from a topic to see your history here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={flatData}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <View style={styles.dateHeader}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={COLORS.subtext}
                    />
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>
                );
              }
              return (
                <SessionCard
                  session={item.session}
                  onDelete={removeSession}
                />
              );
            }}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.subtext,
  },
  filterBtnTextActive: {
    color: COLORS.white,
  },
  list: { paddingBottom: 32 },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    color: COLORS.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
});
