import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
    Animated,
    GestureResponderEvent,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { ThemedText } from '../ThemedText';

interface AnimatedButtonProps {
    /** Button text */
    title: string;
    /** Press handler function */
    onPress: (event: GestureResponderEvent) => void;
    /** Gradient colors for background (default: ['#667eea', '#764ba2']) */
    gradientColors?: string[];
    /** Additional styles for the button container */
    style?: ViewStyle;
    /** Additional styles for the button text */
    textStyle?: TextStyle;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Optional icon to display before the text */
    icon?: React.ReactNode;
    /** Predefined size (small, medium, large) */
    size?: 'small' | 'medium' | 'large';
    /** Button style variant */
    variant?: 'gradient' | 'solid' | 'outline';
    /** Custom width (overrides size-based width) */
    width?: number | string;
    /** Custom height (overrides size-based height) */
    height?: number | string;
    /** Minimum width constraint */
    minWidth?: number | string;
    /** Minimum height constraint */
    minHeight?: number | string;
    /** Maximum width constraint */
    maxWidth?: number | string;
    /** Maximum height constraint */
    maxHeight?: number | string;
}

export function AnimatedButton({
    title,
    onPress,
    gradientColors = ['#667eea', '#764ba2'],
    style,
    textStyle,
    disabled = false,
    icon,
    size = 'medium',
    variant = 'gradient',
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
}: AnimatedButtonProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const getBaseSizeStyles = () => {
        switch (size) {
            case 'small':
                return { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 };
            case 'medium':
                return { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 };
            case 'large':
                return { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 };
            default:
                return { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 };
        }
    };

    const getContainerStyles = () => {
        const baseStyles = getBaseSizeStyles();

        // Custom dimensions for the container
        const customDimensions = {
            ...(width !== undefined && { width }),
            ...(height !== undefined && { height }),
            ...(minWidth !== undefined && { minWidth }),
            ...(minHeight !== undefined && { minHeight }),
            ...(maxWidth !== undefined && { maxWidth }),
            ...(maxHeight !== undefined && { maxHeight }),
        };

        const containerStyles = {
            borderRadius: baseStyles.borderRadius,
            ...customDimensions
        };

        // Debug log to check if custom dimensions are being applied
        if (width !== undefined || height !== undefined) {
            console.log('AnimatedButton custom dimensions:', { width, height, containerStyles });
        }

        return containerStyles;
    };

    const getContentStyles = () => {
        const baseStyles = getBaseSizeStyles();

        // If custom dimensions are provided, remove padding to let container handle sizing
        if (width !== undefined || height !== undefined) {
            return {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            };
        }

        // Use padding for default sizing
        return {
            paddingHorizontal: baseStyles.paddingHorizontal,
            paddingVertical: baseStyles.paddingVertical,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        };
    };

    const getTextSize = () => {
        switch (size) {
            case 'small':
                return 14;
            case 'medium':
                return 16;
            case 'large':
                return 18;
            default:
                return 16;
        }
    };

    const containerStyles = getContainerStyles();
    const contentStyles = getContentStyles();

    const buttonContent = (
        <Animated.View
            style={[
                contentStyles,
                {
                    opacity: disabled ? 0.5 : 1,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            {icon && <>{icon}</>}
            <ThemedText
                style={[
                    {
                        color: 'white',
                        fontWeight: '600',
                        fontSize: getTextSize(),
                        marginLeft: icon ? 8 : 0,
                    },
                    textStyle,
                ]}
            >
                {title}
            </ThemedText>
        </Animated.View>
    );

    if (variant === 'gradient') {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                activeOpacity={1}
                style={[containerStyles, style]}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        {
                            flex: 1,
                            borderRadius: containerStyles.borderRadius,
                            shadowColor: gradientColors[0],
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8,
                        }
                    ]}
                >
                    {buttonContent}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={1}
            style={[
                containerStyles,
                {
                    backgroundColor: variant === 'solid' ? gradientColors[0] : 'transparent',
                    borderWidth: variant === 'outline' ? 2 : 0,
                    borderColor: gradientColors[0],
                    shadowColor: variant === 'solid' ? gradientColors[0] : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: variant === 'solid' ? 8 : 0,
                },
                style,
            ]}
        >
            {buttonContent}
        </TouchableOpacity>
    );
}