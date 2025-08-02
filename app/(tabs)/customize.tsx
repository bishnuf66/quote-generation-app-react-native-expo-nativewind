import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import ViewShot, { ViewShotProperties } from 'react-native-view-shot';
import Draggable from 'react-native-draggable';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useQuotes } from '@/context/QuotesContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const backgroundImages = [
  'https://source.unsplash.com/random/800x600/?nature',
  'https://source.unsplash.com/random/800x600/?beach',
  'https://source.unsplash.com/random/800x600/?mountain',
  'https://source.unsplash.com/random/800x600/?sunset',
  'https://source.unsplash.com/random/800x600/?city',
];

export default function CustomizeScreen() {
  const { quotes, saveQuote, updateQuotePosition, saveToDevice } = useQuotes();
  const colorScheme = useColorScheme();
  const viewShotRef = useRef<any>(null);
  
  const [customText, setCustomText] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [selectedImage, setSelectedImage] = useState(backgroundImages[0]);
  const [isCustomQuote, setIsCustomQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(quotes.length > 0 ? quotes[quotes.length - 1] : null);

  // Handle image selection from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Handle text position update
  const handleDragRelease = (x: number, y: number) => {
    if (currentQuote) {
      updateQuotePosition(currentQuote.id, { x, y });
    }
  };

  // Save the customized quote
  const handleSaveQuote = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        
        // Save to device
        await saveToDevice(uri);
        
        // Save to app
        if (isCustomQuote) {
          const newQuote = {
            id: Date.now().toString(),
            text: customText,
            author: customAuthor,
            backgroundImage: selectedImage,
            textPosition: { x: 50, y: 50 },
            createdAt: new Date(),
          };
          await saveQuote(newQuote);
          setCurrentQuote(newQuote);
        } else if (currentQuote) {
          const updatedQuote = {
            ...currentQuote,
            backgroundImage: selectedImage,
          };
          await saveQuote(updatedQuote);
        }
        
        Alert.alert('Success', 'Quote saved to your device and app');
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      Alert.alert('Error', 'Failed to save quote');
    }
  };

  // Toggle between custom quote and generated quote
  const toggleQuoteMode = () => {
    setIsCustomQuote(!isCustomQuote);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Customize Quote</ThemedText>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleQuoteMode}>
          <ThemedText style={styles.toggleButtonText}>
            {isCustomQuote ? 'Use Generated Quote' : 'Create Custom Quote'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {isCustomQuote ? (
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
            placeholder="Enter your quote"
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
            value={customText}
            onChangeText={setCustomText}
            multiline
          />
          <TextInput
            style={[styles.textInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
            placeholder="Author (optional)"
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
            value={customAuthor}
            onChangeText={setCustomAuthor}
          />
        </ThemedView>
      ) : currentQuote ? (
        <ThemedView style={styles.quoteInfo}>
          <ThemedText style={styles.quoteInfoText}>
            Drag the quote text to position it on the image
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.noQuoteContainer}>
          <ThemedText>No quote selected. Generate a quote first or create a custom one.</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.imageContainer}>
        <ViewShot ref={viewShotRef} style={styles.viewShot}>
          <Image source={{ uri: selectedImage }} style={styles.backgroundImage} />
          
          {isCustomQuote ? (
            <View style={styles.customTextContainer}>
              <Draggable x={50} y={50} onDragRelease={(event, gestureState) => {
                handleDragRelease(gestureState.moveX, gestureState.moveY);
              }}>
                <View style={styles.textContainer}>
                  <ThemedText style={styles.quoteText}>"{customText}"</ThemedText>
                  {customAuthor ? (
                    <ThemedText style={styles.authorText}>- {customAuthor}</ThemedText>
                  ) : null}
                </View>
              </Draggable>
            </View>
          ) : currentQuote ? (
            <Draggable 
              x={currentQuote.textPosition?.x || 50} 
              y={currentQuote.textPosition?.y || 50}
              onDragRelease={(event, gestureState) => {
                handleDragRelease(gestureState.moveX, gestureState.moveY);
              }}
            >
              <View style={styles.textContainer}>
                <ThemedText style={styles.quoteText}>"{currentQuote.text}"</ThemedText>
                {currentQuote.author ? (
                  <ThemedText style={styles.authorText}>- {currentQuote.author}</ThemedText>
                ) : null}
              </View>
            </Draggable>
          ) : null}
        </ViewShot>
      </ThemedView>

      <ThemedView style={styles.backgroundSelector}>
        <ThemedText type="subtitle">Select Background</ThemedText>
        <View style={styles.backgroundOptions}>
          {backgroundImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.backgroundOption, selectedImage === image && styles.selectedBackground]}
              onPress={() => setSelectedImage(image)}
            >
              <Image source={{ uri: image }} style={styles.backgroundThumbnail} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <ThemedText style={styles.uploadButtonText}>+</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveQuote}>
        <ThemedText style={styles.saveButtonText}>Save Quote</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  toggleButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1D3D47',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 40,
  },
  quoteInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  quoteInfoText: {
    fontStyle: 'italic',
  },
  noQuoteContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  viewShot: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  customTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textContainer: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    maxWidth: 250,
  },
  quoteText: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  authorText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  backgroundSelector: {
    marginBottom: 20,
  },
  backgroundOptions: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  backgroundOption: {
    width: 60,
    height: 60,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  selectedBackground: {
    borderWidth: 2,
    borderColor: '#1D3D47',
  },
  backgroundThumbnail: {
    width: '100%',
    height: '100%',
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 5,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1D3D47',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});