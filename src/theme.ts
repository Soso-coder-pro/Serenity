export const C = {
  bg: '#FBF7F1',
  card: '#FFFFFF',
  border: '#ECE4D8',
  statBg: '#F4EEE6',
  text: '#36303A',
  sub: '#9A9298',
  dim: '#6B6470',
  accent: '#5E4F8C',
  accentMid: '#7C6BAE',
  accentSoft: '#EBE4F5',
  accentLight: '#E0D6F2',
  heroFrom: '#7C6BAE',
  heroTo: '#5E4F8C',
  sessBg: '#6F5FA6',
  success: '#52B788',
  danger: '#C0544A',
  warn: '#C2954B',
  white: '#FFFFFF',
};

export const TOPIC_COLORS = [
  { color: '#7C6BAE', soft: '#EBE4F5' },
  { color: '#C77B8B', soft: '#F7E7EB' },
  { color: '#4A7FA8', soft: '#DCF0F8' },
  { color: '#5A8F70', soft: '#DCF0E6' },
  { color: '#C2954B', soft: '#F6EEDD' },
  { color: '#4A8FA5', soft: '#D6EFF4' },
  { color: '#9C6464', soft: '#F5E4E4' },
  { color: '#6B8F4A', soft: '#E4F0D6' },
];

export function hexToSoft(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 0.85;
  const sr = Math.round(r + (255 - r) * f);
  const sg = Math.round(g + (255 - g) * f);
  const sb = Math.round(b + (255 - b) * f);
  return `#${sr.toString(16).padStart(2, '0')}${sg.toString(16).padStart(2, '0')}${sb.toString(16).padStart(2, '0')}`;
}

export const COLOR_PALETTE = [
  // Violets / Indigos
  '#5E35B1', '#7C6BAE', '#8E24AA', '#9C27B0', '#AB47BC',
  '#3949AB', '#5C6BC0', '#7986CB',
  // Bleus
  '#1565C0', '#1976D2', '#1E88E5', '#42A5F5', '#0277BD', '#0288D1',
  // Cyans / Teals
  '#006064', '#00838F', '#0097A7', '#00695C', '#00796B', '#00897B', '#26A69A',
  // Verts
  '#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#33691E', '#558B2F', '#6B8F4A',
  // Jaunes / Ors
  '#F57F17', '#F9A825', '#FFB300', '#FF8F00', '#FDD835',
  // Oranges
  '#E65100', '#EF6C00', '#FB8C00', '#FF9800', '#F4511E',
  // Rouges
  '#B71C1C', '#C62828', '#D32F2F', '#E53935', '#F44336',
  // Roses / Fuchsias
  '#880E4F', '#AD1457', '#C2185B', '#D81B60', '#E91E63', '#F06292', '#C77B8B',
  // Bruns / Terres
  '#3E2723', '#4E342E', '#5D4037', '#6D4C41', '#8D6E63',
  // Ardoises / Gris bleutés
  '#263238', '#37474F', '#455A64', '#546E7A', '#607D8B',
];

export const TOPIC_EMOJIS = [
  // Mindfulness / Spirituel
  '🧘', '🙏', '🕊️', '☮️', '🌀', '☯️', '🪬', '🧿', '💭', '🧠', '🫧', '🪷',
  // Nature / Plantes
  '🌿', '🍃', '🌱', '🌲', '🌳', '🌴', '🌵', '🪴', '🎋', '🌾', '🍀',
  // Fleurs
  '🌸', '🌺', '🌻', '🌹', '🌷', '🪻', '🌼', '🏵️',
  // Céleste / Cosmos
  '⭐', '🌟', '✨', '💫', '🌙', '☀️', '🌤️', '🌈', '☄️', '🪐', '🌌', '🌠',
  // Éléments
  '🔥', '🌊', '⚡', '🌪️', '❄️', '🌫️',
  // Cœurs / Émotions
  '❤️', '💜', '💙', '💚', '💛', '🧡', '🤍', '🖤', '💖', '💝', '💗', '💓', '💞', '💕', '🩷', '🩵',
  // Animaux
  '🦋', '🐝', '🦄', '🐬', '🦅', '🦜', '🦁', '🐉', '🦊', '🐺', '🦋', '🕊️',
  // Magie / Gemmes
  '💎', '🔮', '🪄', '🎩', '👑', '🗝️',
  // Succès / Objectifs
  '🏆', '🎯', '💪', '🚀', '🔑', '💡', '🎖️', '🌠',
  // Créatif / Expressif
  '🎨', '🎵', '🎶', '🎭', '📚', '🖊️', '🎪', '🎠',
  // Nourriture / Bien-être
  '🍵', '🫖', '🌺', '🧘', '🏔️', '🌅',
];

export const MOOD_LABELS = ['', 'Heavy', 'Low', 'Okay', 'Good', 'Radiant'];
export const MOOD_EMOJIS = ['', '😔', '😕', '😐', '🙂', '😄'];

export const R = { sm: 8, md: 14, lg: 18, xl: 22, full: 999 };

export const SHADOW = {
  shadowColor: '#36303A',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 3,
};
