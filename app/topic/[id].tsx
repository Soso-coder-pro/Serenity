import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { AffirmationItem } from '../../src/components/AffirmationItem';
import { COLORS, RADIUS, SHADOW } from '../../src/theme';
import { Affirmation } from '../../src/types';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    topics,
    affirmations,
    updateTopic,
    addAffirmation,
    updateAffirmation,
    removeAffirmation,
  } = useApp();

  const topic = topics.find((t) => t.id === id);
  const topicAffirmations = affirmations.filter(
    (a) => a.topicId === id && a.isActive
  );
  const archivedAffirmations = affirmations.filter(
    (a) => a.topicId === id && !a.isActive
  );

  const [newText, setNewText] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useLayoutEffect(() => {
    if (topic) {
      navigation.setOptions({ title: `${topic.emoji} ${topic.name}` });
    }
  }, [topic, navigation]);

  if (!topic) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Topic not found.</Text>
      </View>
    );
  }

  const handleAddAffirmation = async () => {
    if (!newText.trim()) return;
    await addAffirmation({
      id: uid(),
      topicId: id,
      text: newText.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    setNewText('');
  };

  const handleToggleAffirmation = async (a: Affirmation) => {
    await updateAffirmation({ ...a, isActive: !a.isActive });
  };

  const handleEditAffirmation = async (a: Affirmation) => {
    await updateAffirmation(a);
  };

  const handleToggleTopic = () => {
    const action = topic.isActive ? 'end' : 'reactivate';
    Alert.alert(
      topic.isActive ? 'End Topic?' : 'Reactivate Topic?',
      topic.isActive
        ? 'This topic will be archived. You can reactivate it later.'
        : 'This topic will become active again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: topic.isActive ? 'End' : 'Reactivate',
          style: topic.isActive ? 'destructive' : 'default',
          onPress: async () => {
            await updateTopic({
              ...topic,
              isActive: !topic.isActive,
              endedAt: topic.isActive ? new Date().toISOString() : undefined,
            });
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Topic header */}
          <View
            style={[styles.topicHeader, { backgroundColor: topic.color + '22' }]}
          >
            <Text style={styles.topicEmoji}>{topic.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.topicName, { color: topic.color }]}>
                {topic.name}
              </Text>
              {topic.description ? (
                <Text style={styles.topicDesc}>{topic.description}</Text>
              ) : null}
              {!topic.isActive && (
                <Text style={styles.endedLabel}>
                  Ended {new Date(topic.endedAt!).toLocaleDateString()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={handleToggleTopic}
              style={[
                styles.statusBtn,
                { backgroundColor: topic.isActive ? COLORS.danger + '22' : COLORS.success + '22' },
              ]}
            >
              <Ionicons
                name={topic.isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                size={20}
                color={topic.isActive ? COLORS.danger : COLORS.success}
              />
              <Text
                style={[
                  styles.statusBtnText,
                  { color: topic.isActive ? COLORS.danger : COLORS.success },
                ]}
              >
                {topic.isActive ? 'End' : 'Reactivate'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Start session */}
          {topic.isActive && (
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: topic.color }]}
              onPress={() =>
                router.push(
                  `/session/active?topicId=${id}`
                )
              }
            >
              <Ionicons name="play" size={20} color={COLORS.white} />
              <Text style={styles.startBtnText}>Start Session</Text>
            </TouchableOpacity>
          )}

          {/* Add affirmation */}
          <Text style={styles.sectionTitle}>Affirmations</Text>
          <View style={styles.addRow}>
            <TextInput
              value={newText}
              onChangeText={setNewText}
              placeholder="Add an affirmation…"
              placeholderTextColor={COLORS.subtext}
              style={styles.addInput}
              returnKeyType="done"
              onSubmitEditing={handleAddAffirmation}
            />
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: topic.color }]}
              onPress={handleAddAffirmation}
            >
              <Ionicons name="add" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Active affirmations */}
          {topicAffirmations.length === 0 && (
            <Text style={styles.noAffirmations}>
              No affirmations yet. Add one above.
            </Text>
          )}
          {topicAffirmations.map((a) => (
            <AffirmationItem
              key={a.id}
              affirmation={a}
              onToggle={handleToggleAffirmation}
              onDelete={removeAffirmation}
              onEdit={handleEditAffirmation}
            />
          ))}

          {/* Archived affirmations toggle */}
          {archivedAffirmations.length > 0 && (
            <TouchableOpacity
              style={styles.archivedToggle}
              onPress={() => setShowArchived((v) => !v)}
            >
              <Ionicons
                name={showArchived ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.subtext}
              />
              <Text style={styles.archivedToggleText}>
                {showArchived ? 'Hide' : 'Show'} {archivedAffirmations.length} archived
              </Text>
            </TouchableOpacity>
          )}
          {showArchived &&
            archivedAffirmations.map((a) => (
              <AffirmationItem
                key={a.id}
                affirmation={a}
                onToggle={handleToggleAffirmation}
                onDelete={removeAffirmation}
                onEdit={handleEditAffirmation}
              />
            ))}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: { fontSize: 16, color: COLORS.subtext },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  topicEmoji: { fontSize: 36 },
  topicName: { fontSize: 20, fontWeight: '800' },
  topicDesc: { fontSize: 13, color: COLORS.subtext, marginTop: 3 },
  endedLabel: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 3,
    fontWeight: '600',
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  statusBtnText: { fontSize: 13, fontWeight: '700' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginBottom: 24,
    ...SHADOW,
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.text,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAffirmations: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
    marginVertical: 20,
  },
  archivedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 10,
    alignSelf: 'center',
  },
  archivedToggleText: {
    fontSize: 13,
    color: COLORS.subtext,
    fontWeight: '600',
  },
});
