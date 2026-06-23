import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { C, R, SHADOW, COLOR_PALETTE, TOPIC_EMOJIS, hexToSoft } from '../../theme';

export default function EditTopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { topics, updateTopic } = useApp();
  const router = useRouter();

  const topic = topics.find((t) => t.id === id);

  const [name, setName] = useState(topic?.name ?? '');
  const [desc, setDesc] = useState(topic?.description ?? '');
  const [color, setColor] = useState(topic?.color ?? COLOR_PALETTE[0]);
  const [emoji, setEmoji] = useState(topic?.emoji ?? TOPIC_EMOJIS[0]);
  const [goalStr, setGoalStr] = useState(topic?.globalGoal ? String(topic.globalGoal) : '');

  if (!topic) {
    return <View style={s.center}><Text style={s.sub}>Topic not found.</Text></View>;
  }

  const soft = hexToSoft(color);

  const save = async () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    const globalGoal = goalStr.trim() ? parseInt(goalStr.trim(), 10) : undefined;
    await updateTopic({ ...topic, name: name.trim(), description: desc.trim(), color, soft, emoji, globalGoal });
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
        <ScrollView style={s.gridScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <View style={s.emojiGrid}>
            {TOPIC_EMOJIS.map((e, i) => (
              <TouchableOpacity key={`${e}-${i}`} style={[s.emojiBtn, emoji === e && s.emojiBtnSel]} onPress={() => setEmoji(e)}>
                <Text style={s.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={s.label}>Colour</Text>
        <ScrollView style={s.gridScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <View style={s.colorGrid}>
            {COLOR_PALETTE.map((col) => (
              <TouchableOpacity
                key={col}
                style={[s.colorBtn, { backgroundColor: col }, color === col && s.colorBtnSel]}
                onPress={() => setColor(col)}
              >
                {color === col && <Text style={s.colorCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={s.label}>Global Goal (optional)</Text>
        <TextInput
          value={goalStr} onChangeText={setGoalStr}
          placeholder="e.g. 10000" placeholderTextColor={C.sub}
          style={s.input} keyboardType="numeric" maxLength={10}
        />

        {/* Preview */}
        <View style={[s.preview, { borderLeftColor: color }]}>
          <View style={[s.swatch, { backgroundColor: soft }]}>
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.previewName, { color }]}>{name || 'Topic name'}</Text>
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

  gridScroll: { maxHeight: 180 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: { width: 46, height: 46, borderRadius: R.sm, borderWidth: 2, borderColor: 'transparent', backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  emojiBtnSel: { borderColor: C.accent, backgroundColor: C.accentSoft },
  emojiText: { fontSize: 22 },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  colorBtnSel: { borderColor: C.white, borderWidth: 3, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  colorCheck: { color: C.white, fontSize: 16, fontWeight: '800' },

  preview: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, marginTop: 24 },
  swatch: { width: 44, height: 44, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 16, fontWeight: '700' },
  previewDesc: { fontSize: 12, color: C.sub, marginTop: 2 },
  saveBtn: { marginTop: 28, backgroundColor: C.text, borderRadius: R.lg, paddingVertical: 17, alignItems: 'center', ...SHADOW, shadowColor: C.text, shadowOpacity: 0.25 },
  saveBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },
});
