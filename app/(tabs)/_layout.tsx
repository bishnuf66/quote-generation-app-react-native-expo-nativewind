import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          default: {
            backgroundColor: colorScheme === "dark" ? "#1a1a2e" : "#ffffff",
            borderTopWidth: 1,
            borderTopColor: colorScheme === "dark" ? "#2a2a3e" : "#e2e8f0",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 8,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => {
            try {
              return (
                <AnimatedIcon
                  name="home"
                  size={24}
                  color={color}
                  animationType={focused ? "pulse" : "none"}
                  library="FontAwesome"
                />
              );
            } catch (error) {
              return <FontAwesome name="home" size={24} color={color} />;
            }
          },
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: "Generate",
          tabBarIcon: ({ color, focused }) => {
            try {
              return (
                <AnimatedIcon
                  name="magic"
                  size={24}
                  color={color}
                  animationType={focused ? "bounce" : "none"}
                  library="FontAwesome"
                />
              );
            } catch (error) {
              console.warn('Generate tab icon error:', error);
              return <FontAwesome name="magic" size={24} color={color} />;
            }
          },
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: "Customize",
          tabBarIcon: ({ color, focused }) => {
            try {
              return (
                <AnimatedIcon
                  name="paint-brush"
                  size={24}
                  color={color}
                  animationType={focused ? "shake" : "none"}
                  library="FontAwesome"
                />
              );
            } catch (error) {
              return <FontAwesome name="paint-brush" size={24} color={color} />;
            }
          },
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => {
            try {
              return (
                <AnimatedIcon
                  name="heart"
                  size={24}
                  color={color}
                  animationType={focused ? "pulse" : "none"}
                  library="FontAwesome"
                />
              );
            } catch (error) {
              return <FontAwesome name="heart" size={24} color={color} />;
            }
          },
        }}
      />
    </Tabs>
  );
}
