# Serenity 🧘

A mobile app to track your daily meditation and affirmation sessions.

## Features

- **Topics / Desires** — Create topics for different areas (self-confidence, gratitude, health…). Activate or end them anytime.
- **Affirmations** — Add, edit, archive, or delete affirmations per topic.
- **Live Sessions** — Start a timed session with a pause button. Check off affirmations as you go.
- **Session Logs** — Every session records duration (minutes), number of affirmations reached, and optional notes.
- **History** — Browse past sessions by day, week, or month.
- **Progress** — See your streak, total minutes, total affirmations, a 7-day bar chart, and per-topic stats.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npx expo start
```

Then scan the QR code with **Expo Go** (iOS / Android) or press `i` / `a` to open a simulator.

## Tech Stack

- [Expo](https://expo.dev) SDK 52
- [Expo Router](https://docs.expo.dev/router/introduction/) v4 (file-based navigation)
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) — local persistence
- [@expo/vector-icons](https://docs.expo.dev/guides/icons/) — Ionicons

## Project Structure

```
app/
  _layout.tsx          Root stack
  (tabs)/
    _layout.tsx        Tab navigator
    index.tsx          Topics list
    history.tsx        Session history
    progress.tsx       Stats & progress
  topic/
    new.tsx            Create topic
    [id].tsx           Topic detail + affirmations
  session/
    active.tsx         Live session screen

src/
  types/index.ts       TypeScript types
  storage/index.ts     AsyncStorage helpers
  context/AppContext.tsx  Global state
  components/          Reusable UI components
  theme.ts             Colors, radii, shadows
```
