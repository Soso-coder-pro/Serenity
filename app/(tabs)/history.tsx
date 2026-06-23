import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { C, R, MOOD_LABELS, MOOD_EMOJIS } from '../../src/theme';
import { Session } from '../../src/types';

type Filter = 'all' | 'today' | 'week' | 'month';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: '7 days' },
  { id: 'month', label: '30 days' },
];

function groupByDate(sessions: Session[]) {
  const map = new Map<string, Session[]>();
  sessions.forEach((s) => {
    const label = new Date(s.startedAt).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    const arr = map.get(label) ?? [];
    arr.push(s);
    map.set(label, arr);
  });
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function timeStr(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryScreen() {
  const { sessions, removeSession } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const now = Date.now();
    return sessions.filter((s) => {
      const age = now - new Date(s.startedAt).getTime();
      if (filter === 'today') return age < 86400000;
      if (filter === 'week') return age < 7 * 86400000;
      if (filter === 'month') return age < 30 * 86400000;
      return true;
    });
  }, [sessions, filter]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const onDelete = (id: string) => {
    Alert.alert('Delete session?', 'This record will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeSession(id) },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>History</Text>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          <View style={s.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[s.chip, filter === f.id && s.chipActive]}
                onPress={() => setFilter(f.id)}
              >
                <Text style={[s.chipText, filter === f.id && s.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {groups.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>📋</Text>
            <Text style={s.emptyTitle}>No sessions yet</Text>
            <Text style={s.emptySub}>Start a session from the Today tab.</Text>
          </View>
        ) : (
          groups.map(({ label, items }) => (
            <View key={label}>
              <Text style={s.groupLabel}>{label}</Text>
              {items.map((session) => (
                <SessionRow key={session.id} session={session} onDelete={onDelete} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionRow({ session, onDelete }: { session: Session; onDelete: (id: string) => void }) {
  return (
    <View style={[s.sessionCard, { borderLeftColor: session.topicColor }]}>
      <View style={s.sessionHeader}>
        <View style={[s.swatch, { backgroundColor: session.topicSoft ?? session.topicColor + '22' }]}>
          <Text style={s.sessionEmoji}>
            {/* emoji stored in topic; fall back to first char of name */}
          </Text>
        </View>
        <Text style={s.sessionTopic}>{session.topicName}</Text>
        <Text style={s.sessionTime}>{timeStr(session.startedAt)}</Text>
      </View>

      <View style={s.pills}>
        <View style={s.pill}>
          <Text style={s.pillText}>{session.durationMinutes} min</Text>
        </View>
        <View style={s.pill}>
          <Text style={s.pillText}>{session.affirmationsReached} affirmations</Text>
        </View>
        {session.moodAfter !== null && session.moodAfter !== undefined && (
          <View style={[s.pill, { backgroundColor: C.accentSoft }]}>
            <Text style={[s.pillText, { color: C.accent }]}>
              {MOOD_EMOJIS[session.moodAfter]} {MOOD_LABELS[session.moodAfter]}
            </Text>
          </View>
        )}
      </View>

      {session.notes ? (
        <Text style={s.notes}>"{session.notes}"</Text>
      ) : null}

      <TouchableOpacity style={s.deleteBtn} onPress={() => onDelete(session.id)}>
        <Text style={s.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: C.text, marginBottom: 16 },

  filterScroll: { marginBottom: 20, marginHorizontal: -20, paddingHorizontal: 20 },
  filterRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: R.full,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { fontSize: 13, fontWeight: '700', color: C.sub },
  chipTextActive: { color: C.white },

  groupLabel: {
    fontSize: 12, fontWeight: '800', color: C.sub,
    letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10, marginTop: 4,
  },

  sessionCard: {
    backgroundColor: C.card, borderRadius: R.lg, padding: 15, marginBottom: 10,
    borderLeftWidth: 4, borderWidth: 1, borderColor: C.border, position: 'relative',
  },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 },
  swatch: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sessionEmoji: { fontSize: 16 },
  sessionTopic: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },
  sessionTime: { fontSize: 12, fontWeight: '700', color: C.sub },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { backgroundColor: C.statBg, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 12, fontWeight: '700', color: C.dim },

  notes: { marginTop: 10, fontSize: 13, color: C.dim, lineHeight: 20, fontStyle: 'italic' },

  deleteBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 12, color: C.sub, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: C.sub, textAlign: 'center' },
});
