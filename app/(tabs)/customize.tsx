import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useQuotes } from "@/context/QuotesContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QuoteType } from "@/types/quoteType";

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;
const IMAGE_WIDTH = screenWidth - 40; // Accounting for padding

export default function CustomizeScreen() {
  const { quotes, saveQuote, updateQuotePosition, saveToDevice } = useQuotes();
  const colorScheme = useColorScheme();
  const viewShotRef = useRef(null);
  const params = useLocalSearchParams();

  // State for quote, author, image, and draggable position
  const [customText, setCustomText] = useState("");
  const [customAuthor, setCustomAuthor] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [isCustomQuote, setIsCustomQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<null | QuoteType>(null);
  const [textDimensions, setTextDimensions] = useState({
    width: 250,
    height: 80,
  });
  const [isDragging, setIsDragging] = useState(false);

  // Animated values for position and scale
  const pan = useRef(new Animated.ValueXY({ x: 50, y: 50 })).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Update state whenever params change
  useEffect(() => {
    if (params && (params.text || params.author || params.backgroundImage)) {
      setCustomText(params.text ? String(params.text) : "");
      setCustomAuthor(params.author ? String(params.author) : "");
      setSelectedImage(
        params.backgroundImage ? String(params.backgroundImage) : ""
      );
      setIsCustomQuote(true);
      setCurrentQuote(null);

      // Set initial position from params or center
      const initialX = params.textPosition?.x || IMAGE_WIDTH / 2 - 125;
      const initialY = params.textPosition?.y || IMAGE_HEIGHT / 2 - 40;
      pan.setValue({ x: initialX, y: initialY });
    } else if (quotes.length > 0) {
      const last = quotes[quotes.length - 1];
      setCustomText(last.text || "");
      setCustomAuthor(last.author || "");
      setSelectedImage(last.backgroundImage || "");
      setIsCustomQuote(true);
      setCurrentQuote(last);

      const savedPos = last.textPosition || {
        x: IMAGE_WIDTH / 2 - 125,
        y: IMAGE_HEIGHT / 2 - 40,
      };
      pan.setValue({ x: savedPos.x, y: savedPos.y });
    } else {
      setCustomText("");
      setCustomAuthor("");
      setSelectedImage("");
      setIsCustomQuote(true);
      setCurrentQuote(null);
      pan.setValue({ x: IMAGE_WIDTH / 2 - 125, y: IMAGE_HEIGHT / 2 - 40 });
    }
  }, [params.text, params.author, params.backgroundImage, quotes.length]);

  // Create PanResponder for drag functionality
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        // Animate scale up when dragging starts
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: false,
        }).start();

        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new position
        const newX = gestureState.dx;
        const newY = gestureState.dy;

        // Apply constraints to keep text within image bounds
        const minX = -pan.x._offset;
        const maxX = IMAGE_WIDTH - textDimensions.width - pan.x._offset;
        const minY = -pan.y._offset;
        const maxY = IMAGE_HEIGHT - textDimensions.height - pan.y._offset;

        const constrainedX = Math.max(minX, Math.min(maxX, newX));
        const constrainedY = Math.max(minY, Math.min(maxY, newY));

        pan.setValue({ x: constrainedX, y: constrainedY });
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        // Animate scale back to normal
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: false,
        }).start();

        pan.flattenOffset();

        // Update position in context if we have a current quote
        if (currentQuote) {
          updateQuotePosition(currentQuote.id, {
            x: pan.x._value,
            y: pan.y._value,
          });
        }
      },
    })
  ).current;

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

  // Handle text layout to get dimensions for boundary calculations
  const onTextLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setTextDimensions({ width: width + 16, height: height + 16 }); // Add padding
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
    if (customText.trim() !== "") {
      const newQuote = {
        id: Date.now().toString(),
        text: customText,
        author: customAuthor,
        backgroundImage: selectedImage,
        createdAt: new Date().toISOString(),
        textPosition: { x: pan.x._value, y: pan.y._value },
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

  // Reset position to center
  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: IMAGE_WIDTH / 2 - 125, y: IMAGE_HEIGHT / 2 - 40 },
      useNativeDriver: false,
    }).start();
  };

  return (
    <ThemedView style={styles.container}>
      <View contentContainerStyle={{ paddingBottom: 40 }}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerText}>Customize Quote</ThemedText>
          <ThemedText style={styles.instructionText}>
            Drag the quote to position it anywhere on the image
          </ThemedText>
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
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#333" : "#f0f0f0",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <ThemedText style={styles.placeholderText}>
                  Select an image below
                </ThemedText>
              </View>
            )}

            {(customText || currentQuote) && (
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.draggableContainer,
                  {
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { scale: scale },
                    ],
                  },
                ]}
                onLayout={onTextLayout}
              >
                <View
                  style={[
                    styles.textContainer,
                    isDragging && styles.textContainerDragging,
                  ]}
                >
                  <ThemedText style={styles.quoteText}>
                    &quot;{customText || currentQuote?.text}&quot;
                  </ThemedText>
                  {(customAuthor || currentQuote?.author) && (
                    <ThemedText style={styles.authorText}>
                      - {customAuthor || currentQuote?.author}
                    </ThemedText>
                  )}
                </View>
                {/* Drag handle indicator */}
                <View
                  style={[
                    styles.dragHandle,
                    isDragging && styles.dragHandleActive,
                  ]}
                >
                  <FontAwesome
                    name="arrows"
                    size={12}
                    color={isDragging ? "#fff" : "rgba(255,255,255,0.8)"}
                  />
                </View>
              </Animated.View>
            )}
          </ViewShot>
        </ThemedView>

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetPosition}>
            <FontAwesome name="crosshairs" size={16} color="#666" />
            <ThemedText style={styles.resetButtonText}>Center</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <FontAwesome name="image" size={16} color="#666" />
            <ThemedText style={styles.uploadText}>Select Image</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={handleAddToFavorites}
          >
            <FontAwesome name="heart" size={16} color="white" />
            <ThemedText style={styles.actionButtonText}>
              Add to Favorites
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveToDevice}
          >
            <FontAwesome name="save" size={16} color="white" />
            <ThemedText style={styles.actionButtonText}>
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
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    minHeight: 50,
    fontSize: 16,
  },
  quoteInfo: {
    marginBottom: 16,
    alignItems: "center",
  },
  quoteInfoText: {
    fontStyle: "italic",
  },
  noQuoteContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  viewShot: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    fontSize: 16,
    opacity: 0.5,
  },
  draggableContainer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  textContainer: {
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 8,
    maxWidth: 280,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textContainerDragging: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    shadowOpacity: 0.4,
    elevation: 8,
  },
  quoteText: {
    color: "white",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },
  authorText: {
    color: "white",
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
    fontWeight: "500",
  },
  dragHandle: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  dragHandleActive: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  resetButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 140,
    justifyContent: "center",
  },
  favoriteButton: {
    backgroundColor: "#3b82f6",
  },
  saveButton: {
    backgroundColor: "#059669",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
});
