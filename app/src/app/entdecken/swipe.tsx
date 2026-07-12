// =========================================================================
// Der Swipe-Flow als Phasen-Renderer (eine Route, keine Back-Gesture-Fallen):
// mood → deck → [handover → mood → deck] → reveal/summary → done.
// Session wird nach jedem Schritt persistiert (App-Kill mittendrin = resume).
// Kein Screen-ScrollView: Swipe-up (Superlike) braucht die volle Geste.
// =========================================================================
import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Confetti } from '../../components/Confetti';
import { ActivityCard, MoodCard } from '../../components/ExperienceCard';
import { SwipeDeck } from '../../components/SwipeDeck';
import { Muted } from '../../components/ui';
import { activityById, content, type Activity, type Mood } from '../../content';
import {
  SUPERLIKE_LIMIT,
  applyDeckSwipe,
  applyMoodSwipe,
  computeMatches,
  loadSession,
  nextPhase,
  orderDeck,
  saveSession,
  superlikesUsed,
  type Session,
  type SwipeAction,
} from '../../lib/discover';
import { irisFavoriten } from '../../data/guestInfo';
import { getWeather, todayClass } from '../../lib/weather';
import { useGuest, type PlanItem } from '../../lib/store';
import { colors, fonts, radius, spacing } from '../../theme';

export default function SwipeFlow() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [weather, setWeather] = useState<ReturnType<typeof todayClass>>(null);
  const [burst, setBurst] = useState(0);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const undoRef = useRef<Session | null>(null);
  const { addToPlan, plan } = useGuest();

  // Neustart: Session verwerfen, zurück zur Modus-Wahl. Zwei-Tap-Bestätigung
  // statt Alert (Alert.alert ist auf Web ein No-op).
  const restart = () => {
    if (!confirmRestart) {
      setConfirmRestart(true);
      setTimeout(() => setConfirmRestart(false), 3500);
      return;
    }
    saveSession(null);
    router.replace('/entdecken');
  };

  useEffect(() => {
    loadSession().then((s) => setSession(s ?? null));
    getWeather().then((w) => setWeather(todayClass(w)));
  }, []);

  // Deck der aktiven Person (deterministisch aus Seed + Person + Moods).
  const deck: Activity[] = useMemo(() => {
    if (!session) return [];
    const p = session.players[session.active]!;
    const personSeed = session.seed + (session.active === 'B' ? 7919 : 0);
    return orderDeck(content.activities, p.moods, weather, personSeed, [], irisFavoriten);
  }, [session, weather]);

  const update = (s: Session, newIndex?: number) => {
    setSession(s);
    saveSession(s);
    if (typeof newIndex === 'number') setIndex(newIndex);
  };

  if (session === undefined) return null;
  if (session === null) {
    // Kein aktiver Durchlauf (z. B. direkt navigiert) → zurück zum Einstieg.
    router.replace('/entdecken');
    return null;
  }

  const p = session.players[session.active]!;
  const isMood = session.phase === 'mood';
  const items: (Mood | Activity)[] = isMood ? content.moods : deck;
  const finishedStack = index >= items.length;

  const onSwipe = (item: { id: string }, action: SwipeAction) => {
    undoRef.current = session;
    const next = isMood
      ? applyMoodSwipe(session, item.id, action)
      : applyDeckSwipe(session, item.id, action);
    const newIndex = index + 1;
    if (newIndex >= items.length) {
      update(nextPhase(next), 0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setBurst((b) => b + 1);
    } else {
      update(next, newIndex);
    }
  };

  const undo = () => {
    if (undoRef.current && index > 0) {
      update(undoRef.current, index - 1);
      undoRef.current = null;
    }
  };

  // ---- Phasen ohne Deck -----------------------------------------------------
  if (session.phase === 'handover') {
    const b = session.players.B!;
    return (
      <FullScreen>
        <Confetti burst={burst} />
        <Text style={styles.bigIcon}>🙈</Text>
        <Text style={styles.phaseTitle}>Nicht spicken!</Text>
        <Muted>
          {session.players.A.name} ist fertig. Jetzt gib das Handy an {b.name} {b.avatar} — die Auswahl bleibt
          geheim, bis beide durch sind.
        </Muted>
        <PrimaryButton
          label={`${b.avatar} Ich bin ${b.name} — los!`}
          onPress={() => update(nextPhase(session), 0)}
        />
      </FullScreen>
    );
  }

  if (session.phase === 'reveal') {
    const matches = computeMatches(session.players.A, session.players.B!);
    const takeMatches = () => {
      const items: PlanItem[] = matches.map((m) => ({
        id: m.id,
        addedAt: new Date().toISOString(),
        source: 'match',
        superlike: m.perfect,
      }));
      addToPlan(items);
      update(nextPhase(session));
      router.replace('/plan');
    };
    const takeAll = () => {
      const union = new Map<string, PlanItem>();
      for (const player of [session.players.A, session.players.B!]) {
        for (const [id, v] of Object.entries(player.likes)) {
          const isMatch = matches.some((m) => m.id === id);
          union.set(id, {
            id,
            addedAt: new Date().toISOString(),
            source: isMatch ? 'match' : 'solo',
            superlike: v === 'super' || union.get(id)?.superlike === true,
          });
        }
      }
      addToPlan([...union.values()]);
      update(nextPhase(session));
      router.replace('/plan');
    };
    const likesTotal = new Set([
      ...Object.keys(session.players.A.likes),
      ...Object.keys(session.players.B!.likes),
    ]).size;

    return (
      <FullScreen>
        <Confetti burst={burst + 1} />
        {matches.length > 0 ? (
          <>
            <Text style={styles.bigIcon}>💙</Text>
            <Text style={styles.phaseTitle}>
              {matches.length === 1 ? 'Ein Match!' : `${matches.length} Matches!`}
            </Text>
            <Muted>Das wollt ihr BEIDE:</Muted>
            <View style={styles.matchList}>
              {matches.map((m) => {
                const a = activityById(m.id)!;
                return (
                  <View key={m.id} style={[styles.matchRow, m.perfect && styles.perfectRow]}>
                    <Text style={styles.matchIcon}>{a.icon}</Text>
                    <Text style={styles.matchName}>
                      {a.name}
                      {m.perfect ? '  ⭐⭐ Traum-Match!' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
            <PrimaryButton label="Matches in den Urlaubsplan 💙" onPress={takeMatches} />
            <Pressable onPress={takeAll}>
              <Text style={styles.secondary}>Alle {likesTotal} Favoriten übernehmen</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.bigIcon}>🌊</Text>
            <Text style={styles.phaseTitle}>Kein Doppel-Treffer …</Text>
            <Muted>… aber zusammen habt ihr {likesTotal} Ideen gesammelt. Auch schön!</Muted>
            <PrimaryButton label={`Alle ${likesTotal} Ideen übernehmen`} onPress={takeAll} />
          </>
        )}
        <Pressable
          onPress={() => {
            saveSession(null);
            router.replace('/entdecken');
          }}
        >
          <Text style={styles.secondary}>🔄 Nochmal spielen</Text>
        </Pressable>
      </FullScreen>
    );
  }

  if (session.phase === 'summary') {
    const likes = Object.entries(session.players.A.likes);
    const take = () => {
      addToPlan(
        likes.map(([id, v]) => ({
          id,
          addedAt: new Date().toISOString(),
          source: 'solo' as const,
          superlike: v === 'super',
        }))
      );
      update(nextPhase(session));
      router.replace('/plan');
    };
    return (
      <FullScreen>
        <Confetti burst={burst} />
        <Text style={styles.bigIcon}>{likes.length > 0 ? '🎉' : '🌊'}</Text>
        <Text style={styles.phaseTitle}>
          {likes.length > 0 ? `${likes.length} Favoriten!` : 'Nichts dabei?'}
        </Text>
        {likes.length > 0 ? (
          <>
            <Muted>Euer Büsum-Plan steht — wetterschlau sortiert findet ihr ihn im Urlaubsplan.</Muted>
            <PrimaryButton label="Zum Urlaubsplan" onPress={take} />
            <Pressable
              onPress={() => {
                saveSession(null);
                router.replace('/entdecken');
              }}
            >
              <Text style={styles.secondary}>🔄 Nochmal spielen (ohne Übernehmen)</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Muted>Macht nichts — in den Reisetipps und bei Iris gibt es mehr Ideen.</Muted>
            <PrimaryButton
              label="Nochmal mischen"
              onPress={() => {
                saveSession(null);
                router.replace('/entdecken');
              }}
            />
          </>
        )}
      </FullScreen>
    );
  }

  // ---- Mood- und Deck-Phase ---------------------------------------------------
  const progress = `${Math.min(index + 1, items.length)}/${items.length}`;
  const header =
    session.mode === 'duo' ? `${p.avatar} ${p.name} · ${isMood ? 'Stimmung' : 'Erlebnisse'}` : isMood ? 'Eure Stimmung' : 'Erlebnisse';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Entdecken', headerBackVisible: session.mode !== 'duo' }} />
      <View style={styles.head}>
        <Text style={styles.headText}>{header}</Text>
        <View style={styles.headRight}>
          <Pressable
            accessibilityLabel="Runde neu starten"
            onPress={restart}
            style={({ pressed }) => [styles.restart, confirmRestart && styles.restartConfirm, pressed && { opacity: 0.8 }]}
          >
            <Text style={[styles.restartLabel, confirmRestart && styles.restartLabelConfirm]}>
              {confirmRestart ? 'Wirklich neu?' : '↻ Neu'}
            </Text>
          </Pressable>
          <Text style={styles.progress}>{progress}</Text>
        </View>
      </View>
      {isMood && <Muted>Kurze Aufwärmrunde: Was klingt nach eurem Urlaub? (Nichts wird aussortiert.)</Muted>}
      {!finishedStack && (
        <SwipeDeck
          items={items as { id: string }[] as never}
          index={index}
          allowSuper={!isMood}
          superLeft={!isMood ? SUPERLIKE_LIMIT - superlikesUsed(p) : undefined}
          canUndo={index > 0 && undoRef.current !== null}
          onUndo={undo}
          renderCard={(item) => {
            if (isMood) return <MoodCard mood={item as unknown as Mood} />;
            const a = item as unknown as Activity;
            // Schietwetter-Tipp hat Vorrang (situativ) — sonst Iris' Liebling.
            const schiet = weather === 'schietwetter' && a.indoor;
            const iris = irisFavoriten.includes(a.id);
            return (
              <ActivityCard
                activity={a}
                ribbon={schiet ? 'Schietwetter-Tipp' : iris ? "💛 Iris' Liebling" : undefined}
                ribbonTone={schiet ? 'aqua' : 'gold'}
              />
            );
          }}
          onSwipe={(item, action) => onSwipe(item, action)}
        />
      )}
      {plan.length > 0 && !isMood && (
        <Pressable onPress={() => router.push('/plan')}>
          <Text style={styles.planLink}>Euer Plan: {plan.length} Ideen →</Text>
        </Pressable>
      )}
    </View>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return <View style={styles.full}>{children}</View>;
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}>
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand50, padding: spacing.md, gap: spacing.sm },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headText: { fontFamily: fonts.head, fontSize: 20, color: colors.aqua900 },
  progress: { fontWeight: '700', color: colors.ink500, fontVariant: ['tabular-nums'] },
  restart: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.white,
  },
  restartConfirm: { backgroundColor: '#a64b50', borderColor: '#a64b50' },
  restartLabel: { fontSize: 13, fontWeight: '700', color: colors.ink700 },
  restartLabelConfirm: { color: colors.white },
  full: {
    flex: 1,
    backgroundColor: colors.sand50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  bigIcon: { fontSize: 64 },
  phaseTitle: { fontFamily: fonts.head, fontSize: 30, color: colors.aqua900, textAlign: 'center' },
  matchList: { gap: spacing.sm, alignSelf: 'stretch' },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  perfectRow: { borderWidth: 1.5, borderColor: colors.gold },
  matchIcon: { fontSize: 24 },
  matchName: { flex: 1, fontWeight: '600', color: colors.ink900, fontSize: 15 },
  primary: {
    backgroundColor: colors.aqua700,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryLabel: { color: colors.white, fontWeight: '700', fontSize: 16 },
  secondary: { color: colors.aqua700, fontWeight: '600', padding: spacing.sm },
  planLink: { color: colors.aqua700, fontWeight: '600', textAlign: 'center', paddingVertical: spacing.xs },
});
