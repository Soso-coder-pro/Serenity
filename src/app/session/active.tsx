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

type DisplayMode = 'session' | 'daily' | 'global';
const INCREMENTS = [1, 2, 3, 5, 10];

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${pad(m)}:${pad(s)}`;
}
function fmtNum(n: number) { return n.toLocaleString(); }

interface PieProps {
  progress: number; // 0–1
  size: number;
  fillColor: string;
  bgColor: string;
  children?: React.ReactNode;
}

function PieProgress({ progress, size, fillColor, bgColor, children }: PieProps) {
  const half = size / 2;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const deg = clamped * 360;

  // Right half sweeps 0→180° (first 50%)
  const rightRotate = `${Math.min(deg, 180) - 180}deg`;
  // Left half sweeps 0→180° (second 50%), only rendered once > 50%
  const leftRotate = `${Math.max(deg - 180, 0)}deg`;

  return (
    <View style={{ width: size, height: size, borderRadius: half, backgroundColor: bgColor, overflow: 'hidden' }}>
      {/* Right sweep: clips right half, rotates a full square */}
      <View style={{ position: 'absolute', top: 0, right: 0, width: half, height: size, overflow: 'hidden' }}>
        <View style={{
          position: 'absolute', top: 0, left: -half, width: size, height: size,
          backgroundColor: fillColor,
          transform: [{ rotate: rightRotate }],
        }} />
      </View>
      {/* Left sweep: only once past 50% */}
      {deg > 180 && (
        <View style={{ position: 'absolute', top: 0, left: 0, width: half, height: size, overflow: 'hidden' }}>
          <View style={{
            position: 'absolute', top: 0, left: 0, width: size, height: size,
            backgroundColor: fillColor,
            transform: [{ rotate: leftRotate }],
          }} />
        </View>
      )}
      {/* Inner content */}
      <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}

export default function ActiveScreen() {
  const { topicId, mode: modeParam, target: targetParam, moodBefore: mbParam } =
    useLocalSearchParams<{ topicId: string; mode: string; target: string; moodBefore: string }>();
  const router = useRouter();
  const { topics, hapticsEnabled, sessions } = useApp();

  const topic = topics.find((t) => t.id === topicId);
  const mode = (modeParam as SessionMode) || 'manual';
  const target = parseInt(targetParam || '21', 10);
  const moodBefore = mbParam ? parseInt(mbParam, 10) : null;

  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('session');
  const [increment, setIncrement] = useState(1);
  const startRef = useRef(Date.now());
  const pausedMs = useRef(0);
  const pausedAt = useRef<number | null>(null);
  const breathe = useRef(new Animated.Value(1)).current;

  // Pre-compute base counts from past sessions
  const todayStr = new Date().toDateString();
  const topicSessions = sessions.filter((s) => s.topicId === topicId);
  const globalBase = topicSessions.reduce((sum, s) => sum + s.affirmationsReached, 0);
  const dailyBase = topicSessions
    .filter((s) => new Date(s.startedAt).toDateString() === todayStr)
    .reduce((sum, s) => sum + s.affirmationsReached, 0);

  const displayCount =
    displayMode === 'global' ? globalBase + count :
    displayMode === 'daily'  ? dailyBase + count :
    count;

  const globalGoal = topic?.globalGoal ?? 0;
  const showPie = displayMode === 'global' && globalGoal > 0 && mode !== 'timer';
  const pieProgress = globalGoal > 0 ? Math.min(1, (globalBase + count) / globalGoal) : 0;

  const MODE_LABELS: Record<DisplayMode, string> = {
    session: 'Session',
    daily: "Aujourd'hui",
    global: 'Global',
  };

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current - pausedMs.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

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
    setCount((v) => v + increment);
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

      {/* Display mode toggle */}
      <View style={s.modeRow}>
        {(['session', 'daily', 'global'] as DisplayMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[s.modeBtn, displayMode === m && s.modeBtnActive]}
            onPress={() => setDisplayMode(m)}
          >
            <Text style={[s.modeBtnText, displayMode === m && s.modeBtnTextActive]}>
              {MODE_LABELS[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main area + increment column */}
      <View style={s.centerRow}>

        {/* Interactive area */}
        <View style={s.center}>
          {mode === 'manual' && (
            <View style={s.manualWrap}>
              {showPie ? (
                <TouchableOpacity onPress={tap} activeOpacity={0.8}>
                  <PieProgress progress={pieProgress} size={218} fillColor="rgba(255,255,255,0.35)" bgColor="rgba(255,255,255,0.10)">
                    {/* Inner circle cutout */}
                    <View style={s.pieInner}>
                      <Text style={s.circleCount}>{fmtNum(displayCount)}</Text>
                      <Text style={s.circleLabel}>/ {fmtNum(globalGoal)}</Text>
                      <Text style={s.piePct}>{Math.round(pieProgress * 100)}%</Text>
                    </View>
                  </PieProgress>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={s.circle} onPress={tap} activeOpacity={0.8}>
                  <Text style={s.circleCount}>{fmtNum(displayCount)}</Text>
                  <Text style={s.circleLabel}>{MODE_LABELS[displayMode].toLowerCase()}</Text>
                </TouchableOpacity>
              )}
              <Text style={s.hint}>Tap the circle for each one</Text>
            </View>
          )}

          {mode === 'target' && (
            <View style={s.targetWrap}>
              {showPie ? (
                <TouchableOpacity onPress={tap} activeOpacity={0.85}>
                  <PieProgress progress={pieProgress} size={218} fillColor="rgba(255,255,255,0.35)" bgColor="rgba(255,255,255,0.08)">
                    <View style={s.pieInner}>
                      <Text style={s.circleCount}>{fmtNum(displayCount)}</Text>
                      <Text style={s.circleLabel}>/ {fmtNum(globalGoal)}</Text>
                      <Text style={s.piePct}>{Math.round(pieProgress * 100)}%</Text>
                    </View>
                  </PieProgress>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[s.ringOuter, { borderColor: 'rgba(255,255,255,0.3)' }]}
                  onPress={tap}
                  activeOpacity={0.85}
                >
                  <View style={[s.ringFill, { height: `${pct * 100}%` }]} />
                  <View style={s.ringInner}>
                    <Text style={s.circleCount}>{fmtNum(displayCount)}</Text>
                    <Text style={s.circleOf}>
                      {displayMode === 'session' ? `of ${target}` : MODE_LABELS[displayMode].toLowerCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              <Text style={s.hint}>
                {remaining > 0 && !showPie ? `${remaining} to go — stay with each one` : showPie && pieProgress < 1 ? `${fmtNum(Math.max(0, globalGoal - (globalBase + count)))} to go` : 'Goal reached — keep flowing ✨'}
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

        {/* Increment selector */}
        <View style={s.incrCol}>
          {INCREMENTS.slice().reverse().map((v) => (
            <TouchableOpacity
              key={v}
              style={[s.incrBtn, increment === v && s.incrBtnActive]}
              onPress={() => setIncrement(v)}
            >
              <Text style={[s.incrText, increment === v && s.incrTextActive]}>
                +{v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>

      {/* Bottom buttons */}
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

  modeRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    paddingHorizontal: 24, marginTop: 16,
  },
  modeBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  modeBtnActive: { backgroundColor: C.white },
  modeBtnText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  modeBtnTextActive: { color: C.accent },

  centerRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },

  manualWrap: { alignItems: 'center', gap: 22 },
  circle: {
    width: 210, height: 210, borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  circleCount: { fontSize: 52, fontWeight: '700', color: C.white, lineHeight: 60 },
  circleLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  circleOf: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginTop: 4 },
  hint: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textAlign: 'center' },

  pieInner: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  piePct: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '800', marginTop: 2 },

  targetWrap: { alignItems: 'center', gap: 22 },
  ringOuter: {
    width: 218, height: 218, borderRadius: 109, borderWidth: 2,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ringFill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.15)' },
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

  incrCol: { paddingRight: 20, gap: 10, alignItems: 'center' },
  incrBtn: {
    width: 46, height: 46, borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  incrBtnActive: { backgroundColor: C.white },
  incrText: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },
  incrTextActive: { color: C.accent },

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
