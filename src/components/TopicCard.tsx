import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, R, SHADOW } from '../theme';
import { Topic, Session } from '../types';

interface Props {
  topic: Topic;
  sessions: Session[];
  onPress: () => void;
}

export function TopicCard({ topic, sessions, onPress }: Props) {
  const ts = sessions.filter((s) => s.topicId === topic.id);
  const totalMinutes = ts.reduce((a, s) => a + s.durationMinutes, 0);
  const totalAff = ts.reduce((a, s) => a + s.affirmationsReached, 0);

  return (
    <TouchableOpacity style={[s.card, { borderLeftColor: topic.color }]} onPress={onPress} activeOpacity={0.7}>
      <View style={s.header}>
        <View style={[s.emojiBox, { backgroundColor: topic.soft }]}>
          <Text style={s.emoji}>{topic.emoji}</Text>
        </View>
        <View style={s.titleArea}>
          <Text style={s.name} numberOfLines={1}>{topic.name}</Text>
          {topic.description ? <Text style={s.desc} numberOfLines={1}>{topic.description}</Text> : null}
        </View>
        {!topic.isActive && (
          <View style={s.endedBadge}><Text style={s.endedText}>Ended</Text></View>
        )}
      </View>
      <View style={s.stats}>
        {[['Sessions', ts.length], ['Minutes', totalMinutes], ['Affirmations', totalAff]].map(([label, val]) => (
          <View key={label as string} style={s.stat}>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: R.md, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: C.border, ...SHADOW },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  emojiBox: { width: 44, height: 44, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji: { fontSize: 22 },
  titleArea: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: C.text },
  desc: { fontSize: 13, color: C.sub, marginTop: 2 },
  endedBadge: { backgroundColor: C.statBg, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  endedText: { fontSize: 11, color: C.sub, fontWeight: '600' },
  stats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700', color: C.text },
  statLabel: { fontSize: 11, color: C.sub, marginTop: 2 },
});
