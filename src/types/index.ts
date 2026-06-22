export interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string;
  isActive: boolean;
  createdAt: string;
  endedAt?: string;
}

export interface Affirmation {
  id: string;
  topicId: string;
  text: string;
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  topicId: string;
  topicName: string;
  topicColor: string;
  topicEmoji: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  affirmationsReached: number;
  notes: string;
}
