import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R } from '../theme';
import { Affirmation } from '../types';

interface Props {
  affirmation: Affirmation;
  onToggle: (a: Affirmation) => void;
  onDelete: (id: string) => void;
  onEdit: (a: Affirmation) => void;
}

export function AffirmationItem({ affirmation, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(affirmation.text);

  const handleDelete = () => {
    Alert.alert('Delete affirmation', 'Remove this affirmation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(affirmation.id) },
    ]);
  };

  const handleSaveEdit = () => {
    if (text.trim()) onEdit({ ...affirmation, text: text.trim() });
    setEditing(false);
  };

  return (
    <View style={[s.item, !affirmation.isActive && s.itemInactive]}>
      <TouchableOpacity style={s.toggle} onPress={() => onToggle(affirmation)}>
        <Ionicons
          name={affirmation.isActive ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={affirmation.isActive ? C.success : C.border}
        />
      </TouchableOpacity>

      <View style={s.content}>
        {editing ? (
          <TextInput
            value={text} onChangeText={setText}
            style={s.input} autoFocus
            onBlur={handleSaveEdit} onSubmitEditing={handleSaveEdit}
            multiline
          />
        ) : (
          <Text style={[s.text, !affirmation.isActive && s.textInactive]}>
            {affirmation.text}
          </Text>
        )}
      </View>

      <View style={s.actions}>
        <TouchableOpacity onPress={() => setEditing((v) => !v)} style={s.actionBtn}>
          <Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={18} color={C.sub} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={s.actionBtn}>
          <Ionicons name="trash-outline" size={18} color={C.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: R.sm,
    padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
  },
  itemInactive: { opacity: 0.5 },
  toggle: { marginRight: 10 },
  content: { flex: 1 },
  text: { fontSize: 15, color: C.text, lineHeight: 21 },
  textInactive: { textDecorationLine: 'line-through', color: C.sub },
  input: {
    fontSize: 15, color: C.text,
    borderBottomWidth: 1, borderBottomColor: C.accent,
    paddingVertical: 2,
  },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 4 },
});
