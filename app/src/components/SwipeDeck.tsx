// =========================================================================
// Generisches Tinder-Deck (Mood-Runde UND Erlebnis-Stapel): Pan-Geste auf der
// Top-Karte, Rotation/Overlays interpoliert, Karte 2 rückt nach. Nur die
// obersten 3 Karten sind gemountet. Entscheidung (like/nope/super/reset) ist
// eine pure Funktion (decideAction) — die Buttons darunter sind der
// A11y-/Web-Fallback und triggern dieselben Animationen.
// =========================================================================
import * as Haptics from 'expo-haptics';
import { ReactNode, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { decideAction, type SwipeAction } from '../lib/discover';
import { colors, radius, spacing } from '../theme';

type Props<T> = {
  items: T[];
  index: number;
  renderCard: (item: T) => ReactNode;
  onSwipe: (item: T, action: SwipeAction) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  /** Superlike anbieten? (Mood-Runde: nein) */
  allowSuper?: boolean;
  superLeft?: number;
};

export function SwipeDeck<T extends { id: string }>({
  items,
  index,
  renderCard,
  onSwipe,
  onUndo,
  canUndo = false,
  allowSuper = true,
  superLeft,
}: Props<T>) {
  const { width, height } = useWindowDimensions();
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const [busy, setBusy] = useState(false);

  const top = items[index];
  const next = items[index + 1];
  const third = items[index + 2];

  const settle = useCallback(
    (item: T, action: SwipeAction) => {
      tx.value = 0;
      ty.value = 0;
      setBusy(false);
      onSwipe(item, action);
    },
    [onSwipe, tx, ty]
  );

  const flyOut = useCallback(
    (action: SwipeAction) => {
      if (!top || busy) return;
      setBusy(true);
      Haptics.impactAsync(
        action === 'super' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {});
      const target =
        action === 'super' ? { x: 0, y: -height } : { x: action === 'like' ? width * 1.3 : -width * 1.3, y: 40 };
      tx.value = withTiming(target.x, { duration: 220 });
      ty.value = withTiming(target.y, { duration: 220 }, (done) => {
        if (done) runOnJS(settle)(top, action);
      });
    },
    [top, busy, width, height, settle, tx, ty]
  );

  const pan = Gesture.Pan()
    .enabled(!busy && !!top)
    .onChange((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      const action = decideAction(e.translationX, e.translationY, e.velocityX, width, height);
      if (action === 'reset' || (action === 'super' && !allowSuper)) {
        tx.value = withSpring(0, { damping: 16 });
        ty.value = withSpring(0, { damping: 16 });
      } else {
        runOnJS(flyOut)(action);
      }
    });

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${interpolate(tx.value, [-width, width], [-12, 12])}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [24, 110], [0, 1], 'clamp') }));
  const nopeStyle = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [-110, -24], [1, 0], 'clamp') }));
  const superStyle = useAnimatedStyle(() => ({
    opacity: allowSuper ? interpolate(ty.value, [-140, -50], [1, 0], 'clamp') : 0,
  }));
  const nextStyle = useAnimatedStyle(() => {
    const p = Math.min(1, (Math.abs(tx.value) + Math.abs(ty.value)) / 140);
    return { transform: [{ scale: 0.94 + 0.06 * p }, { translateY: 12 - 12 * p }] };
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.stack}>
        {third && <View style={[styles.card, styles.third]}>{renderCard(third)}</View>}
        {next && <Animated.View style={[styles.card, nextStyle]}>{renderCard(next)}</Animated.View>}
        {top && (
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.card, topStyle]}>
              {renderCard(top)}
              <Animated.View style={[styles.overlay, styles.like, likeStyle]}>
                <Text style={styles.overlayText}>WILL ICH 💙</Text>
              </Animated.View>
              <Animated.View style={[styles.overlay, styles.nope, nopeStyle]}>
                <Text style={styles.overlayText}>NÖ 🌊</Text>
              </Animated.View>
              <Animated.View style={[styles.overlay, styles.super, superStyle]}>
                <Text style={styles.overlayText}>UNBEDINGT ⭐</Text>
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      <View style={styles.buttons}>
        <Pressable
          accessibilityLabel="Nein danke"
          onPress={() => flyOut('nope')}
          style={({ pressed }) => [styles.btn, styles.btnNope, pressed && styles.pressed]}
        >
          <Text style={styles.btnIcon}>✕</Text>
        </Pressable>
        {onUndo && (
          <Pressable
            accessibilityLabel="Letzte Karte zurückholen"
            onPress={onUndo}
            disabled={!canUndo}
            style={({ pressed }) => [styles.btn, styles.btnUndo, !canUndo && styles.disabled, pressed && styles.pressed]}
          >
            <Text style={styles.btnIconSmall}>↩︎</Text>
          </Pressable>
        )}
        {allowSuper && (
          <Pressable
            accessibilityLabel="Unbedingt!"
            onPress={() => flyOut('super')}
            disabled={superLeft === 0}
            style={({ pressed }) => [styles.btn, styles.btnSuper, superLeft === 0 && styles.disabled, pressed && styles.pressed]}
          >
            <Text style={styles.btnIconSmall}>⭐{typeof superLeft === 'number' ? ` ${superLeft}` : ''}</Text>
          </Pressable>
        )}
        <Pressable
          accessibilityLabel="Gefällt uns"
          onPress={() => flyOut('like')}
          style={({ pressed }) => [styles.btn, styles.btnLike, pressed && styles.pressed]}
        >
          <Text style={[styles.btnIcon, styles.btnIconLight]}>♥</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.md },
  stack: { flex: 1 },
  card: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  third: { transform: [{ scale: 0.9 }, { translateY: 20 }] },
  overlay: {
    position: 'absolute',
    top: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  like: { left: 18, borderColor: '#2e8b57', transform: [{ rotate: '-12deg' }] },
  nope: { right: 18, borderColor: '#a52a3a', transform: [{ rotate: '12deg' }] },
  super: { alignSelf: 'center', top: undefined, bottom: 32, borderColor: colors.gold },
  overlayText: { fontSize: 20, fontWeight: '800', color: colors.ink900 },
  buttons: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  btnNope: {},
  btnLike: { backgroundColor: colors.aqua700 },
  btnSuper: { width: 52, height: 52 },
  btnUndo: { width: 46, height: 46 },
  btnIcon: { fontSize: 26, color: colors.ink900 },
  btnIconLight: { color: colors.white },
  btnIconSmall: { fontSize: 17, color: colors.ink900, fontWeight: '700' },
  pressed: { transform: [{ scale: 0.93 }] },
  disabled: { opacity: 0.35 },
});
