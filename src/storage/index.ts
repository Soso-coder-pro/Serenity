import AsyncStorage from '@react-native-async-storage/async-storage';
import { Topic, Affirmation, Session } from '../types';

const K = {
  TOPICS: '@ser_topics',
  AFF: '@ser_affirmations',
  SESS: '@ser_sessions',
};

// Topics
export async function getTopics(): Promise<Topic[]> {
  const d = await AsyncStorage.getItem(K.TOPICS);
  return d ? JSON.parse(d) : [];
}
export async function saveTopic(t: Topic) {
  const list = await getTopics();
  const i = list.findIndex((x) => x.id === t.id);
  i >= 0 ? (list[i] = t) : list.push(t);
  await AsyncStorage.setItem(K.TOPICS, JSON.stringify(list));
}
export async function deleteTopic(id: string) {
  const list = await getTopics();
  await AsyncStorage.setItem(K.TOPICS, JSON.stringify(list.filter((x) => x.id !== id)));
}

// Affirmations
export async function getAffirmations(): Promise<Affirmation[]> {
  const d = await AsyncStorage.getItem(K.AFF);
  return d ? JSON.parse(d) : [];
}
export async function saveAffirmation(a: Affirmation) {
  const list = await getAffirmations();
  const i = list.findIndex((x) => x.id === a.id);
  i >= 0 ? (list[i] = a) : list.push(a);
  await AsyncStorage.setItem(K.AFF, JSON.stringify(list));
}
export async function deleteAffirmation(id: string) {
  const list = await getAffirmations();
  await AsyncStorage.setItem(K.AFF, JSON.stringify(list.filter((x) => x.id !== id)));
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  const d = await AsyncStorage.getItem(K.SESS);
  return d ? JSON.parse(d) : [];
}
export async function saveSession(s: Session) {
  const list = await getSessions();
  const i = list.findIndex((x) => x.id === s.id);
  i >= 0 ? (list[i] = s) : list.unshift(s);
  await AsyncStorage.setItem(K.SESS, JSON.stringify(list));
}
export async function deleteSession(id: string) {
  const list = await getSessions();
  await AsyncStorage.setItem(K.SESS, JSON.stringify(list.filter((x) => x.id !== id)));
}
