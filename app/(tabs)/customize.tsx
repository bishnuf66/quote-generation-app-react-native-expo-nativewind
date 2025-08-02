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
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import ViewShot from "react-native-view-shot";

import { ThemedText } from "@/components/ThemedText";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { GlassCard } from "@/components/ui/GradientCard";
import { useQuotes } from "@/context/QuotesContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QuoteType } from "@/types/quoteType";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;
const IMAGE_WIDTH = screenWidth - 40; // Accounting for padding

export default function CustomizeScreen() {
  const { quotes, saveQuote, updateQuotePosition, saveToDevice } = useQuotes();
  const colorScheme = useColorScheme();
  const viewShotRef = useRef<ViewShot>(null);
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
    console.log("Customize screen params:", params);
    if (params && (params.text || params.author || params.backgroundImage)) {
      console.log("Setting up from params - Custom mode");
      setCustomText(params.text ? String(params.text) : "");
      setCustomAuthor(params.author ? String(params.author) : "");
      setSelectedImage(
        params.backgroundImage ? String(params.backgroundImage) : ""
      );
      setIsCustomQuote(true);
      setCurrentQuote(null);

      // Set initial position from params or center
      const textPos = params.textPosition as any;
      const initialX = textPos?.x || IMAGE_WIDTH / 2 - 125;
      const initialY = textPos?.y || IMAGE_HEIGHT / 2 - 40;
      pan.setValue({ x: initialX, y: initialY });
    } else if (quotes.length > 0) {
      console.log("Setting up from last quote");
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
      console.log("Setting up empty state");
      setCustomText("");
      setCustomAuthor("");
      setSelectedImage("");
      setIsCustomQuote(true);
      setCurrentQuote(null);
      pan.setValue({ x: IMAGE_WIDTH / 2 - 125, y: IMAGE_HEIGHT / 2 - 40 });
    }
    console.log("Current state - isCustomQuote:", isCustomQuote, "customText:", customText);
  }, [params.text, params.author, params.backgroundImage, quotes.length, params, quotes, isCustomQuote, customText, pan]);

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

        const panX = pan.x as any;
        const panY = pan.y as any;
        pan.setOffset({
          x: panX._value || 0,
          y: panY._value || 0,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new position
        const newX = gestureState.dx;
        const newY = gestureState.dy;

        // Apply constraints to keep text within image bounds
        const panX = pan.x as any;
        const panY = pan.y as any;
        const minX = -(panX._offset || 0);
        const maxX = IMAGE_WIDTH - textDimensions.width - (panX._offset || 0);
        const minY = -(panY._offset || 0);
        const maxY = IMAGE_HEIGHT - textDimensions.height - (panY._offset || 0);

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
          const panX = pan.x as any;
          const panY = pan.y as any;
          updateQuotePosition(currentQuote.id, {
            x: panX._value || 0,
            y: panY._value || 0,
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
      console.log("Image selected:", result.assets[0].uri);
      setSelectedImage(result.assets[0].uri);
    } else {
      console.log("Image selection cancelled or failed");
    }
  };

  // Handle text layout to get dimensions for boundary calculations
  const onTextLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setTextDimensions({ width: width + 16, height: height + 16 }); // Add padding
  };

  // Save the customized quote
  const handleSaveToDevice = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        if (uri) {
          await saveToDevice(uri);
          Alert.alert("Success", "Quote saved to device!");
        }
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
        textPosition: { x: (pan.x as any)._value || 0, y: (pan.y as any)._value || 0 },
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
    <LinearGradient
      colors={
        colorScheme === "dark"
          ? ["#0f0f23", "#1a1a2e"]
          : ["#ffffff", "#f8fafc"]
      }
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <ThemedText type="hero" shadow>
                Customize
              </ThemedText>
              <ThemedText style={{
                color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
                fontSize: 16,
                marginTop: 4
              }}>
                Drag the quote to position it perfectly
              </ThemedText>
            </View>

            <GlassCard
              style={{ padding: 12, borderRadius: 12 }}
              backgroundColor={colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
            >
              <AnimatedIcon
                name="magic"
                size={20}
                color={colorScheme === "dark" ? "#ffffff" : "#000000"}
                animationType="pulse"
                library="FontAwesome"
              />
            </GlassCard>
          </View>

          {/* Decorative line */}
          <LinearGradient
            colors={["#667eea", "#764ba2", "#f093fb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3, borderRadius: 2 }}
          />
        </View>

        {/* Mode Toggle and Instructions */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <AnimatedButton
              title={isCustomQuote ? "Custom Mode" : "Edit Mode"}
              onPress={() => setIsCustomQuote(!isCustomQuote)}
              gradientColors={isCustomQuote ? ["#667eea", "#764ba2"] : ["#f093fb", "#f5576c"]}
              size="small"
              icon={
                <AnimatedIcon
                  name={isCustomQuote ? "edit" : "plus"}
                  size={14}
                  color="white"
                  library="FontAwesome"
                />
              }
              style={{ flex: 1, marginRight: 8 }}
            />

            <AnimatedButton
              title="Clear All"
              onPress={() => {
                setCustomText("");
                setCustomAuthor("");
                setSelectedImage("");
                setCurrentQuote(null);
                resetPosition();
              }}
              gradientColors={["#ff7e5f", "#feb47b"]}
              size="small"
              variant="outline"
              icon={
                <AnimatedIcon
                  name="trash"
                  size={14}
                  color="white"
                  library="FontAwesome"
                />
              }
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          <GlassCard
            style={{ padding: 16, borderRadius: 12 }}
            backgroundColor={colorScheme === "dark" ? "rgba(102, 126, 234, 0.1)" : "rgba(102, 126, 234, 0.05)"}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <AnimatedIcon
                name="lightbulb-o"
                size={16}
                color="#667eea"
                library="FontAwesome"
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <ThemedText style={{ fontWeight: '600', marginBottom: 4 }}>
                  {isCustomQuote ? "Custom Mode:" : "Edit Mode:"}
                </ThemedText>
                <ThemedText style={{ fontSize: 14, opacity: 0.8, lineHeight: 20 }}>
                  {isCustomQuote
                    ? "1. Enter your quote and author\n2. Select a background image\n3. Drag the quote to position it perfectly"
                    : "1. Modify the existing quote\n2. Change the background image\n3. Reposition the text as needed"
                  }
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Always Show Input Fields */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <GlassCard
            style={{ padding: 20, borderRadius: 16, marginBottom: 16 }}
            backgroundColor={colorScheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <AnimatedIcon
                name="quote-left"
                size={16}
                color="#667eea"
                library="FontAwesome"
              />
              <ThemedText style={{ marginLeft: 8, fontWeight: '600' }}>
                {isCustomQuote ? "Your Quote" : "Edit Quote"}
              </ThemedText>
            </View>
            <TextInput
              style={[
                {
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  borderRadius: 12,
                  padding: 12,
                }
              ]}
              placeholder={isCustomQuote ? "Enter your inspirational quote..." : "Edit the quote text..."}
              placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
              value={customText}
              onChangeText={setCustomText}
              multiline
              editable={true}
            />
          </GlassCard>

          <GlassCard
            style={{ padding: 20, borderRadius: 16 }}
            backgroundColor={colorScheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <AnimatedIcon
                name="user"
                size={16}
                color="#667eea"
                library="FontAwesome"
              />
              <ThemedText style={{ marginLeft: 8, fontWeight: '600' }}>
                Author
              </ThemedText>
            </View>
            <TextInput
              style={[
                {
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  fontSize: 16,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  borderRadius: 12,
                  padding: 12,
                }
              ]}
              placeholder="Author name (optional)"
              placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#666"}
              value={customAuthor}
              onChangeText={setCustomAuthor}
              editable={true}
            />
          </GlassCard>
        </View>

        {/* Enhanced Image Container */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View style={{
            height: IMAGE_HEIGHT,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: colorScheme === "dark" ? "#667eea" : "#764ba2",
            shadowColor: "#667eea",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <ViewShot ref={viewShotRef} style={{ flex: 1, position: "relative" }}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={{ flex: 1, width: "100%", height: "100%" }}
                />
              ) : (
                <LinearGradient
                  colors={colorScheme === "dark" ? ["#1a1a2e", "#16213e"] : ["#f8fafc", "#e2e8f0"]}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AnimatedIcon
                    name="image"
                    size={48}
                    color={colorScheme === "dark" ? "#667eea" : "#764ba2"}
                    animationType="pulse"
                    library="FontAwesome"
                  />
                  <ThemedText style={{
                    fontSize: 18,
                    marginTop: 12,
                    opacity: 0.7,
                    textAlign: "center"
                  }}>
                    Tap &quot;Select Image&quot; to add background
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: 14,
                    marginTop: 4,
                    opacity: 0.5,
                    textAlign: "center"
                  }}>
                    Your quote will appear here
                  </ThemedText>
                </LinearGradient>
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
          </View>
        </View>

        {/* Enhanced Controls */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AnimatedButton
              title="Center Text"
              onPress={resetPosition}
              gradientColors={["#4facfe", "#00f2fe"]}
              size="small"
              icon={
                <AnimatedIcon
                  name="crosshairs"
                  size={14}
                  color="white"
                  library="FontAwesome"
                />
              }
              style={{ flex: 1, marginRight: 8 }}
            />

            <AnimatedButton
              title="Select Image"
              onPress={pickImage}
              gradientColors={["#f093fb", "#f5576c"]}
              size="small"
              icon={
                <AnimatedIcon
                  name="image"
                  size={14}
                  color="white"
                  animationType="pulse"
                  library="FontAwesome"
                />
              }
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <AnimatedButton
              title="Add to Favorites"
              onPress={handleAddToFavorites}
              gradientColors={["#667eea", "#764ba2"]}
              size="medium"
              icon={
                <AnimatedIcon
                  name="heart"
                  size={16}
                  color="white"
                  animationType="pulse"
                  library="FontAwesome"
                />
              }
              style={{ flex: 1, marginHorizontal: 8 }}
            />

            <AnimatedButton
              title="Save to Device"
              onPress={handleSaveToDevice}
              gradientColors={["#11998e", "#38ef7d"]}
              size="medium"
              icon={
                <AnimatedIcon
                  name="download"
                  size={16}
                  color="white"
                  library="FontAwesome"
                />
              }
              style={{ flex: 1, marginHorizontal: 8 }}
            />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
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
