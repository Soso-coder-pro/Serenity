import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';
import { Session } from '../../src/types';

function getStreak(sessions: Session[]): number {
  if (!sessions.length) return 0;
  const days = new Set(
    sessions.map((s) =>
      new Date(s.startedAt).toDateString()
    )
  );
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toDateString());
  }
  return days;
}

export default function ProgressScreen() {
  const { sessions, topics } = useApp();

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  const totalAffirmations = sessions.reduce((s, x) => s + x.affirmationsReached, 0);
  const streak = useMemo(() => getStreak(sessions), [sessions]);

  const last7 = useMemo(() => getLast7Days(), []);
  const sessionsPerDay = useMemo(
    () =>
      last7.map((day) => ({
        day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        count: sessions.filter(
          (s) => new Date(s.startedAt).toDateString() === day
        ).length,
      })),
    [sessions, last7]
  );

  const maxDayCount = Math.max(...sessionsPerDay.map((d) => d.count), 1);

  const topicStats = useMemo(() => {
    return topics
      .map((t) => {
        const ts = sessions.filter((s) => s.topicId === t.id);
        return {
          ...t,
          sessionCount: ts.length,
          totalMinutes: ts.reduce((s, x) => s + x.durationMinutes, 0),
        };
      })
      .filter((t) => t.sessionCount > 0)
      .sort((a, b) => b.sessionCount - a.sessionCount);
  }, [topics, sessions]);

  const maxTopicSessions = Math.max(...topicStats.map((t) => t.sessionCount), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon="flame-outline"
            value={streak}
            label="Day Streak"
            color="#FF6B6B"
          />
          <SummaryCard
            icon="layers-outline"
            value={totalSessions}
            label="Sessions"
            color={COLORS.primary}
          />
        </View>
        <View style={styles.summaryRow}>
          <SummaryCard
            icon="time-outline"
            value={totalMinutes}
            label="Minutes"
            color="#5C9BF5"
          />
          <SummaryCard
            icon="star-outline"
            value={totalAffirmations}
            label="Affirmations"
            color="#FFB347"
          />
        </View>

        {/* Last 7 days bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sessions — last 7 days</Text>
          <View style={styles.barChart}>
            {sessionsPerDay.map((d) => (
              <View key={d.day} style={styles.barWrapper}>
                <Text style={styles.barValue}>{d.count > 0 ? d.count : ''}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max((d.count / maxDayCount) * 100, d.count > 0 ? 10 : 0)}%`,
                        backgroundColor:
                          d.count > 0 ? COLORS.primary : COLORS.border,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Per-topic stats */}
        {topicStats.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>By topic</Text>
            {topicStats.map((t) => (
              <View key={t.id} style={styles.topicRow}>
                <Text style={styles.topicEmoji}>{t.emoji}</Text>
                <View style={styles.topicInfo}>
                  <View style={styles.topicLabelRow}>
                    <Text style={styles.topicName} numberOfLines={1}>
                      {t.name}
                    </Text>
                    <Text style={styles.topicSessions}>
                      {t.sessionCount} session{t.sessionCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(t.sessionCount / maxTopicSessions) * 100}%`,
                          backgroundColor: t.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.topicMinutes}>{t.totalMinutes} min total</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {sessions.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyDesc}>
              Complete sessions to see your progress here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: color }]}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 3,
    ...SHADOW,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 2,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    ...SHADOW,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 2,
    height: 16,
  },
  barTrack: {
    width: '70%',
    height: 80,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.subtext,
    marginTop: 4,
    fontWeight: '600',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  topicEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  topicSessions: {
    fontSize: 12,
    color: COLORS.subtext,
    marginLeft: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  topicMinutes: {
    fontSize: 11,
    color: COLORS.subtext,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
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
