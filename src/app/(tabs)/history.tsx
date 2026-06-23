import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { C, R, MOOD_EMOJIS } from '../../theme';
import { Session } from '../../types';

type Period = 'day' | 'week' | 'month';
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  r.setHours(0, 0, 0, 0);
  return r;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function timeStr(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
function shortDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function InsightsScreen() {
  const { sessions, topics, removeSession } = useApp();
  const today = new Date();

  const [period, setPeriod] = useState<Period>('day');
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));

  // ── DAY MODE ─────────────────────────────────────────────────────────────
  const calendarData = useMemo(() => {
    const y = viewMonth.getFullYear(), mo = viewMonth.getMonth();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const firstDow = new Date(y, mo, 1).getDay();
    // aff count per day
    const dayAff = new Map<number, number>();
    sessions.forEach((s) => {
      const sd = new Date(s.startedAt);
      if (sd.getFullYear() === y && sd.getMonth() === mo) {
        dayAff.set(sd.getDate(), (dayAff.get(sd.getDate()) ?? 0) + s.affirmationsReached);
      }
    });
    const cells: { day: number | null; aff: number; isToday: boolean }[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ day: null, aff: 0, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, aff: dayAff.get(d) ?? 0, isToday: isSameDay(new Date(y, mo, d), today) });
    }
    return cells;
  }, [sessions, viewMonth]);

  const maxDayAff = Math.max(...calendarData.map((c) => c.aff), 1);

  const selectedDaySessions = useMemo(
    () => sessions.filter((s) => isSameDay(new Date(s.startedAt), selectedDate)),
    [sessions, selectedDate]
  );
  const selectedDayAff = selectedDaySessions.reduce((a, s) => a + s.affirmationsReached, 0);
  const selectedDayMins = selectedDaySessions.reduce((a, s) => a + s.durationMinutes, 0);

  const prevMonth = () => setViewMonth((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  const nextMonth = () => {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) setViewMonth(next);
  };
  const isNextMonthDisabled = viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();

  // ── WEEK MODE ─────────────────────────────────────────────────────────────
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weekSessions = useMemo(
    () => sessions.filter((s) => {
      const d = new Date(s.startedAt);
      return d >= weekStart && d <= addDays(weekEnd, 1);
    }),
    [sessions, weekStart]
  );

  const weekDayStats = useMemo(() =>
    weekDays.map((d) => {
      const ds = sessions.filter((s) => isSameDay(new Date(s.startedAt), d));
      // per topic aff
      const byTopic = new Map<string, { color: string; aff: number }>();
      ds.forEach((s) => {
        const cur = byTopic.get(s.topicId) ?? { color: s.topicColor, aff: 0 };
        byTopic.set(s.topicId, { color: s.topicColor, aff: cur.aff + s.affirmationsReached });
      });
      return {
        date: d,
        totalAff: ds.reduce((a, s) => a + s.affirmationsReached, 0),
        segments: Array.from(byTopic.values()),
      };
    }),
    [sessions, weekStart]
  );

  const weekMaxAff = Math.max(...weekDayStats.map((d) => d.totalAff), 1);
  const weekTotalAff = weekDayStats.reduce((a, d) => a + d.totalAff, 0);
  const weekTotalMins = weekSessions.reduce((a, s) => a + s.durationMinutes, 0);

  // topic proportions for the week
  const weekTopicProps = useMemo(() => {
    const map = new Map<string, { name: string; color: string; aff: number }>();
    weekSessions.forEach((s) => {
      const cur = map.get(s.topicId) ?? { name: s.topicName, color: s.topicColor, aff: 0 };
      map.set(s.topicId, { ...cur, aff: cur.aff + s.affirmationsReached });
    });
    const arr = Array.from(map.values()).sort((a, b) => b.aff - a.aff);
    const total = arr.reduce((a, t) => a + t.aff, 1);
    return arr.map((t) => ({ ...t, pct: Math.round((t.aff / total) * 100) }));
  }, [weekSessions]);

  const prevWeek = () => setWeekStart((v) => addDays(v, -7));
  const nextWeek = () => {
    const next = addDays(weekStart, 7);
    if (next <= today) setWeekStart(next);
  };
  const isNextWeekDisabled = addDays(weekStart, 7) > today;

  // ── MONTH MODE ────────────────────────────────────────────────────────────
  const [viewMonthM, setViewMonthM] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthSessions = useMemo(
    () => sessions.filter((s) => {
      const sd = new Date(s.startedAt);
      return sd.getFullYear() === viewMonthM.getFullYear() && sd.getMonth() === viewMonthM.getMonth();
    }),
    [sessions, viewMonthM]
  );

  const monthCalData = useMemo(() => {
    const y = viewMonthM.getFullYear(), mo = viewMonthM.getMonth();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const firstDow = new Date(y, mo, 1).getDay();
    const dayAff = new Map<number, number>();
    monthSessions.forEach((s) => {
      const d = new Date(s.startedAt).getDate();
      dayAff.set(d, (dayAff.get(d) ?? 0) + s.affirmationsReached);
    });
    const cells: { day: number | null; aff: number; isToday: boolean }[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ day: null, aff: 0, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, aff: dayAff.get(d) ?? 0, isToday: isSameDay(new Date(y, mo, d), today) });
    }
    return cells;
  }, [monthSessions, viewMonthM]);

  const monthMaxAff = Math.max(...monthCalData.map((c) => c.aff), 1);
  const monthTotalAff = monthSessions.reduce((a, s) => a + s.affirmationsReached, 0);
  const monthTotalMins = monthSessions.reduce((a, s) => a + s.durationMinutes, 0);

  const monthTopicProps = useMemo(() => {
    const map = new Map<string, { name: string; color: string; aff: number }>();
    monthSessions.forEach((s) => {
      const cur = map.get(s.topicId) ?? { name: s.topicName, color: s.topicColor, aff: 0 };
      map.set(s.topicId, { ...cur, aff: cur.aff + s.affirmationsReached });
    });
    const arr = Array.from(map.values()).sort((a, b) => b.aff - a.aff);
    const total = arr.reduce((a, t) => a + t.aff, 1);
    return arr.map((t) => ({ ...t, pct: Math.round((t.aff / total) * 100) }));
  }, [monthSessions]);

  const prevMonthM = () => setViewMonthM((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  const nextMonthM = () => {
    const next = new Date(viewMonthM.getFullYear(), viewMonthM.getMonth() + 1, 1);
    if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) setViewMonthM(next);
  };
  const isNextMonthMDisabled = viewMonthM.getFullYear() === today.getFullYear() && viewMonthM.getMonth() === today.getMonth();

  const onDelete = (id: string) => {
    Alert.alert('Delete session?', 'This record will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeSession(id) },
    ]);
  };

  function intensityColor(aff: number, max: number) {
    if (aff === 0) return 'transparent';
    const ratio = aff / max;
    if (ratio < 0.25) return C.accentSoft;
    if (ratio < 0.5) return C.accentLight;
    if (ratio < 0.75) return C.accentMid;
    return C.accent;
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Period toggle */}
      <View style={s.toggleRow}>
        {(['day', 'week', 'month'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[s.toggleBtn, period === p && s.toggleBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[s.toggleText, period === p && s.toggleTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── DAY VIEW ── */}
        {period === 'day' && (
          <>
            {/* Calendar */}
            <View style={s.card}>
              <View style={s.calHeader}>
                <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
                  <Ionicons name="chevron-back" size={18} color={C.accent} />
                </TouchableOpacity>
                <Text style={s.cardTitle}>
                  {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={s.navBtn} disabled={isNextMonthDisabled}>
                  <Ionicons name="chevron-forward" size={18} color={isNextMonthDisabled ? C.border : C.accent} />
                </TouchableOpacity>
              </View>
              <View style={s.weekHeaders}>
                {DAY_LETTERS.map((h, i) => <Text key={i} style={s.weekHeader}>{h}</Text>)}
              </View>
              <View style={s.calGrid}>
                {calendarData.map((c, i) => {
                  const isSelected = c.day !== null && isSameDay(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), c.day), selectedDate);
                  return (
                    <View key={i} style={s.calCell}>
                      {c.day !== null ? (
                        <TouchableOpacity
                          style={[
                            s.calDay,
                            c.aff > 0 && { backgroundColor: intensityColor(c.aff, maxDayAff) },
                            c.isToday && s.calDayToday,
                            isSelected && s.calDaySelected,
                          ]}
                          onPress={() => {
                            setSelectedDate(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), c.day!));
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[s.calDayNum, c.isToday && s.calDayNumToday, isSelected && s.calDayNumSelected]}>
                            {c.day}
                          </Text>
                          {c.aff > 0 && (
                            <Text style={[s.calDayAff, c.isToday && { color: C.white }, isSelected && { color: C.accent }]}>
                              {c.aff >= 1000 ? `${Math.round(c.aff / 100) / 10}k` : c.aff}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Day detail */}
            <View style={s.card}>
              <Text style={s.dayTitle}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
              </Text>
              {selectedDaySessions.length === 0 ? (
                <Text style={s.empty}>No sessions this day.</Text>
              ) : (
                <>
                  <View style={s.daySummary}>
                    <View style={s.dayStat}>
                      <Text style={s.dayStatNum}>{selectedDayAff.toLocaleString()}</Text>
                      <Text style={s.dayStatLabel}>affirmations</Text>
                    </View>
                    <View style={s.daySep} />
                    <View style={s.dayStat}>
                      <Text style={s.dayStatNum}>{selectedDayMins}</Text>
                      <Text style={s.dayStatLabel}>minutes</Text>
                    </View>
                    <View style={s.daySep} />
                    <View style={s.dayStat}>
                      <Text style={s.dayStatNum}>{selectedDaySessions.length}</Text>
                      <Text style={s.dayStatLabel}>sessions</Text>
                    </View>
                  </View>
                  {selectedDaySessions.map((sess) => (
                    <SessionRow key={sess.id} session={sess} onDelete={onDelete} />
                  ))}
                </>
              )}
            </View>
          </>
        )}

        {/* ── WEEK VIEW ── */}
        {period === 'week' && (
          <>
            {/* Week nav */}
            <View style={s.card}>
              <View style={s.calHeader}>
                <TouchableOpacity onPress={prevWeek} style={s.navBtn}>
                  <Ionicons name="chevron-back" size={18} color={C.accent} />
                </TouchableOpacity>
                <Text style={s.cardTitle}>{shortDate(weekStart)} – {shortDate(weekEnd)}</Text>
                <TouchableOpacity onPress={nextWeek} style={s.navBtn} disabled={isNextWeekDisabled}>
                  <Ionicons name="chevron-forward" size={18} color={isNextWeekDisabled ? C.border : C.accent} />
                </TouchableOpacity>
              </View>

              {/* Week totals */}
              <View style={s.daySummary}>
                <View style={s.dayStat}>
                  <Text style={s.dayStatNum}>{weekTotalAff.toLocaleString()}</Text>
                  <Text style={s.dayStatLabel}>affirmations</Text>
                </View>
                <View style={s.daySep} />
                <View style={s.dayStat}>
                  <Text style={s.dayStatNum}>{weekTotalMins}</Text>
                  <Text style={s.dayStatLabel}>minutes</Text>
                </View>
                <View style={s.daySep} />
                <View style={s.dayStat}>
                  <Text style={s.dayStatNum}>{weekSessions.length}</Text>
                  <Text style={s.dayStatLabel}>sessions</Text>
                </View>
              </View>

              {/* Bar chart per day */}
              <View style={s.barChart}>
                {weekDayStats.map((d, i) => {
                  const h = d.totalAff === 0 ? 4 : Math.round(12 + (d.totalAff / weekMaxAff) * 72);
                  return (
                    <View key={i} style={s.barCol}>
                      <View style={s.barTrack}>
                        {d.segments.length === 0 ? (
                          <View style={[s.bar, { height: 4, backgroundColor: C.border }]} />
                        ) : (
                          <View style={[s.bar, { height: h, overflow: 'hidden' }]}>
                            {d.segments.map((seg, j) => {
                              const segH = Math.round((seg.aff / d.totalAff) * h);
                              return <View key={j} style={{ height: segH, backgroundColor: seg.color }} />;
                            })}
                          </View>
                        )}
                      </View>
                      <Text style={[s.barLabel, isSameDay(d.date, today) && { color: C.accent }]}>
                        {DAY_LETTERS[d.date.getDay()]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Topic proportions */}
            {weekTopicProps.length > 0 && (
              <View style={s.card}>
                <Text style={[s.cardTitle, { marginBottom: 14 }]}>Affirmations by topic</Text>
                <View style={s.propBar}>
                  {weekTopicProps.map((t, i) => (
                    <View key={i} style={{ flex: t.aff, backgroundColor: t.color, height: '100%' }} />
                  ))}
                </View>
                <View style={s.propLegend}>
                  {weekTopicProps.map((t, i) => (
                    <View key={i} style={s.propRow}>
                      <View style={[s.propDot, { backgroundColor: t.color }]} />
                      <Text style={s.propName} numberOfLines={1}>{t.name}</Text>
                      <Text style={s.propVal}>{t.aff.toLocaleString()} · {t.pct}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {weekSessions.length === 0 && <Text style={s.empty}>No sessions this week.</Text>}
          </>
        )}

        {/* ── MONTH VIEW ── */}
        {period === 'month' && (
          <>
            <View style={s.card}>
              <View style={s.calHeader}>
                <TouchableOpacity onPress={prevMonthM} style={s.navBtn}>
                  <Ionicons name="chevron-back" size={18} color={C.accent} />
                </TouchableOpacity>
                <Text style={s.cardTitle}>
                  {viewMonthM.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={nextMonthM} style={s.navBtn} disabled={isNextMonthMDisabled}>
                  <Ionicons name="chevron-forward" size={18} color={isNextMonthMDisabled ? C.border : C.accent} />
                </TouchableOpacity>
              </View>

              {/* Month totals */}
              <View style={[s.daySummary, { marginBottom: 16 }]}>
                <View style={s.dayStat}>
                  <Text style={s.dayStatNum}>{monthTotalAff.toLocaleString()}</Text>
                  <Text style={s.dayStatLabel}>affirmations</Text>
                </View>
                <View style={s.daySep} />
                <View style={s.dayStat}>
                  <Text style={s.dayStatNum}>{monthTotalMins}</Text>
                  <Text style={s.dayStatLabel}>minutes</Text>
                </View>
                <View style={s.daySep} />
                <View style={s.dayStat}>
                  <Text style={s.dayStatNum}>{monthSessions.length}</Text>
                  <Text style={s.dayStatLabel}>sessions</Text>
                </View>
              </View>

              {/* Heatmap calendar */}
              <View style={s.weekHeaders}>
                {DAY_LETTERS.map((h, i) => <Text key={i} style={s.weekHeader}>{h}</Text>)}
              </View>
              <View style={s.calGrid}>
                {monthCalData.map((c, i) => (
                  <View key={i} style={s.calCell}>
                    {c.day !== null ? (
                      <View style={[
                        s.calDay,
                        c.aff > 0 && { backgroundColor: intensityColor(c.aff, monthMaxAff) },
                        c.isToday && s.calDayToday,
                      ]}>
                        <Text style={[s.calDayNum, c.isToday && s.calDayNumToday]}>{c.day}</Text>
                        {c.aff > 0 && (
                          <Text style={[s.calDayAff, c.isToday && { color: C.white }]}>
                            {c.aff >= 1000 ? `${Math.round(c.aff / 100) / 10}k` : c.aff}
                          </Text>
                        )}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>

              {/* Intensity legend */}
              <View style={s.intensityRow}>
                <Text style={s.intensityLabel}>Less</Text>
                {[C.accentSoft, C.accentLight, C.accentMid, C.accent].map((col, i) => (
                  <View key={i} style={[s.intensityDot, { backgroundColor: col }]} />
                ))}
                <Text style={s.intensityLabel}>More</Text>
              </View>
            </View>

            {/* Topic proportions for the month */}
            {monthTopicProps.length > 0 && (
              <View style={s.card}>
                <Text style={[s.cardTitle, { marginBottom: 14 }]}>Affirmations by topic</Text>
                <View style={s.propBar}>
                  {monthTopicProps.map((t, i) => (
                    <View key={i} style={{ flex: t.aff, backgroundColor: t.color, height: '100%' }} />
                  ))}
                </View>
                <View style={s.propLegend}>
                  {monthTopicProps.map((t, i) => (
                    <View key={i} style={s.propRow}>
                      <View style={[s.propDot, { backgroundColor: t.color }]} />
                      <Text style={s.propName} numberOfLines={1}>{t.name}</Text>
                      <Text style={s.propVal}>{t.aff.toLocaleString()} · {t.pct}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {monthSessions.length === 0 && <Text style={s.empty}>No sessions this month.</Text>}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function SessionRow({ session, onDelete }: { session: Session; onDelete: (id: string) => void }) {
  return (
    <View style={[s.sessCard, { borderLeftColor: session.topicColor }]}>
      <View style={s.sessHeader}>
        <View style={[s.sessSwatch, { backgroundColor: session.topicSoft ?? session.topicColor + '22' }]}>
          <View style={[s.sessSwatchBar, { backgroundColor: session.topicColor }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.sessName}>{session.topicName}</Text>
          <Text style={s.sessMeta}>
            {session.durationMinutes} min · {session.affirmationsReached} aff
            {session.moodAfter !== null && session.moodAfter !== undefined ? `  ${MOOD_EMOJIS[session.moodAfter]}` : ''}
          </Text>
        </View>
        <View style={s.sessRight}>
          <Text style={s.sessTime}>{timeStr(session.startedAt)}</Text>
          <TouchableOpacity onPress={() => onDelete(session.id)} style={s.deleteBtn}>
            <Ionicons name="trash-outline" size={14} color={C.sub} />
          </TouchableOpacity>
        </View>
      </View>
      {session.notes ? <Text style={s.sessNotes}>"{session.notes}"</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  toggleRow: {
    flexDirection: 'row', padding: 12, paddingBottom: 0, gap: 8,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 9, borderRadius: R.full,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  toggleText: { fontSize: 13, fontWeight: '700', color: C.sub },
  toggleTextActive: { color: C.white },

  scroll: { padding: 12, paddingBottom: 40 },
  card: { backgroundColor: C.card, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.text },

  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  weekHeaders: { flexDirection: 'row', marginBottom: 6 },
  weekHeader: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '800', color: C.sub },

  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 0.85, alignItems: 'center', justifyContent: 'center', padding: 1.5 },
  calDay: { width: '100%', height: '100%', borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', paddingVertical: 3 },
  calDayToday: { borderWidth: 2, borderColor: C.accent },
  calDaySelected: { borderWidth: 2, borderColor: C.accent, backgroundColor: C.accentSoft },
  calDayNum: { fontSize: 11, fontWeight: '700', color: C.text },
  calDayNumToday: { color: C.accent },
  calDayNumSelected: { color: C.accent },
  calDayAff: { fontSize: 9, fontWeight: '800', color: C.dim, marginTop: 1 },

  intensityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' },
  intensityLabel: { fontSize: 10, color: C.sub, fontWeight: '600' },
  intensityDot: { width: 14, height: 14, borderRadius: 3 },

  dayTitle: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 14 },
  daySummary: { flexDirection: 'row', marginBottom: 16 },
  dayStat: { flex: 1, alignItems: 'center' },
  dayStatNum: { fontSize: 24, fontWeight: '700', color: C.accent },
  dayStatLabel: { fontSize: 10, fontWeight: '700', color: C.sub, marginTop: 2 },
  daySep: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  sessCard: {
    borderLeftWidth: 4, borderRadius: R.sm, backgroundColor: C.bg,
    padding: 12, marginBottom: 8,
  },
  sessHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sessSwatch: { width: 36, height: 36, borderRadius: R.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  sessSwatchBar: { height: 5 },
  sessName: { fontSize: 14, fontWeight: '700', color: C.text },
  sessMeta: { fontSize: 12, color: C.sub, marginTop: 2 },
  sessRight: { alignItems: 'flex-end', gap: 4 },
  sessTime: { fontSize: 11, fontWeight: '700', color: C.sub },
  deleteBtn: { padding: 4 },
  sessNotes: { fontSize: 12, color: C.dim, fontStyle: 'italic', marginTop: 6, paddingLeft: 46 },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100, marginTop: 16 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '80%', borderRadius: 5 },
  barLabel: { fontSize: 11, fontWeight: '800', color: C.sub },

  propBar: { height: 18, borderRadius: R.full, overflow: 'hidden', flexDirection: 'row', marginBottom: 14 },
  propLegend: { gap: 10 },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  propDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  propName: { flex: 1, fontSize: 13, fontWeight: '700', color: C.text },
  propVal: { fontSize: 12, fontWeight: '700', color: C.sub },

  empty: { textAlign: 'center', color: C.sub, fontSize: 14, paddingVertical: 24 },
});
