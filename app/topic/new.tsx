import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { useApp } from '../../src/context/AppContext';
import { COLORS, TOPIC_COLORS, TOPIC_EMOJIS, RADIUS, SHADOW } from '../../src/theme';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function NewTopicScreen() {
  const { addTopic } = useApp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(TOPIC_COLORS[0]);
  const [emoji, setEmoji] = useState(TOPIC_EMOJIS[0]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this topic.');
      return;
    }
    await addTopic({
      id: uid(),
      name: name.trim(),
      description: description.trim(),
      color,
      emoji,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Topic Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Self-confidence, Gratitude…"
          placeholderTextColor={COLORS.subtext}
          style={styles.input}
          maxLength={50}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Optional short description"
          placeholderTextColor={COLORS.subtext}
          style={[styles.input, styles.inputMulti]}
          multiline
          numberOfLines={3}
          maxLength={150}
        />

        <Text style={styles.label}>Emoji</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pickerRow}
        >
          {TOPIC_EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[
                styles.emojiBtn,
                emoji === e && styles.emojiBtnActive,
              ]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {TOPIC_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorBtn,
                { backgroundColor: c },
                color === c && styles.colorBtnActive,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
          <Text style={styles.createBtnText}>Create Topic</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  inputMulti: {
    height: 88,
    textAlignVertical: 'top',
  },
  pickerRow: {
    marginBottom: 4,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '18',
  },
  emojiText: { fontSize: 24 },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorBtnActive: {
    borderColor: COLORS.text,
  },
  createBtn: {
    marginTop: 36,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...SHADOW,
  },
  createBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
