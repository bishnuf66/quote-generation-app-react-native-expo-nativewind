import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: "Oops!", headerShown: false }} />
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1a1a2e", "#16213e", "#0f3460"]
            : ["#667eea", "#764ba2", "#f093fb"]
        }
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: "center",
            }}
          >
            {/* Animated 404 Icon */}
            <View className="mb-8">
              <AnimatedIcon
                name="exclamation-triangle"
                size={80}
                color="rgba(255, 255, 255, 0.9)"
                animationType="bounce"
                library="FontAwesome"
              />
            </View>

            {/* Error Message */}
            <ThemedText className="text-4xl font-bold text-white text-center mb-4">
              404
            </ThemedText>

            <ThemedText className="text-xl font-semibold text-white/90 text-center mb-2">
              Page Not Found
            </ThemedText>

            <ThemedText className="text-base text-white/70 text-center mb-8 leading-6">
              The page you're looking for doesn't exist.{"\n"}
              Let's get you back on track!
            </ThemedText>

            {/* Action Buttons */}
            <View className="w-full max-w-xs">
              <Link href="/" asChild>
                <AnimatedButton
                  title="Go Home"
                  onPress={() => { }}
                  gradientColors={["#4facfe", "#00f2fe"]}
                  size="large"
                  icon={
                    <AnimatedIcon
                      name="home"
                      size={20}
                      color="white"
                      library="FontAwesome"
                    />
                  }
                  style={{ marginBottom: 16 }}
                />
              </Link>

              <Link href="/generate" asChild>
                <AnimatedButton
                  title="Generate Quote"
                  onPress={() => { }}
                  gradientColors={["#667eea", "#764ba2"]}
                  size="medium"
                  variant="outline"
                  icon={
                    <AnimatedIcon
                      name="sparkles"
                      size={18}
                      color="white"
                      library="Ionicons"
                    />
                  }
                />
              </Link>
            </View>

            {/* Decorative Elements */}
            <View className="absolute -top-20 -right-20 opacity-10">
              <AnimatedIcon
                name="quote-left"
                size={120}
                color="white"
                animationType="rotate"
                library="FontAwesome"
              />
            </View>

            <View className="absolute -bottom-16 -left-16 opacity-5">
              <AnimatedIcon
                name="quote-right"
                size={100}
                color="white"
                animationType="pulse"
                library="FontAwesome"
              />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </>
  );
}
