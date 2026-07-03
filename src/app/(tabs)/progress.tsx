import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { C, R, SHADOW, MOOD_EMOJIS } from '../../theme';
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

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function ProgressScreen() {
  const { sessions, topics } = useApp();

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const totalMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);
  const totalSessions = sessions.length;

  // Week bars (last 7 days, in minutes)
  const weekBars = useMemo(() => {
    const todayKey = dateKey(today);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const k = dateKey(d);
      const mins = sessions.filter((s) => dateKey(new Date(s.startedAt)) === k)
        .reduce((a, s) => a + s.durationMinutes, 0);
      return { letter: DAY_LETTERS[d.getDay()], mins, today: k === todayKey };
    });
  }, [sessions]);

  const weekTotal = weekBars.reduce((a, b) => a + b.mins, 0);
  const weekMax = Math.max(...weekBars.map((b) => b.mins), 1);

  // Calendar for viewMonth
  const calendarData = useMemo(() => {
    const y = viewMonth.getFullYear(), mo = viewMonth.getMonth();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const firstDow = new Date(y, mo, 1).getDay();
    const sessionDays = new Set(
      sessions
        .filter((s) => { const sd = new Date(s.startedAt); return sd.getFullYear() === y && sd.getMonth() === mo; })
        .map((s) => new Date(s.startedAt).getDate())
    );
    const cells: { day: number | null; hasSession: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ day: null, hasSession: false, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, mo, d);
      cells.push({ day: d, hasSession: sessionDays.has(d), isToday: isSameDay(date, today) });
    }
    return cells;
  }, [sessions, viewMonth]);

  const prevMonth = () => setViewMonth((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  const nextMonth = () => {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) setViewMonth(next);
  };
  const isNextDisabled = viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Stats for selected day
  const selectedDaySessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessions.filter((s) => isSameDay(new Date(s.startedAt), selectedDate));
  }, [sessions, selectedDate]);

  const selectedDayLabel = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null;
  const selectedDayMins = selectedDaySessions.reduce((a, s) => a + s.durationMinutes, 0);
  const selectedDayAff = selectedDaySessions.reduce((a, s) => a + s.affirmationsReached, 0);

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

  const handleDayPress = (day: number) => {
    setSelectedDate(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
  };

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

        {/* Calendar */}
        <View style={s.card}>
          {/* Month navigation */}
          <View style={s.calHeader}>
            <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
              <Ionicons name="chevron-back" size={18} color={C.accent} />
            </TouchableOpacity>
            <Text style={s.cardTitle}>{monthLabel}</Text>
            <TouchableOpacity onPress={nextMonth} style={s.navBtn} disabled={isNextDisabled}>
              <Ionicons name="chevron-forward" size={18} color={isNextDisabled ? C.border : C.accent} />
            </TouchableOpacity>
          </View>

          <View style={s.weekHeaders}>
            {DAY_LETTERS.map((h, i) => (
              <Text key={i} style={s.weekHeader}>{h}</Text>
            ))}
          </View>

          <View style={s.calGrid}>
            {calendarData.map((c, i) => {
              const isSelected = selectedDate !== null && c.day !== null &&
                isSameDay(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), c.day), selectedDate);
              return (
                <View key={i} style={s.calCell}>
                  {c.day !== null ? (
                    <TouchableOpacity
                      style={[
                        s.calDay,
                        c.hasSession && { backgroundColor: C.accentSoft },
                        c.isToday && { backgroundColor: C.accent },
                        isSelected && s.calDaySelected,
                      ]}
                      onPress={() => handleDayPress(c.day!)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        s.calDayText,
                        c.hasSession && { color: C.accent },
                        c.isToday && { color: C.white },
                        isSelected && s.calDayTextSelected,
                      ]}>{c.day}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Selected day details */}
        {selectedDate && (
          <View style={s.dayCard}>
            <Text style={s.dayCardTitle}>{selectedDayLabel}</Text>
            {selectedDaySessions.length === 0 ? (
              <Text style={s.dayEmpty}>No sessions this day.</Text>
            ) : (
              <>
                <View style={s.daySummary}>
                  <View style={s.dayStat}>
                    <Text style={s.dayStatNum}>{selectedDayAff}</Text>
                    <Text style={s.dayStatLabel}>affirmations</Text>
                  </View>
                  <View style={s.daySeparator} />
                  <View style={s.dayStat}>
                    <Text style={s.dayStatNum}>{selectedDayMins}</Text>
                    <Text style={s.dayStatLabel}>minutes</Text>
                  </View>
                  <View style={s.daySeparator} />
                  <View style={s.dayStat}>
                    <Text style={s.dayStatNum}>{selectedDaySessions.length}</Text>
                    <Text style={s.dayStatLabel}>sessions</Text>
                  </View>
                </View>

                {selectedDaySessions.map((sess) => (
                  <View key={sess.id} style={[s.sessRow, { borderLeftColor: sess.topicColor }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.sessName}>{sess.topicName}</Text>
                      <Text style={s.sessMeta}>
                        {sess.affirmationsReached} aff · {sess.durationMinutes} min
                        {sess.moodAfter !== null && sess.moodAfter !== undefined
                          ? `  ${MOOD_EMOJIS[sess.moodAfter]}`
                          : ''}
                      </Text>
                    </View>
                    <Text style={s.sessTime}>
                      {new Date(sess.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

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
  heroStat: { flex: 1, borderRadius: R.lg, padding: 16, ...SHADOW, shadowColor: C.heroTo, shadowOpacity: 0.3 },
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

  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  weekHeaders: { flexDirection: 'row', marginBottom: 8 },
  weekHeader: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '800', color: C.sub },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  calDay: { width: '90%', aspectRatio: 1, borderRadius: R.full, alignItems: 'center', justifyContent: 'center' },
  calDaySelected: { borderWidth: 2, borderColor: C.accent, backgroundColor: 'transparent' },
  calDayText: { fontSize: 12, fontWeight: '700', color: C.text },
  calDayTextSelected: { color: C.accent },

  dayCard: {
    backgroundColor: C.card, borderRadius: R.lg, padding: 18,
    borderWidth: 1, borderColor: C.accentMid, marginBottom: 14,
  },
  dayCardTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 14 },
  dayEmpty: { fontSize: 14, color: C.sub, textAlign: 'center', paddingVertical: 12 },
  daySummary: { flexDirection: 'row', marginBottom: 16 },
  dayStat: { flex: 1, alignItems: 'center' },
  dayStatNum: { fontSize: 26, fontWeight: '700', color: C.accent },
  dayStatLabel: { fontSize: 11, fontWeight: '700', color: C.sub, marginTop: 2 },
  daySeparator: { width: 1, backgroundColor: C.border, marginVertical: 4 },
  sessRow: {
    flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  sessName: { fontSize: 14, fontWeight: '700', color: C.text },
  sessMeta: { fontSize: 12, color: C.sub, marginTop: 2 },
  sessTime: { fontSize: 12, fontWeight: '700', color: C.sub },

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
