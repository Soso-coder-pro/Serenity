export interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  soft: string;
  emoji: string;
  isActive: boolean;
  createdAt: string;
  endedAt?: string;
  globalGoal?: number;
}

export interface Affirmation {
  id: string;
  topicId: string;
  text: string;
  isActive: boolean;
  createdAt: string;
}

export type SessionMode = 'manual' | 'target' | 'timer';

export interface Session {
  id: string;
  topicId: string;
  topicName: string;
  topicColor: string;
  topicSoft: string;
  startedAt: string;
  durationMinutes: number;
  affirmationsReached: number;
  notes: string;
  moodBefore: number | null;
  moodAfter: number | null;
  mode: SessionMode;
}
