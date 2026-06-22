import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { Topic, Session } from '../types';

interface Props {
  topic: Topic;
  sessions: Session[];
  onPress: () => void;
}

export function TopicCard({ topic, sessions, onPress }: Props) {
  const topicSessions = sessions.filter((s) => s.topicId === topic.id);
  const totalMinutes = topicSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );
  const totalAffirmations = topicSessions.reduce(
    (sum, s) => sum + s.affirmationsReached,
    0
  );

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: topic.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.emojiBox, { backgroundColor: topic.color + '22' }]}>
          <Text style={styles.emoji}>{topic.emoji}</Text>
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.name} numberOfLines={1}>
            {topic.name}
          </Text>
          {topic.description ? (
            <Text style={styles.desc} numberOfLines={1}>
              {topic.description}
            </Text>
          ) : null}
        </View>
        {!topic.isActive && (
          <View style={styles.endedBadge}>
            <Text style={styles.endedText}>Ended</Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <Stat label="Sessions" value={String(topicSessions.length)} />
        <Stat label="Minutes" value={String(totalMinutes)} />
        <Stat label="Affirmations" value={String(totalAffirmations)} />
      </View>
    </TouchableOpacity>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...SHADOW,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  titleArea: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  desc: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 2,
  },
  endedBadge: {
    backgroundColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  endedText: {
    fontSize: 11,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.subtext,
    marginTop: 2,
  },
});
