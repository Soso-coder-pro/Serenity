import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Topic, Affirmation, Session } from '../types';
import {
  getTopics, saveTopic, deleteTopic,
  getAffirmations, saveAffirmation, deleteAffirmation,
  getSessions, saveSession, deleteSession,
} from '../storage';

interface Ctx {
  topics: Topic[];
  affirmations: Affirmation[];
  sessions: Session[];
  loading: boolean;
  addTopic: (t: Topic) => Promise<void>;
  updateTopic: (t: Topic) => Promise<void>;
  removeTopic: (id: string) => Promise<void>;
  addAffirmation: (a: Affirmation) => Promise<void>;
  updateAffirmation: (a: Affirmation) => Promise<void>;
  removeAffirmation: (id: string) => Promise<void>;
  addSession: (s: Session) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [t, a, s] = await Promise.all([getTopics(), getAffirmations(), getSessions()]);
    setTopics(t);
    setAffirmations(a);
    setSessions(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTopic = async (t: Topic) => { await saveTopic(t); setTopics(p => [...p, t]); };
  const updateTopic = async (t: Topic) => { await saveTopic(t); setTopics(p => p.map(x => x.id === t.id ? t : x)); };
  const removeTopic = async (id: string) => { await deleteTopic(id); setTopics(p => p.filter(x => x.id !== id)); };

  const addAffirmation = async (a: Affirmation) => { await saveAffirmation(a); setAffirmations(p => [...p, a]); };
  const updateAffirmation = async (a: Affirmation) => { await saveAffirmation(a); setAffirmations(p => p.map(x => x.id === a.id ? a : x)); };
  const removeAffirmation = async (id: string) => { await deleteAffirmation(id); setAffirmations(p => p.filter(x => x.id !== id)); };

  const addSession = async (s: Session) => { await saveSession(s); setSessions(p => [s, ...p]); };
  const removeSession = async (id: string) => { await deleteSession(id); setSessions(p => p.filter(x => x.id !== id)); };

  return (
    <AppContext.Provider value={{
      topics, affirmations, sessions, loading,
      addTopic, updateTopic, removeTopic,
      addAffirmation, updateAffirmation, removeAffirmation,
      addSession, removeSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
