import { SimpleLoader } from "@/components/ui/SimpleLoader";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { QuotesProvider } from "../context/QuotesContext";
import "../global.css";
import { useColorScheme } from "../hooks/useColorScheme";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Custom theme with enhanced colors
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#667eea',
    background: '#0f0f23',
    card: '#1a1a2e',
    text: '#ffffff',
    border: '#2a2a3e',
    notification: '#f093fb',
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#667eea',
    background: '#ffffff',
    card: '#f8fafc',
    text: '#1a202c',
    border: '#e2e8f0',
    notification: '#f093fb',
  },
};

// This is the root layout for the entire app
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    // Add more fonts if available
  });

  // Log any font loading errors
  useEffect(() => {
    if (error) console.error("Font loading error:", error);
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      // Hide the splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Show custom loading screen while fonts are loading
  if (!loaded && !error) {
    return (
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#0f0f23", "#1a1a2e", "#16213e"]
            : ["#667eea", "#764ba2", "#f093fb"]
        }
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <SimpleLoader
          size={60}
          color="#667eea"
        />
      </LinearGradient>
    );
  }

  return (
    <QuotesProvider>
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 300,
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              title: "Not Found",
              animation: "slide_from_bottom",
              presentation: "modal",
            }}
          />
        </Stack>
        <StatusBar
          style={colorScheme === "dark" ? "light" : "dark"}
        />
      </ThemeProvider>
    </QuotesProvider>
  );
}
