import AsyncStorage from '@react-native-async-storage/async-storage';
import { Topic, Affirmation, Session } from '../types';

const KEYS = {
  TOPICS: '@serenity_topics',
  AFFIRMATIONS: '@serenity_affirmations',
  SESSIONS: '@serenity_sessions',
};

// Topics
export async function getTopics(): Promise<Topic[]> {
  const data = await AsyncStorage.getItem(KEYS.TOPICS);
  return data ? JSON.parse(data) : [];
}

export async function saveTopic(topic: Topic): Promise<void> {
  const topics = await getTopics();
  const idx = topics.findIndex((t) => t.id === topic.id);
  if (idx >= 0) topics[idx] = topic;
  else topics.push(topic);
  await AsyncStorage.setItem(KEYS.TOPICS, JSON.stringify(topics));
}

export async function deleteTopic(id: string): Promise<void> {
  const topics = await getTopics();
  await AsyncStorage.setItem(
    KEYS.TOPICS,
    JSON.stringify(topics.filter((t) => t.id !== id))
  );
}

// Affirmations
export async function getAffirmations(): Promise<Affirmation[]> {
  const data = await AsyncStorage.getItem(KEYS.AFFIRMATIONS);
  return data ? JSON.parse(data) : [];
}

export async function saveAffirmation(affirmation: Affirmation): Promise<void> {
  const items = await getAffirmations();
  const idx = items.findIndex((a) => a.id === affirmation.id);
  if (idx >= 0) items[idx] = affirmation;
  else items.push(affirmation);
  await AsyncStorage.setItem(KEYS.AFFIRMATIONS, JSON.stringify(items));
}

export async function deleteAffirmation(id: string): Promise<void> {
  const items = await getAffirmations();
  await AsyncStorage.setItem(
    KEYS.AFFIRMATIONS,
    JSON.stringify(items.filter((a) => a.id !== id))
  );
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  const data = await AsyncStorage.getItem(KEYS.SESSIONS);
  return data ? JSON.parse(data) : [];
}

export async function saveSession(session: Session): Promise<void> {
  const sessions = await getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

export async function deleteSession(id: string): Promise<void> {
  const sessions = await getSessions();
  await AsyncStorage.setItem(
    KEYS.SESSIONS,
    JSON.stringify(sessions.filter((s) => s.id !== id))
  );
}
