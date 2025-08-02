import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface LoadingSpinnerProps {
    size?: number;
    colors?: string[];
    speed?: number;
}

export function LoadingSpinner({
    size = 40,
    colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
    speed = 1000
}: LoadingSpinnerProps) {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const rotateAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: speed,
                useNativeDriver: true,
            })
        );

        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: speed / 2,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: speed / 2,
                    useNativeDriver: true,
                }),
            ])
        );

        rotateAnimation.start();
        pulseAnimation.start();

        return () => {
            rotateAnimation.stop();
            pulseAnimation.stop();
        };
    }, [rotateAnim, scaleAnim, speed]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={{
                width: size,
                height: size,
                transform: [{ rotate: spin }, { scale: scaleAnim }],
            }}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    opacity: 0.8,
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    right: 4,
                    bottom: 4,
                    backgroundColor: 'white',
                    borderRadius: (size - 8) / 2,
                }}
            />
        </Animated.View>
    );
}

export function PulsingDot({
    size = 8,
    color = '#667eea',
    delay = 0
}: {
    size?: number;
    color?: string;
    delay?: number;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1.5,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.3,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [scaleAnim, opacityAnim, delay]);

    return (
        <Animated.View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
            }}
        />
    );
}

export function LoadingDots({
    size = 8,
    color = '#667eea',
    spacing = 4
}: {
    size?: number;
    color?: string;
    spacing?: number;
}) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PulsingDot size={size} color={color} delay={0} />
            <View style={{ width: spacing }} />
            <PulsingDot size={size} color={color} delay={200} />
            <View style={{ width: spacing }} />
            <PulsingDot size={size} color={color} delay={400} />
        </View>
    );
}