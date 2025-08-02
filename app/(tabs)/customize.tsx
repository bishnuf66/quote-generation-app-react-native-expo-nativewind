import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Draggable from "react-native-draggable";
import ViewShot from "react-native-view-shot";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useQuotes } from "@/context/QuotesContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function CustomizeScreen() {
  const { quotes, saveQuote, updateQuotePosition, saveToDevice } = useQuotes();
  const colorScheme = useColorScheme();
  const viewShotRef = useRef<any>(null);
  const params = useLocalSearchParams();

  // State for quote, author, image, and draggable position
  const [customText, setCustomText] = useState("");
  const [customAuthor, setCustomAuthor] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [isCustomQuote, setIsCustomQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 50, y: 50 });
  // Update state whenever params change (for navigation from saved or generate tab)
  useEffect(() => {
    if (params && (params.text || params.author || params.backgroundImage)) {
      setCustomText(params.text ? String(params.text) : "");
      setCustomAuthor(params.author ? String(params.author) : "");
      setSelectedImage(
        params.backgroundImage ? String(params.backgroundImage) : ""
      );
      setIsCustomQuote(true); // Open in edit mode
      setCurrentQuote(null); // Not using context quote
      setDragPos({ x: 50, y: 50 });
    } else if (quotes.length > 0) {
      // Fallback to last quote in context
      const last = quotes[quotes.length - 1];
      setCustomText(last.text || "");
      setCustomAuthor(last.author || "");
      setSelectedImage(last.backgroundImage || "");
      setIsCustomQuote(true);
      setCurrentQuote(last);
      setDragPos(last.textPosition || { x: 50, y: 50 });
    } else {
      setCustomText("");
      setCustomAuthor("");
      setSelectedImage("");
      setIsCustomQuote(true);
      setCurrentQuote(null);
      setDragPos({ x: 50, y: 50 });
    }
  }, [params.text, params.author, params.backgroundImage, quotes.length]);

  // Handle image selection from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your photos"
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Handle text position update
  const handleDragRelease = (e, gestureState) => {
    setDragPos({
      x: gestureState.moveX || dragPos.x,
      y: gestureState.moveY || dragPos.y,
    });
    if (currentQuote) {
      updateQuotePosition(currentQuote.id, {
        x: gestureState.moveX,
        y: gestureState.moveY,
      });
    }
  };

  // Save the customized quote
  const handleSaveToDevice = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await saveToDevice(uri);
        Alert.alert("Success", "Quote saved to device!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save quote to device.");
    }
  };

  const handleAddToFavorites = async () => {
    // Save the current custom state as a new favorite
    if (customText.trim() !== "") {
      const newQuote = {
        id: Date.now().toString(),
        text: customText,
        author: customAuthor,
        backgroundImage: selectedImage,
        createdAt: new Date().toISOString(),
        textPosition: dragPos,
      };
      try {
        await saveQuote(newQuote);
        Alert.alert("Success", "Quote added to favorites!");
      } catch (error) {
        Alert.alert("Error", "Failed to save quote to favorites.");
      }
    } else {
      Alert.alert("Error", "Please enter a quote before saving.");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View contentContainerStyle={{ paddingBottom: 40 }}>
        <ThemedView style={styles.header}>
          <ThemedText>Customize Quote</ThemedText>
        </ThemedView>

        {isCustomQuote ? (
          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                { color: colorScheme === "dark" ? "#fff" : "#000" },
              ]}
              placeholder="Enter your quote"
              placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
              value={customText}
              onChangeText={setCustomText}
              multiline
            />
            <TextInput
              style={[
                styles.textInput,
                { color: colorScheme === "dark" ? "#fff" : "#000" },
              ]}
              placeholder="Author (optional)"
              placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
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
            <ThemedText>
              No quote selected. Generate a quote first or create a custom one.
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.imageContainer}>
          <ViewShot ref={viewShotRef} style={styles.viewShot}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.backgroundImage}
              />
            ) : (
              <View
                style={[
                  styles.backgroundImage,
                  { backgroundColor: "transparent" },
                ]}
              />
            )}
            <View style={styles.customTextContainer}>
              <Draggable
                x={dragPos.x}
                y={dragPos.y}
                onDragRelease={handleDragRelease}
              >
                <View style={styles.textContainer}>
                  <ThemedText style={styles.quoteText}>
                    &quot;{customText}&quot;
                  </ThemedText>
                  {customAuthor ? (
                    <ThemedText style={styles.authorText}>
                      - {customAuthor}
                    </ThemedText>
                  ) : null}
                </View>
              </Draggable>
            </View>
          </ViewShot>
        </ThemedView>

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <ThemedText style={styles.uploadButtonText}>+</ThemedText>
          </TouchableOpacity>
          <ThemedText style={{ marginTop: 8 }}>
            Select Image from Gallery
          </ThemedText>
        </View>

        <View className="flex-row justify-around mt-5">
          <TouchableOpacity
            className="bg-blue-600 px-4 py-3 rounded-lg flex-row items-center"
            onPress={handleAddToFavorites}
          >
            <FontAwesome name="heart" size={16} color="white" />
            <ThemedText className="text-white font-bold ml-2">
              Add to Favorites
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-700 px-4 py-3 rounded-lg flex-row items-center"
            onPress={handleSaveToDevice}
          >
            <FontAwesome name="save" size={16} color="white" />
            <ThemedText className="text-white font-bold ml-2">
              Save to Device
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  toggleButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1D3D47",
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 40,
  },
  quoteInfo: {
    marginBottom: 20,
    alignItems: "center",
  },
  quoteInfoText: {
    fontStyle: "italic",
  },
  noQuoteContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  viewShot: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  customTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textContainer: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 5,
    maxWidth: 250,
  },
  quoteText: {
    color: "white",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  authorText: {
    color: "white",
    fontSize: 12,
    textAlign: "right",
    marginTop: 5,
  },
  uploadButton: {
    width: 60,
    height: 60,
    borderRadius: 5,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
