import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/context/AppContext';
import { COLORS } from '../src/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="topic/new"
          options={{ title: 'New Topic', presentation: 'modal' }}
        />
        <Stack.Screen
          name="topic/[id]"
          options={{ title: 'Topic' }}
        />
        <Stack.Screen
          name="session/active"
          options={{
            title: 'Session',
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
      </Stack>
    </AppProvider>
  );
}
