import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Platform, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { MoodPicker } from '../../components/MoodPicker';
import { C, R, SHADOW } from '../../theme';
import { SessionMode } from '../../types';

const MODES: { id: SessionMode; title: string; desc: string }[] = [
  { id: 'manual', title: 'Tap to count', desc: 'Tap as you complete each affirmation' },
  { id: 'target', title: 'Target & pace', desc: 'Set a goal and a gentle pacing guide' },
  { id: 'timer', title: 'Timer only', desc: 'Just breathe — log your count after' },
];

export default function SetupScreen() {
  const { topicId: paramTopicId } = useLocalSearchParams<{ topicId?: string }>();
  const router = useRouter();
  const { topics, hapticsEnabled, setHapticsEnabled } = useApp();

  const activeTopics = topics.filter((t) => t.isActive);
  const defaultTopic = activeTopics.find((t) => t.id === paramTopicId) || activeTopics[0];

  const [topicId, setTopicId] = useState(defaultTopic?.id ?? '');
  const [mode, setMode] = useState<SessionMode>('manual');
  const [target, setTarget] = useState(21);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);

  const topic = activeTopics.find((t) => t.id === topicId);

  const begin = () => {
    if (!topicId) return;
    router.replace({
      pathname: '/session/active',
      params: {
        topicId,
        mode,
        target: String(target),
        moodBefore: moodBefore !== null ? String(moodBefore) : '',
      },
    });
  };

  if (activeTopics.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No active topics</Text>
          <Text style={s.emptySub}>Create a topic first to begin a session.</Text>
          <TouchableOpacity style={s.createBtn} onPress={() => { router.back(); router.push('/topic/new'); }}>
            <Text style={s.createBtnText}>Create a topic</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <Text style={s.sectionLabel}>Topic</Text>
        {activeTopics.map((t) => {
          const sel = t.id === topicId;
          return (
            <TouchableOpacity
              key={t.id}
              style={[s.row, sel && { borderColor: t.color, ...SHADOW, shadowColor: t.color, shadowOpacity: 0.2 }]}
              onPress={() => setTopicId(t.id)}
            >
              <View style={[s.swatch, { backgroundColor: t.soft, borderColor: t.color + '44' }]}>
                <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
              </View>
              <Text style={s.rowTitle}>{t.name}</Text>
              <View style={[s.tick, sel && { backgroundColor: t.color, borderColor: t.color }]}>
                {sel && <Text style={s.tickCheck}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={s.sectionLabel}>How to count</Text>
        {MODES.map((m) => {
          const sel = m.id === mode;
          return (
            <TouchableOpacity
              key={m.id}
              style={[s.row, sel && { borderColor: C.accentMid }]}
              onPress={() => setMode(m.id)}
            >
              <View style={[s.radio, sel && { borderColor: C.accentMid, borderWidth: 6 }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{m.title}</Text>
                <Text style={s.rowDesc}>{m.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {mode === 'target' && (
          <>
            <Text style={s.sectionLabel}>Affirmation goal</Text>
            <View style={s.targetRow}>
              <View>
                <Text style={s.rowTitle}>Target count</Text>
                <Text style={s.rowDesc}>A gentle target to pace toward</Text>
              </View>
              <View style={s.stepper}>
                <TouchableOpacity style={s.stepBtn} onPress={() => setTarget((v) => Math.max(1, v - 1))}>
                  <Text style={s.stepBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={s.stepInput}
                  value={String(target)}
                  onChangeText={(t) => {
                    const n = parseInt(t, 10);
                    if (!isNaN(n) && n > 0) setTarget(n);
                    else if (t === '') setTarget(1);
                  }}
                  keyboardType="numeric"
                  selectTextOnFocus
                  returnKeyType="done"
                />
                <TouchableOpacity style={s.stepBtn} onPress={() => setTarget((v) => v + 1)}>
                  <Text style={s.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <Text style={s.sectionLabel}>How do you feel right now?</Text>
        <View style={s.moodCard}>
          <MoodPicker value={moodBefore} onChange={setMoodBefore} accentColor={topic?.color ?? C.accentMid} />
        </View>

        {Platform.OS !== 'web' && (
          <>
            <Text style={s.sectionLabel}>Settings</Text>
            <View style={s.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>Vibration on each affirmation</Text>
                <Text style={s.rowDesc}>Feel a light tap when you count one</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ true: C.accent }}
                thumbColor={C.white}
              />
            </View>
          </>
        )}

        <TouchableOpacity
          style={[s.beginBtn, !topicId && s.beginBtnDisabled]}
          onPress={begin}
          disabled={!topicId}
        >
          <Text style={s.beginBtnText}>Begin</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: C.sub,
    letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 24, marginBottom: 10,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: C.card, borderRadius: R.lg, padding: 14,
    borderWidth: 2, borderColor: C.border, marginBottom: 10,
  },
  swatch: { width: 34, height: 34, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  rowTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },
  rowDesc: { fontSize: 12, color: C.sub, marginTop: 2 },
  tick: { width: 24, height: 24, borderRadius: R.full, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  tickCheck: { color: C.white, fontSize: 13, fontWeight: '700' },
  radio: { width: 20, height: 20, borderRadius: R.full, borderWidth: 2, borderColor: C.border, backgroundColor: C.white },

  targetRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.card, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: { width: 34, height: 34, borderRadius: R.full, borderWidth: 1, borderColor: C.border, backgroundColor: C.statBg, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, color: C.accent, lineHeight: 24 },
  stepInput: {
    fontSize: 22, fontWeight: '700', color: C.text,
    minWidth: 56, textAlign: 'center',
    borderBottomWidth: 2, borderBottomColor: C.accent,
    paddingHorizontal: 4, paddingVertical: 2,
  },

  moodCard: { backgroundColor: C.card, borderRadius: R.lg, padding: 18, borderWidth: 1, borderColor: C.border },

  beginBtn: {
    marginTop: 28, backgroundColor: C.text, borderRadius: R.lg,
    paddingVertical: 17, alignItems: 'center',
    ...SHADOW, shadowColor: C.text, shadowOpacity: 0.3,
  },
  beginBtnDisabled: { opacity: 0.4 },
  beginBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySub: { fontSize: 15, color: C.sub, textAlign: 'center', marginBottom: 24 },
  createBtn: { backgroundColor: C.accent, borderRadius: R.lg, paddingHorizontal: 24, paddingVertical: 14 },
  createBtnText: { color: C.white, fontWeight: '700', fontSize: 16 },
});
