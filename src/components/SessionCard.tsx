import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { Session } from '../types';

interface Props {
  session: Session;
  onDelete: (id: string) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SessionCard({ session, onDelete }: Props) {
  const handleDelete = () => {
    Alert.alert('Delete Session', 'Remove this session record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(session.id),
      },
    ]);
  };

  return (
    <View style={[styles.card, { borderLeftColor: session.topicColor }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{session.topicEmoji}</Text>
        <View style={styles.info}>
          <Text style={styles.topicName}>{session.topicName}</Text>
          <Text style={styles.date}>
            {formatDate(session.startedAt)} · {formatTime(session.startedAt)}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.subtext} />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <StatChip
          icon="time-outline"
          value={`${session.durationMinutes} min`}
          color={COLORS.primary}
        />
        <StatChip
          icon="star-outline"
          value={`${session.affirmationsReached} affirmations`}
          color={COLORS.warning}
        />
      </View>

      {session.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>{session.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

function StatChip({
  icon,
  value,
  color,
}: {
  icon: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon as any} size={14} color={color} />
      <Text style={[styles.chipText, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    ...SHADOW,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  topicName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.subtext,
    fontStyle: 'italic',
  },
});
