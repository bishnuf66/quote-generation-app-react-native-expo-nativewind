import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import "../global.css"
import { QuotesProvider } from '../context/QuotesContext';
import { useColorScheme } from '../hooks/useColorScheme';

// This is the root layout for the entire app
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Log any font loading errors
  useEffect(() => {
    if (error) console.error('Font loading error:', error);
  }, [error]);

  // Don't render anything until fonts are loaded
  if (!loaded) {
    return null;
  }

  return (
    <QuotesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              animation: 'fade',
            }} 
          />
          <Stack.Screen 
            name="+not-found" 
            options={{
              title: 'Not Found',
              animation: 'fade',
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </QuotesProvider>
  );
}
