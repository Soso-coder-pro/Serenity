import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, R } from '../theme';
import { MOOD_LABELS, MOOD_EMOJIS } from '../theme';

interface Props {
  value: number | null;
  onChange: (n: number) => void;
  accentColor?: string;
}

export function MoodPicker({ value, onChange, accentColor = C.accentMid }: Props) {
  return (
    <View>
      <View style={s.row}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value !== null && n <= value;
          return (
            <TouchableOpacity
              key={n}
              style={[
                s.dot,
                active && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
              onPress={() => onChange(n)}
            >
              <Text style={[s.emoji, !active && s.emojiInactive]}>
                {MOOD_EMOJIS[n]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {value !== null && (
        <Text style={[s.label, { color: accentColor }]}>{MOOD_LABELS[value]}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dot: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    borderRadius: R.full,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.statBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  emojiInactive: { opacity: 0.45 },
  label: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
});
