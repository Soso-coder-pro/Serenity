import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { C, R, SHADOW, TOPIC_COLORS, TOPIC_EMOJIS } from '../../theme';

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export default function NewTopicScreen() {
  const { addTopic } = useApp();
  const router = useRouter();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [emoji, setEmoji] = useState(TOPIC_EMOJIS[0]);
  const [goalStr, setGoalStr] = useState('');

  const create = async () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    const { color, soft } = TOPIC_COLORS[colorIdx];
    const globalGoal = goalStr.trim() ? parseInt(goalStr.trim(), 10) : undefined;
    await addTopic({ id: uid(), name: name.trim(), description: desc.trim(), color, soft, emoji, isActive: true, createdAt: new Date().toISOString(), globalGoal });
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Name *</Text>
        <TextInput value={name} onChangeText={setName} placeholder="e.g. Self-confidence" placeholderTextColor={C.sub} style={s.input} maxLength={50} />

        <Text style={s.label}>Description</Text>
        <TextInput value={desc} onChangeText={setDesc} placeholder="Optional" placeholderTextColor={C.sub} style={[s.input, s.inputMulti]} multiline numberOfLines={3} maxLength={150} />

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
            <TouchableOpacity key={i} style={[s.colorBtn, { backgroundColor: color }, colorIdx === i && s.colorBtnSel]} onPress={() => setColorIdx(i)} />
          ))}
        </View>

        <Text style={s.label}>Global Goal (optional)</Text>
        <TextInput
          value={goalStr} onChangeText={setGoalStr}
          placeholder="e.g. 10000" placeholderTextColor={C.sub}
          style={s.input} keyboardType="numeric" maxLength={10}
        />

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

        <TouchableOpacity style={s.createBtn} onPress={create}>
          <Text style={s.createBtnText}>Create topic</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
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
  createBtn: { marginTop: 28, backgroundColor: C.text, borderRadius: R.lg, paddingVertical: 17, alignItems: 'center', ...SHADOW, shadowColor: C.text, shadowOpacity: 0.25 },
  createBtnText: { color: C.white, fontSize: 16, fontWeight: '800' },
});
