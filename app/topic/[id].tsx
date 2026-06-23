import React, { useState, useLayoutEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { AffirmationItem } from '../../src/components/AffirmationItem';
import { C, R, SHADOW } from '../../src/theme';
import { Affirmation } from '../../src/types';

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const nav = useNavigation();
  const { topics, affirmations, updateTopic, addAffirmation, updateAffirmation, removeAffirmation } = useApp();

  const topic = topics.find((t) => t.id === id);
  const active = affirmations.filter((a) => a.topicId === id && a.isActive);
  const archived = affirmations.filter((a) => a.topicId === id && !a.isActive);

  const [newText, setNewText] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useLayoutEffect(() => {
    if (topic) nav.setOptions({ title: `${topic.emoji} ${topic.name}` });
  }, [topic, nav]);

  if (!topic) return <View style={s.center}><Text style={s.sub}>Topic not found.</Text></View>;

  const addAff = async () => {
    if (!newText.trim()) return;
    await addAffirmation({ id: uid(), topicId: id, text: newText.trim(), isActive: true, createdAt: new Date().toISOString() });
    setNewText('');
  };

  const toggleTopic = () => {
    Alert.alert(
      topic.isActive ? 'End this topic?' : 'Reactivate?',
      topic.isActive ? 'It will be archived. You can reactivate it later.' : 'It will appear as active again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: topic.isActive ? 'End' : 'Reactivate', style: topic.isActive ? 'destructive' : 'default',
          onPress: () => updateTopic({ ...topic, isActive: !topic.isActive, endedAt: topic.isActive ? new Date().toISOString() : undefined }) },
      ]
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={s.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Topic header */}
          <View style={[s.topicBadge, { backgroundColor: topic.soft }]}>
            <Text style={s.topicEmoji}>{topic.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.topicName, { color: topic.color }]}>{topic.name}</Text>
              {topic.description ? <Text style={s.topicDesc}>{topic.description}</Text> : null}
            </View>
            <TouchableOpacity
              style={[s.statusBtn, { backgroundColor: topic.isActive ? '#FFE5E5' : '#E5FFE9' }]}
              onPress={toggleTopic}
            >
              <Text style={[s.statusBtnText, { color: topic.isActive ? C.danger : C.success }]}>
                {topic.isActive ? 'End' : 'Reactivate'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Start session */}
          {topic.isActive && (
            <TouchableOpacity
              style={[s.startBtn, { backgroundColor: topic.color }]}
              onPress={() => router.push({ pathname: '/session/setup', params: { topicId: id } })}
            >
              <Ionicons name="play" size={18} color={C.white} />
              <Text style={s.startBtnText}>Start a session</Text>
            </TouchableOpacity>
          )}

          {/* Add affirmation */}
          <Text style={s.sectionLabel}>Affirmations</Text>
          <View style={s.addRow}>
            <TextInput
              value={newText} onChangeText={setNewText}
              placeholder="Add an affirmation…" placeholderTextColor={C.sub}
              style={s.addInput} returnKeyType="done" onSubmitEditing={addAff}
            />
            <TouchableOpacity style={[s.addBtn, { backgroundColor: topic.color }]} onPress={addAff}>
              <Ionicons name="add" size={22} color={C.white} />
            </TouchableOpacity>
          </View>

          {active.length === 0 && (
            <Text style={s.emptyAff}>No affirmations yet. Add one above.</Text>
          )}
          {active.map((a: Affirmation) => (
            <AffirmationItem key={a.id} affirmation={a}
              onToggle={(x) => updateAffirmation({ ...x, isActive: !x.isActive })}
              onDelete={removeAffirmation}
              onEdit={updateAffirmation}
            />
          ))}

          {archived.length > 0 && (
            <TouchableOpacity style={s.archivedBtn} onPress={() => setShowArchived((v) => !v)}>
              <Text style={s.archivedBtnText}>
                {showArchived ? 'Hide' : 'Show'} {archived.length} archived
              </Text>
            </TouchableOpacity>
          )}
          {showArchived && archived.map((a: Affirmation) => (
            <AffirmationItem key={a.id} affirmation={a}
              onToggle={(x) => updateAffirmation({ ...x, isActive: !x.isActive })}
              onDelete={removeAffirmation}
              onEdit={updateAffirmation}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sub: { color: C.sub },
  topicBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: R.lg, padding: 16, marginBottom: 16 },
  topicEmoji: { fontSize: 32 },
  topicName: { fontSize: 20, fontWeight: '800' },
  topicDesc: { fontSize: 13, color: C.sub, marginTop: 2 },
  statusBtn: { borderRadius: R.full, paddingHorizontal: 12, paddingVertical: 6 },
  statusBtnText: { fontSize: 13, fontWeight: '700' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: R.lg, paddingVertical: 14, marginBottom: 24, ...SHADOW },
  startBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: C.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  addInput: { flex: 1, backgroundColor: C.card, borderRadius: R.sm, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: C.text },
  addBtn: { width: 46, height: 46, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  emptyAff: { fontSize: 14, color: C.sub, textAlign: 'center', marginVertical: 20 },
  archivedBtn: { alignSelf: 'center', marginVertical: 10 },
  archivedBtnText: { fontSize: 13, color: C.sub, fontWeight: '600' },
});
