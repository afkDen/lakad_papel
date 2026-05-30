import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashIndex() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bgFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation sequence
    Animated.sequence([
      // 1. Logo fades in and scales up with a spring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 2. Tagline slides up and fades in
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 3. Brief pause to let user appreciate the branding
      Animated.delay(800),
      // 4. Subtle pulse before exit
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      // 5. Fade out everything
      Animated.parallel([
        Animated.timing(bgFade, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      router.replace('/checklist');
    }
  }, [ready]);

  return (
    <Animated.View style={[styles.container, { opacity: bgFade }]}>      
      {/* Subtle radial gradient feel with layered circles */}
      <View style={styles.bgCircleOuter} />
      <View style={styles.bgCircleInner} />

      {/* Main Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, pulseAnim) },
            ],
          },
        ]}
      >
        <Image
          source={require('../assets/Untitled design (7).png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          },
        ]}
      >
        Your Civic Document Companion
      </Animated.Text>

      {/* Version tag */}
      <Animated.Text
        style={[
          styles.version,
          { opacity: taglineOpacity },
        ]}
      >
        v1.0.0
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircleOuter: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: SCREEN_WIDTH * 0.6,
    backgroundColor: 'rgba(141, 75, 0, 0.03)',
  },
  bgCircleInner: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    backgroundColor: 'rgba(141, 75, 0, 0.05)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
  },
  logoImage: {
    width: SCREEN_WIDTH * 1.1,
    height: SCREEN_WIDTH * 1.1,
  },
  tagline: {
    marginTop: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#8d4b00',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(141, 75, 0, 0.4)',
    letterSpacing: 0.3,
  },
});
