import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';



export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  const navigateTo = (screen: string) => {
    router.push(screen);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Quotes Generator</ThemedText>
        <ThemedText>Create, customize and save beautiful quotes</ThemedText>
      </ThemedView>

      <ThemedView style={styles.featuresContainer}>
        <TouchableOpacity 
          style={[styles.featureCard, {backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#A1CEDC'}]} 
          onPress={() => navigateTo('/generate')}
        >
          <ThemedText type="subtitle">Generate Quotes</ThemedText>
          <ThemedText>Create random quotes from various categories</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureCard, {backgroundColor: colorScheme === 'dark' ? '#2D3D47' : '#B1CEDC'}]} 
          onPress={() => navigateTo('/customize')}
        >
          <ThemedText type="subtitle">Customize Quotes</ThemedText>
          <ThemedText>Create your own quotes with custom images</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureCard, {backgroundColor: colorScheme === 'dark' ? '#3D3D47' : '#C1CEDC'}]} 
          onPress={() => navigateTo('/saved')}
        >
          <ThemedText type="subtitle">Saved Quotes</ThemedText>
          <ThemedText>View and manage your saved quotes</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="subtitle">How to use</ThemedText>
        <ThemedText>1. Generate a random quote or create your own</ThemedText>
        <ThemedText>2. Customize the quote with different backgrounds</ThemedText>
        <ThemedText>3. Drag and position the text anywhere on the image</ThemedText>
        <ThemedText>4. Save your creation to your device</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: 50,
  },
  featuresContainer: {
    padding: 20,
  },
  featureCard: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    padding: 20,
    marginBottom: 30,
  },
});
