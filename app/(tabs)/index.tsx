import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  View
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { GradientCard } from "@/components/ui/GradientCard";
import { SimpleDots } from "@/components/ui/SimpleLoader";
import { commonGradients } from "@/constants/Theme";
import { useColorScheme } from "@/hooks/useColorScheme";


const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim1 = useRef(new Animated.Value(0.8)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.8)).current;
  const scaleAnim3 = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
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
      ]),
      Animated.stagger(200, [
        Animated.spring(scaleAnim1, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim2, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim3, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous rotation animation for decorative element
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, rotateAnim, scaleAnim1, scaleAnim2, scaleAnim3, slideAnim]); // Run only once on mount

  const navigateTo = (screen: "/generate" | "/customize" | "/favorites") => {
    router.push(screen);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const FeatureCard = ({
    title,
    description,
    icon,
    onPress,
    scaleAnim,
    gradientColors,
    delay = 0,
  }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
    scaleAnim: Animated.Value;
    gradientColors: [string, string, ...string[]];
    delay?: number;
  }) => {
    const pressAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(pressAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
        }}
      >
        <GradientCard
          gradientColors={gradientColors}
          onPress={onPress}
          style={{ padding: 24, margin: 8, borderRadius: 20 }}
        >
          <View className="flex-row items-center mb-4">
            <View className="bg-white/20 rounded-full p-3 mr-4">
              <AnimatedIcon
                name={icon}
                size={24}
                color="white"
                animationType="bounce"
                library="FontAwesome"
              />
            </View>
            <View className="flex-1">
              <ThemedText className="text-xl font-bold text-white mb-1">
                {title}
              </ThemedText>
              <ThemedText className="text-white/90 text-sm leading-5">
                {description}
              </ThemedText>
            </View>
          </View>
          <View className="bg-white/10 h-px w-full mb-3" />
          <View className="flex-row justify-between items-center">
            <ThemedText className="text-white/80 text-xs font-medium">
              Tap to explore
            </ThemedText>
            <AnimatedIcon
              name="arrow-right"
              size={16}
              color="rgba(255,255,255,0.8)"
              animationType="bounce"
              library="FontAwesome"
            />
          </View>
        </GradientCard>
      </Animated.View>
    );
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Animated Background Elements */}
      <View className="absolute inset-0 overflow-hidden">
        <Animated.View
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10"
          style={{
            backgroundColor: colorScheme === "dark" ? "#fff" : "#000",
            transform: [{ rotate: spin }],
          }}
        />
        <Animated.View
          className="absolute top-1/3 -left-16 w-32 h-32 rounded-full opacity-5"
          style={{
            backgroundColor: colorScheme === "dark" ? "#fff" : "#000",
            transform: [{ rotate: spin }],
          }}
        />
      </View>

      {/* Header Section */}
      <Animated.View
        className="px-6 pt-16 pb-8 items-center"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="mb-6">
          <GradientCard
            gradientColors={["#667eea", "#764ba2"] as [string, string, ...string[]]}
            style={{ padding: 20, borderRadius: 50, alignSelf: "center" }}
          >
            <AnimatedIcon
              name="quote-left"
              size={40}
              color="white"
              animationType="pulse"
              library="FontAwesome"
            />
          </GradientCard>
        </View>

        <ThemedText className="text-4xl font-bold text-center mb-3 tracking-tight">
          Quotes Generator
        </ThemedText>

        <LinearGradient
          colors={["#667eea", "#764ba2"] as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 4, width: 80, borderRadius: 2, marginBottom: 16, alignSelf: "center" }}
        />

        <ThemedText className="text-lg text-center opacity-80 leading-6 px-4">
          Create, customize and save{"\n"}
          <ThemedText className="font-semibold">beautiful quotes</ThemedText>
        </ThemedText>

        {/* Loading dots animation */}
        <View className="mt-4">
          <SimpleDots color={colorScheme === "dark" ? "#667eea" : "#764ba2"} />
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-around w-full mt-8 px-4">
          <View className="items-center">
            <ThemedText className="text-2xl font-bold text-blue-500">
              100+
            </ThemedText>
            <ThemedText className="text-xs opacity-70">Categories</ThemedText>
          </View>
          <View className="items-center">
            <ThemedText className="text-2xl font-bold text-purple-500">
              ∞
            </ThemedText>
            <ThemedText className="text-xs opacity-70">
              Possibilities
            </ThemedText>
          </View>
          <View className="items-center">
            <ThemedText className="text-2xl font-bold text-green-500">
              HD
            </ThemedText>
            <ThemedText className="text-xs opacity-70">Quality</ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Feature Cards */}
      <View className="px-4 mt-6">
        <FeatureCard
          title="Generate Quotes"
          description="Discover inspiring quotes from various categories and famous personalities"
          icon="magic"
          onPress={() => navigateTo("/generate")}
          scaleAnim={scaleAnim1}
          gradientColors={commonGradients.primary}
        />

        <FeatureCard
          title="Customize Quotes"
          description="Create personalized quotes with beautiful backgrounds and custom styling"
          icon="paint-brush"
          onPress={() => navigateTo("/customize")}
          scaleAnim={scaleAnim2}
          gradientColors={commonGradients.secondary}
        />

        <FeatureCard
          title="Saved Quotes"
          description="Access your collection of saved quotes and share them with the world"
          icon="heart"
          onPress={() => navigateTo("/favorites")}
          scaleAnim={scaleAnim3}
          gradientColors={commonGradients.accent}
        />
      </View>

      {/* Bottom Info Section */}
      <Animated.View className="px-6 mt-8" style={{ opacity: fadeAnim }}>
        <View
          className={`rounded-2xl p-6 ${colorScheme === "dark" ? "bg-gray-800/50" : "bg-gray-100/80"
            }`}
        >
          <View className="flex-row items-center mb-3">
            <FontAwesome
              name="lightbulb-o"
              size={20}
              color={colorScheme === "dark" ? "#fbbf24" : "#f59e0b"}
            />
            <ThemedText className="text-lg font-semibold ml-3">
              Quick Tips
            </ThemedText>
          </View>

          <View className="space-y-2">
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3" />
              <ThemedText className="flex-1 opacity-80 leading-5">
                Multilpe Catgeory of quotes generation
              </ThemedText>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3" />
              <ThemedText className="flex-1 opacity-80 leading-5">
                Drag quotes around to position them perfectly
              </ThemedText>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3" />
              <ThemedText className="flex-1 opacity-80 leading-5">
                Save your favorites for quick access later
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Footer */}
      <View className="items-center mt-8 px-6">
        <ThemedText className="text-xs opacity-50 text-center">
          Made with ❤️ for quote lovers everywhere
        </ThemedText>
      </View>
    </ScrollView>
  );
}
