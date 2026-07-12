// =========================================================================
// Handgerolltes Konfetti (Reanimated, keine neue Dependency): ~22 Partikel
// mit seeded Bahnen fallen einmal durchs Bild. `burst` neu setzen = neu feuern.
// =========================================================================
import { useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../theme';

const PIECES = 22;
const COLORS = [colors.gold, colors.aqua500, colors.aqua300, '#e8927c', '#7fb069', colors.sand200];

function Piece({ i, burst, w, h }: { i: number; burst: number; w: number; h: number }) {
  const progress = useSharedValue(0);
  // Deterministische „Zufalls"-Bahn je Partikel+Burst (kein Math.random im Render nötig,
  // aber hier unkritisch — einmalig pro Mount berechnet):
  const seed = (i * 9301 + burst * 49297) % 233280;
  const r = seed / 233280;
  const startX = r * w;
  const drift = (r - 0.5) * 160;
  const size = 8 + (i % 4) * 3;
  const delay = (i % 8) * 90;

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(delay, withTiming(1, { duration: 1500 + (i % 5) * 160, easing: Easing.in(Easing.quad) }));
  }, [burst, delay, i, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.85 ? 1 : (1 - progress.value) / 0.15,
    transform: [
      { translateX: startX + drift * progress.value },
      { translateY: -40 + (h + 80) * progress.value },
      { rotate: `${progress.value * (360 + i * 30)}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size * 0.6, borderRadius: 2, backgroundColor: COLORS[i % COLORS.length] },
        style,
      ]}
    />
  );
}

export function Confetti({ burst }: { burst: number }) {
  const { width, height } = useWindowDimensions();
  if (burst <= 0) return null;
  return (
    <>
      {Array.from({ length: PIECES }, (_, i) => (
        <Piece key={`${burst}-${i}`} i={i} burst={burst} w={width} h={height} />
      ))}
    </>
  );
}
