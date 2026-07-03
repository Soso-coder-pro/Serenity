import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, SHADOW, MOOD_LABELS, MOOD_EMOJIS } from '../theme';
import { Session } from '../types';

interface Props {
  session: Session;
  onDelete: (id: string) => void;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function SessionCard({ session, onDelete }: Props) {
  const del = () => {
    Alert.alert('Delete session?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(session.id) },
    ]);
  };

  return (
    <View style={[s.card, { borderLeftColor: session.topicColor }]}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.topic}>{session.topicName}</Text>
          <Text style={s.date}>{fmtDate(session.startedAt)} · {fmtTime(session.startedAt)}</Text>
        </View>
        <TouchableOpacity onPress={del}><Ionicons name="trash-outline" size={18} color={C.sub} /></TouchableOpacity>
      </View>
      <View style={s.chips}>
        <View style={s.chip}><Text style={s.chipText}>{session.durationMinutes} min</Text></View>
        <View style={s.chip}><Text style={s.chipText}>{session.affirmationsReached} affirmations</Text></View>
        {session.moodAfter !== null && session.moodAfter !== undefined && (
          <View style={[s.chip, { backgroundColor: C.accentSoft }]}>
            <Text style={[s.chipText, { color: C.accent }]}>{MOOD_EMOJIS[session.moodAfter]} {MOOD_LABELS[session.moodAfter]}</Text>
          </View>
        )}
      </View>
      {session.notes ? <Text style={s.notes}>"{session.notes}"</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: R.md, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: C.border, ...SHADOW },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  topic: { fontSize: 15, fontWeight: '700', color: C.text },
  date: { fontSize: 12, color: C.sub, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: C.statBg, borderRadius: R.sm, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 12, fontWeight: '700', color: C.dim },
  notes: { marginTop: 8, fontSize: 13, color: C.sub, fontStyle: 'italic' },
});
