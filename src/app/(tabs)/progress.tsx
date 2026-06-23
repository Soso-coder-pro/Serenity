import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { C, R, SHADOW } from '../../theme';
import { Session } from '../../types';

function dateKey(d: Date) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function computeStreak(sessions: Session[]) {
  const keys = new Set(sessions.map((s) => dateKey(new Date(s.startedAt))));
  let d = new Date();
  if (!keys.has(dateKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (keys.has(dateKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export default function ProgressScreen() {
  const { sessions, topics } = useApp();

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const totalMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);
  const totalSessions = sessions.length;

  // Week bars (last 7 days, in minutes)
  const weekBars = useMemo(() => {
    const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const todayKey = dateKey(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const k = dateKey(d);
      const mins = sessions.filter((s) => dateKey(new Date(s.startedAt)) === k)
        .reduce((a, s) => a + s.durationMinutes, 0);
      return { letter: letters[d.getDay()], mins, today: k === todayKey };
    });
  }, [sessions]);

  const weekTotal = weekBars.reduce((a, b) => a + b.mins, 0);
  const weekMax = Math.max(...weekBars.map((b) => b.mins), 1);

  // Month calendar
  const calendarData = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear(), mo = now.getMonth();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const firstDow = new Date(y, mo, 1).getDay();
    const sessionKeys = new Set(
      sessions
        .filter((s) => {
          const sd = new Date(s.startedAt);
          return sd.getFullYear() === y && sd.getMonth() === mo;
        })
        .map((s) => new Date(s.startedAt).getDate())
    );
    const cells: { label: string; hasSession: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ label: '', hasSession: false, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ label: String(d), hasSession: sessionKeys.has(d), isToday: d === now.getDate() });
    }
    return cells;
  }, [sessions]);

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Per topic stats
  const topicStats = useMemo(() =>
    topics
      .map((t) => {
        const ts = sessions.filter((s) => s.topicId === t.id);
        return { ...t, count: ts.length, mins: ts.reduce((a, s) => a + s.durationMinutes, 0) };
      })
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count),
    [topics, sessions]
  );
  const maxCount = Math.max(...topicStats.map((t) => t.count), 1);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Progress</Text>

        {/* Top stats */}
        <View style={s.statsRow}>
          <View style={[s.heroStat, { backgroundColor: C.heroTo }]}>
            <Text style={s.heroNum}>{streak}</Text>
            <Text style={s.heroLabel}>day streak</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{totalMinutes}</Text>
            <Text style={s.statLabel}>total minutes</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{totalSessions}</Text>
            <Text style={s.statLabel}>sessions</Text>
          </View>
        </View>

        {/* Week bar chart */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Minutes this week</Text>
            <Text style={s.cardSub}>{weekTotal} min</Text>
          </View>
          <View style={s.barChart}>
            {weekBars.map((b, i) => {
              const h = b.mins === 0 ? 4 : Math.round(12 + (b.mins / weekMax) * 72);
              return (
                <View key={i} style={s.barCol}>
                  <View style={s.barTrack}>
                    <View style={[s.bar, { height: h, backgroundColor: b.today ? C.accent : C.accentLight }]} />
                  </View>
                  <Text style={[s.barLabel, { color: b.today ? C.accent : C.sub }]}>{b.letter}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Calendar heatmap */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{monthLabel}</Text>
          <View style={s.weekHeaders}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((h, i) => (
              <Text key={i} style={s.weekHeader}>{h}</Text>
            ))}
          </View>
          <View style={s.calGrid}>
            {calendarData.map((c, i) => (
              <View key={i} style={s.calCell}>
                {c.label ? (
                  <View style={[
                    s.calDay,
                    c.hasSession && { backgroundColor: C.accentSoft },
                    c.isToday && { backgroundColor: C.accent },
                  ]}>
                    <Text style={[
                      s.calDayText,
                      c.hasSession && { color: C.accent },
                      c.isToday && { color: C.white },
                    ]}>{c.label}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* Per-topic */}
        {topicStats.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Sessions by topic</Text>
            <View style={s.topicList}>
              {topicStats.map((t) => (
                <View key={t.id} style={s.topicRow}>
                  <View style={s.topicHeader}>
                    <Text style={s.topicName}>{t.emoji} {t.name}</Text>
                    <Text style={s.topicMeta}>{t.count} sessions · {t.mins} min</Text>
                  </View>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${(t.count / maxCount) * 100}%`, backgroundColor: t.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {sessions.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>📊</Text>
            <Text style={s.emptyTitle}>No data yet</Text>
            <Text style={s.emptySub}>Complete your first session to see progress here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: C.text, marginBottom: 18 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  heroStat: {
    flex: 1, borderRadius: R.lg, padding: 16,
    ...SHADOW, shadowColor: C.heroTo, shadowOpacity: 0.3,
  },
  heroNum: { fontSize: 36, fontWeight: '700', color: C.white, lineHeight: 40 },
  heroLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border },
  statNum: { fontSize: 30, fontWeight: '700', color: C.text, lineHeight: 34 },
  statLabel: { fontSize: 11, fontWeight: '700', color: C.sub, marginTop: 6 },

  card: { backgroundColor: C.card, borderRadius: R.lg, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  cardSub: { fontSize: 12, fontWeight: '700', color: C.sub },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100 },
  barCol: { flex: 1, alignItems: 'center', gap: 7 },
  barTrack: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '70%', borderRadius: 6 },
  barLabel: { fontSize: 11, fontWeight: '800' },

  weekHeaders: { flexDirection: 'row', marginBottom: 8 },
  weekHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '800', color: C.sub },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  calDay: { width: '90%', aspectRatio: 1, borderRadius: R.full, alignItems: 'center', justifyContent: 'center' },
  calDayText: { fontSize: 12, fontWeight: '700', color: C.text },

  topicList: { gap: 16 },
  topicRow: { gap: 7 },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicName: { fontSize: 14, fontWeight: '700', color: C.text },
  topicMeta: { fontSize: 12, color: C.sub, fontWeight: '600' },
  progressTrack: { height: 8, backgroundColor: C.statBg, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: C.sub, textAlign: 'center' },
});
