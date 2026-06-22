import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';
import { Affirmation } from '../../src/types';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export default function ActiveSessionScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { topics, affirmations, addSession } = useApp();

  const topic = topics.find((t) => t.id === topicId);
  const topicAffirmations = affirmations.filter(
    (a) => a.topicId === topicId && a.isActive
  );

  const startTimeRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [paused, setPaused] = useState(false);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);

  // Handle app going to background
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (
        appStateRef.current === 'active' &&
        (next === 'background' || next === 'inactive')
      ) {
        if (!paused) {
          pausedAtRef.current = Date.now();
        }
      } else if (next === 'active' && appStateRef.current !== 'active') {
        if (!paused && pausedAtRef.current !== null) {
          totalPausedRef.current += Date.now() - pausedAtRef.current;
          pausedAtRef.current = null;
        }
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [paused]);

  // Timer tick
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setElapsed(
        Math.floor((Date.now() - startTimeRef.current - totalPausedRef.current) / 1000)
      );
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEnd = useCallback(() => {
    const durationMinutes = Math.max(1, Math.round(elapsed / 60));
    Alert.alert(
      'End Session?',
      `Duration: ${formatElapsed(elapsed)}\nAffirmations reached: ${checked.size}`,
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Save & End',
          onPress: async () => {
            if (!topic) return;
            await addSession({
              id: uid(),
              topicId: topic.id,
              topicName: topic.name,
              topicColor: topic.color,
              topicEmoji: topic.emoji,
              startedAt: new Date(startTimeRef.current).toISOString(),
              endedAt: new Date().toISOString(),
              durationMinutes,
              affirmationsReached: checked.size,
              notes: notes.trim(),
            });
            router.replace(`/topic/${topicId}`);
          },
        },
      ]
    );
  }, [elapsed, checked, notes, topic, addSession, router, topicId]);

  if (!topic) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Topic not found.</Text>
      </View>
    );
  }

  const progress = topicAffirmations.length
    ? checked.size / topicAffirmations.length
    : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Topic badge */}
        <View style={[styles.topicBadge, { backgroundColor: topic.color + '22' }]}>
          <Text style={styles.topicEmoji}>{topic.emoji}</Text>
          <Text style={[styles.topicName, { color: topic.color }]}>
            {topic.name}
          </Text>
        </View>

        {/* Timer */}
        <View style={[styles.timerCard, { borderColor: topic.color }]}>
          <Text style={[styles.timerText, { color: topic.color }]}>
            {formatElapsed(elapsed)}
          </Text>
          <TouchableOpacity
            style={styles.pauseBtn}
            onPress={() => {
              if (paused) {
                totalPausedRef.current += Date.now() - (pausedAtRef.current ?? Date.now());
                pausedAtRef.current = null;
              } else {
                pausedAtRef.current = Date.now();
              }
              setPaused((v) => !v);
            }}
          >
            <Ionicons
              name={paused ? 'play-circle' : 'pause-circle'}
              size={44}
              color={topic.color}
            />
          </TouchableOpacity>
          {paused && (
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedText}>PAUSED</Text>
            </View>
          )}
        </View>

        {/* Progress bar */}
        {topicAffirmations.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Affirmations</Text>
              <Text style={[styles.progressCount, { color: topic.color }]}>
                {checked.size} / {topicAffirmations.length}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: topic.color,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Affirmations checklist */}
        {topicAffirmations.length > 0 ? (
          <View style={styles.affirmationsList}>
            {topicAffirmations.map((a: Affirmation) => {
              const done = checked.has(a.id);
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.affirmationRow, done && styles.affirmationRowDone]}
                  onPress={() => toggleCheck(a.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      done && { backgroundColor: topic.color, borderColor: topic.color },
                    ]}
                  >
                    {done && (
                      <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.affirmationText,
                      done && styles.affirmationTextDone,
                    ]}
                  >
                    {a.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.noAffirmations}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.subtext} />
            <Text style={styles.noAffirmationsText}>
              No affirmations for this topic yet. You can still track your session time.
            </Text>
          </View>
        )}

        {/* Notes */}
        <Text style={styles.notesLabel}>Session Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it go? Any insights…"
          placeholderTextColor={COLORS.subtext}
          style={styles.notesInput}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* End session button */}
        <TouchableOpacity
          style={[styles.endBtn, { backgroundColor: topic.color }]}
          onPress={handleEnd}
        >
          <Ionicons name="stop-circle-outline" size={22} color={COLORS.white} />
          <Text style={styles.endBtnText}>End Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: COLORS.subtext },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 20,
  },
  topicEmoji: { fontSize: 28 },
  topicName: { fontSize: 20, fontWeight: '800', flex: 1 },
  timerCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    ...SHADOW,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  pauseBtn: {
    marginTop: 4,
  },
  pausedBadge: {
    marginTop: 10,
    backgroundColor: COLORS.warning + '33',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  pausedText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '800',
    letterSpacing: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  affirmationsList: {
    gap: 8,
    marginBottom: 20,
  },
  affirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  affirmationRowDone: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmationText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 21,
  },
  affirmationTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.subtext,
  },
  noAffirmations: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noAffirmationsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.subtext,
    lineHeight: 20,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    height: 100,
    marginBottom: 24,
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    ...SHADOW,
  },
  endBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
