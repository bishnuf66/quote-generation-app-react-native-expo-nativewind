import { LinearGradient } from 'expo-linear-gradient';

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { AnimatedIcon } from './AnimatedIcon';
import { LoadingSpinner } from './LoadingSpinner';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onAnimationComplete?: () => void;
    duration?: number;
}

export function SplashScreen({
    onAnimationComplete,
    duration = 3000
}: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animationSequence = Animated.sequence([
            // Initial fade in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
            // Slide up text
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            // Hold for a moment
            Animated.delay(1000),
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]);

        // Continuous rotation for background element
        const rotationAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 10000,
                useNativeDriver: true,
            })
        );

        animationSequence.start(() => {
            onAnimationComplete?.();
        });

        rotationAnimation.start();

        return () => {
            animationSequence.stop();
            rotationAnimation.stop();
        };
    }, [fadeAnim, scaleAnim, slideAnim, rotateAnim, onAnimationComplete]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* Background decorative elements */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: height * 0.1,
                    right: width * 0.1,
                    transform: [{ rotate: spin }],
                    opacity: 0.1,
                }}
            >
                <AnimatedIcon
                    name="quote-left"
                    size={120}
                    color="white"
                    library="FontAwesome"
                />
            </Animated.View>

            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: height * 0.2,
                    left: width * 0.1,
                    transform: [{ rotate: spin }],
                    opacity: 0.1,
                }}
            >
                <AnimatedIcon
                    name="quote-right"
                    size={100}
                    color="white"
                    library="FontAwesome"
                />
            </Animated.View>

            {/* Main content */}
            <Animated.View
                style={{
                    alignItems: 'center',
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                }}
            >
                {/* Logo/Icon */}
                <View
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 50,
                        padding: 24,
                        marginBottom: 32,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 16,
                    }}
                >
                    <AnimatedIcon
                        name="quote-left"
                        size={48}
                        color="white"
                        animationType="pulse"
                        library="FontAwesome"
                    />
                </View>

                {/* App Title */}
                <Animated.View
                    style={{
                        transform: [{ translateY: slideAnim }],
                        alignItems: 'center',
                    }}
                >
                    <ThemedText
                        style={{
                            fontSize: 36,
                            fontWeight: '900',
                            color: 'white',
                            textAlign: 'center',
                            marginBottom: 8,
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 2 },
                            textShadowRadius: 4,
                        }}
                    >
                        QuotesApp
                    </ThemedText>

                    <ThemedText
                        style={{
                            fontSize: 16,
                            color: 'rgba(255, 255, 255, 0.9)',
                            textAlign: 'center',
                            marginBottom: 32,
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                        }}
                    >
                        Beautiful quotes, beautifully crafted
                    </ThemedText>

                    {/* Loading indicator */}
                    <LoadingSpinner
                        size={40}
                        colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
                        speed={1500}
                    />
                </Animated.View>
            </Animated.View>

            {/* Bottom decorative dots */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 60,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                {[0, 1, 2].map((index) => (
                    <Animated.View
                        key={index}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            marginHorizontal: 4,
                            opacity: fadeAnim,
                        }}
                    />
                ))}
            </View>
        </LinearGradient>
    );
}