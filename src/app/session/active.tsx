import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../context/AppContext';
import { C, R } from '../../theme';
import { SessionMode } from '../../types';

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${pad(m)}:${pad(s)}`;
}

export default function ActiveScreen() {
  const { topicId, mode: modeParam, target: targetParam, moodBefore: mbParam } =
    useLocalSearchParams<{ topicId: string; mode: string; target: string; moodBefore: string }>();
  const router = useRouter();
  const { topics, hapticsEnabled } = useApp();

  const topic = topics.find((t) => t.id === topicId);
  const mode = (modeParam as SessionMode) || 'manual';
  const target = parseInt(targetParam || '21', 10);
  const moodBefore = mbParam ? parseInt(mbParam, 10) : null;

  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef(Date.now());
  const pausedMs = useRef(0);
  const pausedAt = useRef<number | null>(null);
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current - pausedMs.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  // breathing animation for timer-only mode
  useEffect(() => {
    if (mode !== 'timer') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.12, duration: 3000, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [mode]);

  const togglePause = () => {
    if (paused) {
      if (pausedAt.current) pausedMs.current += Date.now() - pausedAt.current;
      pausedAt.current = null;
    } else {
      pausedAt.current = Date.now();
    }
    setPaused((v) => !v);
  };

  const tap = () => {
    if (paused) return;
    setCount((v) => v + 1);
    if (hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const end = () => {
    const dur = Math.max(1, Math.round(elapsed / 60));
    router.replace({
      pathname: '/session/results',
      params: {
        topicId,
        duration: String(dur),
        count: String(count),
        moodBefore: moodBefore !== null ? String(moodBefore) : '',
      },
    });
  };

  const bg = topic?.color ?? C.sessBg;
  const pct = target > 0 ? Math.min(1, count / target) : 0;
  const remaining = Math.max(0, target - count);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
      {/* Topic + Timer */}
      <View style={s.top}>
        <Text style={s.topicLabel}>{topic ? `${topic.emoji} ${topic.name}` : 'Session'}</Text>
        <Text style={s.timer}>{fmt(elapsed)}</Text>
        {paused && <View style={s.pausedBadge}><Text style={s.pausedText}>PAUSED</Text></View>}
      </View>

      {/* Main interactive area */}
      <View style={s.center}>
        {mode === 'manual' && (
          <View style={s.manualWrap}>
            <TouchableOpacity style={s.circle} onPress={tap} activeOpacity={0.8}>
              <Text style={s.circleCount}>{count}</Text>
              <Text style={s.circleLabel}>affirmations</Text>
            </TouchableOpacity>
            <Text style={s.hint}>Tap the circle for each one</Text>
          </View>
        )}

        {mode === 'target' && (
          <View style={s.targetWrap}>
            <TouchableOpacity
              style={[s.ringOuter, { borderColor: 'rgba(255,255,255,0.3)' }]}
              onPress={tap}
              activeOpacity={0.85}
            >
              {/* Progress arc approximation with a fill overlay */}
              <View style={[s.ringFill, { height: `${pct * 100}%` }]} />
              <View style={s.ringInner}>
                <Text style={s.circleCount}>{count}</Text>
                <Text style={s.circleOf}>of {target}</Text>
              </View>
            </TouchableOpacity>
            <Text style={s.hint}>
              {remaining > 0 ? `${remaining} to go — stay with each one` : 'Goal reached — keep flowing ✨'}
            </Text>
          </View>
        )}

        {mode === 'timer' && (
          <View style={s.timerWrap}>
            <Animated.View style={[s.halo, { transform: [{ scale: breathe }] }]} />
            <Animated.View style={[s.breatheCircle, { transform: [{ scale: breathe }] }]}>
              <Text style={s.breatheText}>breathe</Text>
            </Animated.View>
            <Text style={s.hint}>Just be present — log your count after</Text>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View style={s.buttons}>
        <TouchableOpacity style={s.pauseBtn} onPress={togglePause}>
          <Text style={s.pauseBtnText}>{paused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.endBtn} onPress={end}>
          <Text style={s.endBtnText}>End session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  top: { alignItems: 'center', paddingTop: 24, paddingHorizontal: 24 },
  topicLabel: { fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
  timer: { fontSize: 52, fontWeight: '700', color: C.white, letterSpacing: 2, marginTop: 6 },
  pausedBadge: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: R.full, paddingHorizontal: 14, paddingVertical: 4 },
  pausedText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800', letterSpacing: 2 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  manualWrap: { alignItems: 'center', gap: 22 },
  circle: {
    width: 210, height: 210, borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  circleCount: { fontSize: 72, fontWeight: '700', color: C.white, lineHeight: 80 },
  circleLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '700', letterSpacing: 0.5, marginTop: 4 },
  circleOf: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginTop: 4 },
  hint: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textAlign: 'center' },

  targetWrap: { alignItems: 'center', gap: 22 },
  ringOuter: {
    width: 218, height: 218, borderRadius: 109, borderWidth: 2,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ringFill: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  ringInner: { alignItems: 'center', zIndex: 2 },

  timerWrap: { alignItems: 'center', gap: 28 },
  halo: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)' },
  breatheCircle: {
    width: 156, height: 156, borderRadius: 78,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  breatheText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },

  buttons: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 24 },
  pauseBtn: {
    flex: 1, paddingVertical: 16, borderRadius: R.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
  },
  pauseBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },
  endBtn: {
    flex: 1, paddingVertical: 16, borderRadius: R.lg,
    backgroundColor: C.white, alignItems: 'center',
  },
  endBtnText: { fontWeight: '800', fontSize: 15, color: C.accent },
});
