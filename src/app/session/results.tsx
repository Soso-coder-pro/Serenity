import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { MoodPicker } from '../../components/MoodPicker';
import { C, R, SHADOW } from '../../theme';

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function ResultsScreen() {
  const { topicId: tIdParam, duration: durParam, count: cntParam, moodBefore: mbParam } =
    useLocalSearchParams<{ topicId: string; duration: string; count: string; moodBefore: string }>();
  const router = useRouter();
  const { topics, addSession } = useApp();

  const [topicId, setTopicId] = useState(tIdParam ?? '');
  const [minutes, setMinutes] = useState(parseInt(durParam || '1', 10));
  const [affirmations, setAffirmations] = useState(parseInt(cntParam || '0', 10));
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const moodBefore = mbParam ? parseInt(mbParam, 10) : null;
  const topic = topics.find((t) => t.id === topicId) || topics[0];

  const save = async () => {
    if (!topic) return;
    await addSession({
      id: uid(),
      topicId: topic.id,
      topicName: topic.name,
      topicColor: topic.color,
      topicSoft: topic.soft,
      startedAt: new Date(Date.now() - minutes * 60000).toISOString(),
      durationMinutes: minutes,
      affirmationsReached: affirmations,
      notes: notes.trim(),
      moodBefore,
      moodAfter,
      mode: 'manual',
    });
    router.replace('/(tabs)/progress');
  };

  const discard = () => router.replace('/');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={s.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Success header */}
          <View style={s.successHeader}>
            <View style={[s.checkCircle, { backgroundColor: topic?.soft ?? C.accentSoft }]}>
              <Text style={[s.checkMark, { color: topic?.color ?? C.accent }]}>✓</Text>
            </View>
            <Text style={s.successTitle}>Session complete</Text>
            <Text style={s.successSub}>Take a breath, then log it in.</Text>
          </View>

          {/* Form card */}
          <View style={s.card}>
            {/* Topic */}
            <Text style={s.fieldLabel}>Topic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 0 }}>
              <View style={s.pillRow}>
                {topics.filter((t) => t.isActive).map((t) => {
                  const sel = t.id === topicId;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[s.pill, sel && { backgroundColor: t.color }]}
                      onPress={() => setTopicId(t.id)}
                    >
                      <Text style={[s.pillText, sel && s.pillTextSel]}>{t.emoji} {t.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={s.divider} />

            {/* Minutes */}
            <View style={s.fieldRow}>
              <Text style={s.fieldTitle}>Minutes</Text>
              <View style={s.stepper}>
                <TouchableOpacity style={s.stepBtn} onPress={() => setMinutes((v) => Math.max(0, v - 1))}>
                  <Text style={s.stepText}>−</Text>
                </TouchableOpacity>
                <Text style={s.stepVal}>{minutes}</Text>
                <TouchableOpacity style={s.stepBtn} onPress={() => setMinutes((v) => v + 1)}>
                  <Text style={s.stepText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.divider} />

            {/* Affirmations */}
            <View style={s.fieldRow}>
              <Text style={s.fieldTitle}>Affirmations reached</Text>
              <View style={s.stepper}>
                <TouchableOpacity style={s.stepBtn} onPress={() => setAffirmations((v) => Math.max(0, v - 1))}>
                  <Text style={s.stepText}>−</Text>
                </TouchableOpacity>
                <Text style={s.stepVal}>{affirmations}</Text>
                <TouchableOpacity style={s.stepBtn} onPress={() => setAffirmations((v) => v + 1)}>
                  <Text style={s.stepText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Mood after */}
          <View style={s.card}>
            <Text style={s.fieldLabel}>How do you feel now?</Text>
            <MoodPicker value={moodAfter} onChange={setMoodAfter} accentColor={topic?.color ?? C.accentMid} />
          </View>

          {/* Notes */}
          <View style={s.card}>
            <Text style={s.fieldLabel}>Reflection</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="What came up for you?"
              placeholderTextColor={C.sub}
              style={s.notesInput}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <TouchableOpacity style={s.discardBtn} onPress={discard}>
              <Text style={s.discardText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={save}>
              <Text style={s.saveText}>Save session</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  successHeader: { alignItems: 'center', marginBottom: 22 },
  checkCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  checkMark: { fontSize: 26, fontWeight: '700' },
  successTitle: { fontSize: 24, fontWeight: '700', color: C.text },
  successSub: { fontSize: 13, color: C.sub, fontWeight: '600', marginTop: 4 },

  card: {
    backgroundColor: C.card, borderRadius: R.lg, padding: 18,
    borderWidth: 1, borderColor: C.border, marginBottom: 14,
  },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: C.sub, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  pillRow: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  pill: { backgroundColor: C.statBg, borderRadius: R.full, paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { fontSize: 13, fontWeight: '700', color: C.dim },
  pillTextSel: { color: C.white },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },

  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  stepBtn: {
    width: 32, height: 32, borderRadius: R.full,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.statBg,
    alignItems: 'center', justifyContent: 'center',
  },
  stepText: { fontSize: 19, color: C.accent, lineHeight: 24 },
  stepVal: { fontSize: 22, fontWeight: '700', color: C.text, minWidth: 30, textAlign: 'center' },

  notesInput: {
    fontSize: 15, color: C.text, lineHeight: 22,
    minHeight: 80, backgroundColor: 'transparent',
  },

  actions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  discardBtn: {
    width: 110, paddingVertical: 16, borderRadius: R.lg,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card, alignItems: 'center',
  },
  discardText: { fontSize: 15, fontWeight: '800', color: C.sub },
  saveBtn: {
    flex: 1, paddingVertical: 16, borderRadius: R.lg,
    backgroundColor: C.text, alignItems: 'center',
    ...SHADOW, shadowColor: C.text, shadowOpacity: 0.25,
  },
  saveText: { color: C.white, fontWeight: '800', fontSize: 15 },
});
