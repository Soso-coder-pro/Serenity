import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../theme';
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
    Alert.alert('Delete Affirmation', 'Remove this affirmation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(affirmation.id),
      },
    ]);
  };

  const handleSaveEdit = () => {
    if (text.trim()) {
      onEdit({ ...affirmation, text: text.trim() });
    }
    setEditing(false);
  };

  return (
    <View
      style={[
        styles.item,
        !affirmation.isActive && styles.itemInactive,
      ]}
    >
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => onToggle(affirmation)}
      >
        <Ionicons
          name={affirmation.isActive ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={affirmation.isActive ? COLORS.success : COLORS.border}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        {editing ? (
          <TextInput
            value={text}
            onChangeText={setText}
            style={styles.input}
            autoFocus
            onBlur={handleSaveEdit}
            onSubmitEditing={handleSaveEdit}
            multiline
          />
        ) : (
          <Text
            style={[
              styles.text,
              !affirmation.isActive && styles.textInactive,
            ]}
          >
            {affirmation.text}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => setEditing((v) => !v)}
          style={styles.actionBtn}
        >
          <Ionicons
            name={editing ? 'checkmark' : 'pencil-outline'}
            size={18}
            color={COLORS.subtext}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemInactive: {
    opacity: 0.5,
  },
  toggleBtn: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 21,
  },
  textInactive: {
    textDecorationLine: 'line-through',
    color: COLORS.subtext,
  },
  input: {
    fontSize: 15,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
});
