# Serenity — Meditation & Affirmation Tracker

A mobile app to track meditation/affirmation sessions organized by **desires** (topics/intentions).

## What's new in v2

- 📏 **Safe-area bottom margin** — the tab bar no longer collides with the phone's navigation/home bar (uses `react-native-safe-area-context` insets)
- ☀️ **Keep screen awake** — toggle (sun icon, top-right) in a session to stop the screen dimming; on by default
- 🏁 **Finish a topic** — "Finish topic" archives a desire; it moves to a new **Archive** page
- 📦 **Archive** — reachable from the Desires header; shows a recap (sessions, minutes, affirmations reached), lets you **restore** or **delete**, and add a **reflection/comment** per topic
- 📊 **Insights tab** — new tab with a **Day / Week / Month / All** selector (Day included), summary cards, a bar chart, and a per-topic breakdown
- 🔢 **Progress display** — reached / total affirmations shown on home cards, in the desires list, and as a progress bar on the topic page

## Features

- 🌱 **Desires** — Create topic-based intentions (Abundance, Health, Love, etc.) with custom colors
- ✨ **Affirmations** — Add/edit/toggle affirmations per desire; enable or pause them
- ⏱ **Live Sessions** — Timer with breathing animation, cycle through affirmations, mark each as "reached"
- 📊 **Dashboard** — Daily streak, total sessions, minutes, affirmations reached
- 📜 **History** — Full session log grouped by day, with duration, affirmations reached, and personal notes
- 💾 **Persistent** — All data saved locally with AsyncStorage

## Setup

```bash
# 1. Create the Expo project using this repo
npx create-expo-app serenity --template blank-typescript
cd serenity

# 2. Copy all files from this repo into the project folder

# 3. Install dependencies
npm install

# 4. Install additional packages
npx expo install \
  @react-native-async-storage/async-storage \
  expo-linear-gradient \
  expo-haptics \
  expo-keep-awake \
  react-native-safe-area-context \
  react-native-svg \
  zustand

# 5. Start the app
npx expo start
```

## Project Structure

```
app/
  _layout.tsx          — Root layout (SafeAreaProvider, GestureHandler, loads data)
  (tabs)/
    _layout.tsx        — Tab bar with 4 tabs (safe-area aware)
    index.tsx          — Home / Dashboard
    desires.tsx        — Manage desires (+ Archive link)
    insights.tsx       — Insights with Day/Week/Month/All selector
    history.tsx        — Session history
  desire/[id].tsx      — Desire detail + affirmations + progress + Finish topic
  session/[desireId].tsx — Live session (keep-awake toggle)
  archive.tsx          — Archived topics with reflections

store/
  useStore.ts          — Zustand store with AsyncStorage persistence

types/
  index.ts             — TypeScript types

constants/
  design.ts            — Color palette, spacing, radius tokens
```

## How it works

1. **Create a desire** from the Desires tab (e.g. "Abundance")
2. **Add affirmations** to the desire ("I am abundant...", "Money flows to me...")
3. **Start a session** — tap "Begin" on the home screen or "Start session" on the desire page
4. In the session: use ▶ to start/pause the timer, swipe through affirmations, tap **Reached** when you've affirmed one deeply
5. **End session** — logs duration + affirmations reached, add notes
6. View your **progress** on the home dashboard and full **history** tab
