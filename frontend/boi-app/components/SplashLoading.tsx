import { useEffect } from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

type ParticleSpec = {
  size: number;
  top: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  delay: number;
};

const PARTICLES: ParticleSpec[] = [
  { size: 8, top: '22%', left: '18%', delay: 0 },
  { size: 5, top: '28%', right: '22%', delay: 700 },
  { size: 4, top: '48%', left: '12%', delay: 1300 },
  { size: 6, top: '54%', right: '14%', delay: 400 },
  { size: 7, top: '70%', left: '28%', delay: 900 },
  { size: 4, top: '78%', right: '30%', delay: 1500 },
];

function Particle({ size, delay, top, left, right }: ParticleSpec) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
  }, [delay, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size / 2, top, left, right },
        animStyle,
      ]}
    />
  );
}

export function SplashLoading() {
  const logoScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.35);
  const glowScale = useSharedValue(1);
  const progress = useSharedValue(0);
  const dotsOpacity = useSharedValue(0.6);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false,
    );

    dotsOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
    );
  }, [logoScale, glowOpacity, glowScale, progress, dotsOpacity]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const glowAnimStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const progressAnimStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const dotsAnimStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#16A34A', '#1FB755', '#22C55E']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.logoGlow, glowAnimStyle]} />
          <Animated.View style={[styles.logoBox, logoAnimStyle]}>
            <Ionicons name="storefront" size={56} color="#16A34A" />
          </Animated.View>
        </View>

        <Text style={styles.title}>Agregis</Text>
        <Text style={styles.subtitle}>Marketplace de Gado</Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressAnimStyle]} />
        </View>

        <Animated.Text style={[styles.loadingText, dotsAnimStyle]}>
          Carregando...
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
  },
  logoBox: {
    width: 116,
    height: 116,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontFamily: 'Inter-ExtraBold',
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.3,
    marginBottom: 36,
  },
  progressTrack: {
    width: 220,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.4,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
