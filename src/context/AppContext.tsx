import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Topic, Affirmation, Session } from '../types';
import {
  getTopics,
  saveTopic,
  deleteTopic,
  getAffirmations,
  saveAffirmation,
  deleteAffirmation,
  getSessions,
  saveSession,
  deleteSession,
} from '../storage';

interface AppContextValue {
  topics: Topic[];
  affirmations: Affirmation[];
  sessions: Session[];
  loading: boolean;
  addTopic: (topic: Topic) => Promise<void>;
  updateTopic: (topic: Topic) => Promise<void>;
  removeTopic: (id: string) => Promise<void>;
  addAffirmation: (affirmation: Affirmation) => Promise<void>;
  updateAffirmation: (affirmation: Affirmation) => Promise<void>;
  removeAffirmation: (id: string) => Promise<void>;
  addSession: (session: Session) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [t, a, s] = await Promise.all([
      getTopics(),
      getAffirmations(),
      getSessions(),
    ]);
    setTopics(t);
    setAffirmations(a);
    setSessions(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTopic = async (topic: Topic) => {
    await saveTopic(topic);
    setTopics((prev) => [...prev, topic]);
  };

  const updateTopic = async (topic: Topic) => {
    await saveTopic(topic);
    setTopics((prev) => prev.map((t) => (t.id === topic.id ? topic : t)));
  };

  const removeTopic = async (id: string) => {
    await deleteTopic(id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const addAffirmation = async (affirmation: Affirmation) => {
    await saveAffirmation(affirmation);
    setAffirmations((prev) => [...prev, affirmation]);
  };

  const updateAffirmation = async (affirmation: Affirmation) => {
    await saveAffirmation(affirmation);
    setAffirmations((prev) =>
      prev.map((a) => (a.id === affirmation.id ? affirmation : a))
    );
  };

  const removeAffirmation = async (id: string) => {
    await deleteAffirmation(id);
    setAffirmations((prev) => prev.filter((a) => a.id !== id));
  };

  const addSession = async (session: Session) => {
    await saveSession(session);
    setSessions((prev) => [session, ...prev]);
  };

  const removeSession = async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        topics,
        affirmations,
        sessions,
        loading,
        addTopic,
        updateTopic,
        removeTopic,
        addAffirmation,
        updateAffirmation,
        removeAffirmation,
        addSession,
        removeSession,
        reload: load,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
