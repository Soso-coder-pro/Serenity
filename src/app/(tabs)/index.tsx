import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { C, R, SHADOW, MOOD_EMOJIS, MOOD_LABELS } from '../../theme';
import { Session } from '../../types';

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeStreak(sessions: Session[]) {
  const keys = new Set(sessions.map((s) => dateKey(new Date(s.startedAt))));
  let d = new Date();
  if (!keys.has(dateKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (keys.has(dateKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function getHour() { return new Date().getHours(); }
function greeting() {
  const h = getHour();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
function longDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export default function HomeScreen() {
  const { topics, sessions, affirmations, removeTopic, removeAffirmation, removeSession } = useApp();
  const router = useRouter();

  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const todayKey = dateKey(new Date());
  const todaySessions = sessions.filter((s) => dateKey(new Date(s.startedAt)) === todayKey);
  const todayMinutes = todaySessions.reduce((a, s) => a + s.durationMinutes, 0);
  const todayAff = todaySessions.reduce((a, s) => a + s.affirmationsReached, 0);

  // last 7 days dots
  const weekDots = useMemo(() => {
    const keys = new Set(sessions.map((s) => dateKey(new Date(s.startedAt))));
    const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const k = dateKey(d);
      return { letter: letters[d.getDay()], done: keys.has(k), today: k === todayKey };
    });
  }, [sessions, todayKey]);

  const activeTopics = topics.filter((t) => t.isActive);

  const handleLongPress = (topicId: string, topicName: string) => {
    Alert.alert(topicName, undefined, [
      {
        text: 'Edit',
        onPress: () => router.push({ pathname: '/topic/edit', params: { id: topicId } }),
      },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          Alert.alert('Delete topic?', 'All affirmations and session history will be deleted.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete', style: 'destructive',
              onPress: async () => {
                await Promise.all([
                  ...affirmations.filter((a) => a.topicId === topicId).map((a) => removeAffirmation(a.id)),
                  ...sessions.filter((s) => s.topicId === topicId).map((s) => removeSession(s.id)),
                  removeTopic(topicId),
                ]);
              },
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting()}</Text>
            <Text style={s.dateStr}>{longDate()}</Text>
          </View>
          <TouchableOpacity
            style={[s.avatar, { backgroundColor: C.accentSoft }]}
            onPress={() => router.push('/topic/new')}
          >
            <Ionicons name="add" size={22} color={C.accent} />
          </TouchableOpacity>
        </View>

        {/* Streak hero */}
        <View style={s.hero}>
          <View style={s.heroInner}>
            <Text style={s.heroLabel}>Current streak</Text>
            <View style={s.heroCountRow}>
              <Text style={s.heroCount}>{streak}</Text>
              <Text style={s.heroDays}>days in a row</Text>
            </View>
            <View style={s.dots}>
              {weekDots.map((d, i) => (
                <View key={i} style={s.dotCol}>
                  <View style={[s.dot, d.done && s.dotDone, d.today && s.dotToday]} />
                  <Text style={s.dotLetter}>{d.letter}</Text>
                </View>
              ))}
            </View>
          </View>
          {/* decorative circles */}
          <View style={s.deco1} />
          <View style={s.deco2} />
        </View>

        {/* Today stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{todayMinutes}</Text>
            <Text style={s.statLabel}>minutes today</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{todayAff}</Text>
            <Text style={s.statLabel}>affirmations today</Text>
          </View>
        </View>

        {/* Intentions */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Your intentions</Text>
          <Text style={s.sectionSub}>Tap to begin</Text>
        </View>

        {activeTopics.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>
              No topics yet. Tap + to create your first intention.
            </Text>
          </View>
        ) : (
          activeTopics.map((t) => {
            const cnt = sessions.filter((x) => x.topicId === t.id).length;
            return (
              <TouchableOpacity
                key={t.id}
                style={s.topicCard}
                onPress={() =>
                  router.push({ pathname: '/session/setup', params: { topicId: t.id } })
                }
                onLongPress={() => handleLongPress(t.id, t.name)}
                delayLongPress={400}
                activeOpacity={0.7}
              >
                <View style={[s.swatch, { backgroundColor: t.soft, borderColor: t.color + '44' }]}>
                  <Text style={s.swatchEmoji}>{t.emoji}</Text>
                </View>
                <View style={s.topicInfo}>
                  <Text style={s.topicName}>{t.name}</Text>
                  {t.description ? (
                    <Text style={s.topicDesc} numberOfLines={1}>{t.description}</Text>
                  ) : null}
                </View>
                <View style={[s.chip, { backgroundColor: t.soft }]}>
                  <Text style={[s.chipText, { color: t.color }]}>{cnt} sessions</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Last session mood */}
        {todaySessions.length > 0 && todaySessions[0].moodAfter !== null && (
          <View style={s.moodCard}>
            <Ionicons name="heart-outline" size={16} color={C.sub} />
            <Text style={s.moodText}>
              You felt{' '}
              <Text style={{ color: C.accent, fontWeight: '700' }}>
                {MOOD_LABELS[todaySessions[0].moodAfter!]}
              </Text>{' '}
              {MOOD_EMOJIS[todaySessions[0].moodAfter!]} after your last session
            </Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={s.cta}
          onPress={() => router.push('/session/setup')}
          activeOpacity={0.85}
        >
          <Text style={s.ctaText}>Begin a session</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 14, fontWeight: '700', color: C.sub, letterSpacing: 0.2 },
  dateStr: { fontSize: 24, fontWeight: '700', color: C.text, marginTop: 2 },
  avatar: { width: 42, height: 42, borderRadius: R.full, alignItems: 'center', justifyContent: 'center' },

  hero: {
    backgroundColor: C.heroTo, borderRadius: R.xl, padding: 22, marginBottom: 14,
    overflow: 'hidden', position: 'relative',
    ...SHADOW, shadowColor: C.heroTo, shadowOpacity: 0.35, shadowRadius: 20,
  },
  heroInner: { zIndex: 2 },
  heroLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  heroCountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  heroCount: { fontSize: 54, fontWeight: '700', color: C.white, lineHeight: 60 },
  heroDays: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 8, marginTop: 18 },
  dotCol: { flex: 1, alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotDone: { backgroundColor: C.white },
  dotToday: { shadowColor: C.white, shadowOpacity: 0.6, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  dotLetter: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  deco1: { position: 'absolute', right: -28, top: -28, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.07)', zIndex: 1 },
  deco2: { position: 'absolute', right: 20, bottom: -40, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 1 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border },
  statNum: { fontSize: 30, fontWeight: '700', color: C.text },
  statLabel: { fontSize: 12, fontWeight: '700', color: C.sub, marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: C.text },
  sectionSub: { fontSize: 12, fontWeight: '700', color: C.sub },

  emptyCard: {
    backgroundColor: C.card, borderRadius: R.lg, padding: 24,
    borderWidth: 1, borderColor: C.border, alignItems: 'center', marginBottom: 16,
  },
  emptyText: { fontSize: 14, color: C.sub, textAlign: 'center', lineHeight: 20 },

  topicCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card, borderRadius: R.lg, padding: 14,
    borderWidth: 1, borderColor: C.border, marginBottom: 10,
  },
  swatch: { width: 46, height: 46, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  swatchEmoji: { fontSize: 22 },
  topicInfo: { flex: 1 },
  topicName: { fontSize: 16, fontWeight: '700', color: C.text },
  topicDesc: { fontSize: 12, color: C.sub, marginTop: 2 },
  chip: { borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 12, fontWeight: '800' },

  moodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.accentSoft, borderRadius: R.lg, padding: 12, marginTop: 6, marginBottom: 16,
  },
  moodText: { flex: 1, fontSize: 13, color: C.dim, lineHeight: 18 },

  cta: {
    marginTop: 8, backgroundColor: C.text, borderRadius: R.lg,
    paddingVertical: 17, alignItems: 'center',
    ...SHADOW, shadowColor: C.text, shadowOpacity: 0.3,
  },
  ctaText: { color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
