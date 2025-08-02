import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface SimpleLoaderProps {
    size?: number;
    color?: string;
}

export function SimpleLoader({ size = 40, color = '#667eea' }: SimpleLoaderProps) {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        );

        animation.start();

        return () => animation.stop();
    }, [rotateAnim]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={{
                width: size,
                height: size,
                borderWidth: 3,
                borderColor: `${color}30`,
                borderTopColor: color,
                borderRadius: size / 2,
                transform: [{ rotate: spin }],
            }}
        />
    );
}

export function SimpleDots({ color = '#667eea' }: { color?: string }) {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const createAnimation = (animValue: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0.3,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );

        const anim1 = createAnimation(dot1, 0);
        const anim2 = createAnimation(dot2, 200);
        const anim3 = createAnimation(dot3, 400);

        anim1.start();
        anim2.start();
        anim3.start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, [dot1, dot2, dot3]);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Animated.View
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: color,
                    marginHorizontal: 2,
                    opacity: dot1,
                }}
            />
            <Animated.View
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: color,
                    marginHorizontal: 2,
                    opacity: dot2,
                }}
            />
            <Animated.View
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: color,
                    marginHorizontal: 2,
                    opacity: dot3,
                }}
            />
        </View>
    );
}