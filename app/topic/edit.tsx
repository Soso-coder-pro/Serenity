import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { C, R, SHADOW, TOPIC_COLORS, TOPIC_EMOJIS } from '../../src/theme';

export default function EditTopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { topics, updateTopic } = useApp();
  const router = useRouter();

  const topic = topics.find((t) => t.id === id);

  const initialColorIdx = topic
    ? TOPIC_COLORS.findIndex((tc) => tc.color === topic.color)
    : 0;

  const [name, setName] = useState(topic?.name ?? '');
  const [desc, setDesc] = useState(topic?.description ?? '');
  const [colorIdx, setColorIdx] = useState(initialColorIdx >= 0 ? initialColorIdx : 0);
  const [emoji, setEmoji] = useState(topic?.emoji ?? TOPIC_EMOJIS[0]);

  if (!topic) {
    return <View style={s.center}><Text style={s.sub}>Topic not found.</Text></View>;
  }

  const save = async () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    const { color, soft } = TOPIC_COLORS[colorIdx];
    await updateTopic({ ...topic, name: name.trim(), description: desc.trim(), color, soft, emoji });
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Name *</Text>
        <TextInput
          value={name} onChangeText={setName}
          placeholder="e.g. Self-confidence" placeholderTextColor={C.sub}
          style={s.input} maxLength={50}
        />

        <Text style={s.label}>Description</Text>
        <TextInput
          value={desc} onChangeText={setDesc}
          placeholder="Optional" placeholderTextColor={C.sub}
          style={[s.input, s.inputMulti]} multiline numberOfLines={3} maxLength={150}
        />

        <Text style={s.label}>Emoji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.emojiRow}>
            {TOPIC_EMOJIS.map((e) => (
              <TouchableOpacity key={e} style={[s.emojiBtn, emoji === e && s.emojiBtnSel]} onPress={() => setEmoji(e)}>
                <Text style={s.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={s.label}>Color</Text>
        <View style={s.colorRow}>
          {TOPIC_COLORS.map(({ color }, i) => (
            <TouchableOpacity
              key={i}
              style={[s.colorBtn, { backgroundColor: color }, colorIdx === i && s.colorBtnSel]}
              onPress={() => setColorIdx(i)}
            />
          ))}
        </View>

        {/* Preview */}
        <View style={[s.preview, { borderLeftColor: TOPIC_COLORS[colorIdx].color }]}>
          <View style={[s.swatch, { backgroundColor: TOPIC_COLORS[colorIdx].soft }]}>
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.previewName}>{name || 'Topic name'}</Text>
            {desc ? <Text style={s.previewDesc}>{desc}</Text> : null}
          </View>
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={save}>
          <Text style={s.saveBtnText}>Save changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sub: { color: C.sub },
  label: { fontSize: 11, fontWeight: '800', color: C.sub, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 22, marginBottom: 8 },
  input: { backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.text },
  inputMulti: { height: 90, textAlignVertical: 'top' },
  emojiRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  emojiBtn: { width: 48, height: 48, borderRadius: R.sm, borderWidth: 2, borderColor: 'transparent', backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  emojiBtnSel: { borderColor: C.accent, backgroundColor: C.accentSoft },
  emojiText: { fontSize: 24 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: 'transparent' },
  colorBtnSel: { borderColor: C.text },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, marginTop: 24 },
  swatch: { width: 44, height: 44, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 16, fontWeight: '700', color: C.text },
  previewDesc: { fontSize: 12, color: C.sub, marginTop: 2 },
  saveBtn: { marginTop: 28, backgroundColor: C.text, borderRadius: R.lg, paddingVertical: 17, alignItems: 'center', ...SHADOW, shadowColor: C.text, shadowOpacity: 0.25 },
  saveBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },
});
