import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/context/AppContext';
import { C } from '../src/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
          headerTitleStyle: { fontWeight: '700', color: C.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="topic/new" options={{ title: 'New topic', presentation: 'modal' }} />
        <Stack.Screen name="topic/[id]" options={{ title: 'Affirmations' }} />
        <Stack.Screen name="topic/edit" options={{ title: 'Edit topic', presentation: 'modal' }} />
        <Stack.Screen name="session/setup" options={{ title: 'Set intention', presentation: 'modal' }} />
        <Stack.Screen name="session/active" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="session/results" options={{ title: 'Log session', presentation: 'modal', gestureEnabled: false }} />
      </Stack>
    </AppProvider>
  );
}
