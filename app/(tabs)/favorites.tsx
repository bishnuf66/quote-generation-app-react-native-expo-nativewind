import { ThemedText } from "@/components/ThemedText";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { GlassCard, GradientCard } from "@/components/ui/GradientCard";
import { useQuotes } from "@/context/QuotesContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  Image as RNImage,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

const { width } = Dimensions.get("window");
const CARD_GAP = 16;
const CARD_WIDTH = (width - CARD_GAP * 3) / 2;

type QuoteType = {
  id: string;
  text: string;
  author?: string;
  backgroundImage: string;
  createdAt: string | number | Date;
  category?: string;
  imageCategory?: string;
  [key: string]: unknown;
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { savedQuotes, deleteQuote, quotes, updateQuotePosition } = useQuotes();
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(
    new Set()
  );
  const [loadingImages, setLoadingImages] = useState<{
    [key: string]: boolean;
  }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
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
    ]).start();
  }, [fadeAnim, headerAnim, slideAnim]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleImageError = (url: string) => {
    console.log("Image error for URL:", url);
    const fullUrl = url;
    setFailedImageUrls((prev) => {
      const newSet = new Set(prev);
      newSet.add(fullUrl);
      return newSet;
    });
  };

  const handleImageLoadStart = (url: string) => {
    console.log("Image load started:", url);
    const fullUrl = url;
    setLoadingImages((prev) => ({
      ...prev,
      [fullUrl]: true,
    }));
  };

  const handleImageLoadEnd = (url: string) => {
    console.log("Image load ended:", url);
    const fullUrl = url;
    setLoadingImages((prev) => ({
      ...prev,
      [fullUrl]: false,
    }));
  };

  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Change this to use React refs instead of findNodeHandle
  const viewRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    return () => {
      viewRefs.current = {};
    };
  }, []);

  const backgroundColor = colorScheme === "dark" ? "bg-black" : "bg-gray-50";
  const textColor = colorScheme === "dark" ? "text-white" : "text-gray-900";
  const secondaryText =
    colorScheme === "dark" ? "text-gray-300" : "text-gray-600";

  const handleDeleteQuote = (id: string) => {
    console.log("Attempting to delete quote with ID:", id);
    Alert.alert("Delete Quote", "Are you sure you want to delete this quote?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          console.log("Deleting quote with ID:", id);
          deleteQuote(id);
          // Also remove from failed images set if it exists
          const quote = savedQuotes.find((q) => q.id === id);
          if (quote?.backgroundImage) {
            const fullUrl = quote.backgroundImage;
            console.log("Removing image from failed set:", fullUrl);
            setFailedImageUrls((prev) => {
              const newSet = new Set(prev);
              newSet.delete(fullUrl);
              return newSet;
            });
          }
          // Clean up view ref
          delete viewRefs.current[id];
        },
        style: "destructive",
      },
    ]);
  };

  const handleEditQuote = (quote: QuoteType) => {
    // First update the current quote in the context
    const existingQuote = quotes.find((q) => q.id === quote.id);
    if (!existingQuote) {
      // If not in quotes, add it with default position
      const newQuote = {
        ...quote,
        textPosition: { x: 50, y: 50 }, // Default position if not set
      };
      updateQuotePosition(newQuote.id, newQuote.textPosition);
    }

    // Navigate to customize tab with the quote data
    router.push({
      pathname: "/customize",
      params: {
        quoteId: quote.id,
        text: quote.text,
        author: quote.author || "",
        backgroundImage: quote.backgroundImage || "",
      },
    });
  };

  const handleShareQuote = async (quote: QuoteType) => {
    try {
      const viewRef = viewRefs.current[quote.id];
      if (!viewRef) {
        console.log("No view ref found for quote:", quote.id);
        Alert.alert("Error", "Could not capture the quote. Please try again.");
        return;
      }

      console.log("Capturing view for sharing...");
      const result = await captureRef(viewRef, {
        format: "png",
        quality: 0.8,
        result: "tmpfile",
      });

      await Share.share({
        url: result,
        title: "Share Quote",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share the quote. Please try again.");
    }
  };

  const saveToGallery = async (quote: QuoteType) => {
    try {
      // Get the view ref first and check if it exists
      const viewRef = viewRefs.current[quote.id];
      console.log(
        `Attempting to save quote ${quote.id}, ref exists:`,
        !!viewRef
      );
      console.log("All stored refs:", Object.keys(viewRefs.current));

      if (!viewRef) {
        console.log("No view ref found for quote:", quote.id);
        Alert.alert(
          "Error",
          "Could not find the quote content to save. Please try again."
        );
        return;
      }

      // Wait for images to load if they're still loading
      if (loadingImages[quote.backgroundImage]) {
        console.log("Waiting for image to load...");
        Alert.alert(
          "Please wait",
          "Image is still loading. Please try again in a moment."
        );
        return;
      }

      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant permission to save images to your gallery."
        );
        return;
      }

      // Show loading indicator
      Alert.alert("Saving...", "Preparing your quote for saving...");

      // Wait a bit longer to ensure the view is rendered
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Attempting to capture view for gallery save...");

      let result;
      try {
        // Try high quality PNG first
        result = await captureRef(viewRef, {
          format: "png",
          quality: 1,
          result: "tmpfile",
          width: 1080,
          height: 1080,
        });
        console.log("Successfully captured with PNG format");
      } catch (err1) {
        console.warn("PNG capture failed, trying JPG fallback...", err1);
        try {
          // Fallback: JPG
          result = await captureRef(viewRef, {
            format: "jpg",
            quality: 0.95,
            result: "tmpfile",
            width: 1080,
            height: 1080,
          });
          console.log("Successfully captured with JPG format");
        } catch (err2) {
          console.error("Both capture attempts failed.", err2);
          throw new Error("capture_failed");
        }
      }

      // Save to gallery
      console.log("Saving to gallery:", result);
      const asset = await MediaLibrary.createAssetAsync(result);
      await MediaLibrary.createAlbumAsync("QuoteCards", asset, false);
      Alert.alert("Success", "Quote saved to your gallery!");
    } catch (error) {
      console.error("Error in saveToGallery:", error);
      let errorMessage = "Failed to save to gallery. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("permission")) {
          errorMessage =
            "Please enable storage permissions in your device settings to save images.";
        } else if (error.message.includes("view_not_found")) {
          errorMessage =
            "Could not find the quote content to save. Please try again.";
        } else if (error.message.includes("capture_failed")) {
          errorMessage =
            "Could not capture the quote image. Try scrolling and try again, or restart the app.";
        }
      }
      Alert.alert("Error", errorMessage);
    }
  };

  const renderActionButton = React.useCallback(
    (
      onPress: () => void,
      icon: string,
      color: string,
      gradientColors: [string, string, ...string[]],
      library: "FontAwesome" | "Ionicons" = "Ionicons",
      size: number = 16
    ) => {
      return (
        <View style={{ flex: 1, marginHorizontal: 2 }}>
          <TouchableOpacity onPress={onPress}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 4,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnimatedIcon
                name={icon}
                size={size}
                color={color}
                library={library}
                animationType="none"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    },
    []
  );

  if (savedQuotes.length === 0) {
    return (
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#0f0f23", "#1a1a2e", "#16213e"]
            : ["#f8fafc", "#e2e8f0", "#cbd5e1"]
        }
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-center items-center p-6">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              alignItems: "center",
            }}
          >
            <GradientCard
              gradientColors={["#667eea", "#764ba2"]}
              style={{ padding: 32, borderRadius: 60, marginBottom: 32 }}
            >
              <AnimatedIcon
                name="heart"
                size={72}
                color="white"
                animationType="pulse"
                library="FontAwesome"
              />
            </GradientCard>

            <ThemedText type="display" className="text-center mb-4" shadow>
              No Favorites Yet
            </ThemedText>

            <ThemedText
              className={`text-center ${secondaryText} mb-8 max-w-sm leading-6 text-lg`}
            >
              Save your favorite quotes and they&apos;ll appear here as
              beautiful, shareable cards
            </ThemedText>

            <View className="w-full max-w-xs" style={{ gap: 16 }}>
              <AnimatedButton
                style={{
                  marginTop: 8,
                  backgroundColor: "transparent",

                  overflow: "hidden",
                }}
                height={60}
                title="Generate a Quote"
                onPress={() => router.push("/generate")}
                gradientColors={["#667eea", "#764ba2"]}
                size="large"
                icon={
                  <AnimatedIcon
                    name="magic"
                    size={20}
                    color="white"
                    // animationType="bounce"
                    library="FontAwesome"
                  />
                }
              />

              <AnimatedButton
                title="Create Custom Quote"
                onPress={() => router.push("/customize")}
                gradientColors={["#f093fb", "#f5576c"]}
                size="medium"
                variant="outline"
                icon={
                  <AnimatedIcon
                    name="edit"
                    size={18}
                    color="white"
                    library="FontAwesome"
                  />
                }
              />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={
        colorScheme === "dark" ? ["#0f0f23", "#1a1a2e"] : ["#ffffff", "#f8fafc"]
      }
      style={{ flex: 1 }}
    >
      {/* Enhanced Header */}
      <Animated.View
        className="pt-14 pb-6 px-6"
        style={{
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <ThemedText type="hero" className={textColor} shadow>
              Favorites
            </ThemedText>
            <View className="flex-row items-center mt-2">
              <AnimatedIcon
                name="heart"
                size={16}
                color="#667eea"
                animationType="pulse"
                library="FontAwesome"
              />
              <ThemedText className={`ml-2 ${secondaryText} text-lg`}>
                {savedQuotes.length}{" "}
                {savedQuotes.length === 1 ? "quote" : "quotes"} saved
              </ThemedText>
            </View>
          </View>

          {savedQuotes.length > 0 && (
            <GlassCard
              style={{ padding: 12, borderRadius: 12 }}
              backgroundColor={
                colorScheme === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)"
              }
            >
              <AnimatedIcon
                name="grid"
                size={20}
                color={colorScheme === "dark" ? "#ffffff" : "#000000"}
                library="Ionicons"
              />
            </GlassCard>
          )}
        </View>

        {/* Decorative line */}
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 3, borderRadius: 2, marginTop: 8 }}
        />
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: CARD_GAP / 2,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#667eea", "#764ba2"]}
            tintColor="#667eea"
          />
        }
      >
        <Animated.View
          className="flex-row flex-wrap"
          style={{
            marginHorizontal: -CARD_GAP / 2,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {savedQuotes.map((quote, index) => {
            return (
              <View
                key={quote.id}
                className="mb-4"
                style={{
                  width: CARD_WIDTH,
                  marginHorizontal: CARD_GAP / 2,
                }}
              >
                <GradientCard
                  gradientColors={
                    selectedQuote === quote.id
                      ? ["#667eea", "#764ba2"]
                      : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
                  }
                  onPress={() =>
                    setSelectedQuote(
                      selectedQuote === quote.id ? null : quote.id
                    )
                  }
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    borderWidth: selectedQuote === quote.id ? 2 : 0,
                    borderColor: "#667eea",
                  }}
                >
                  {/* Content to be saved to gallery */}
                  <View
                    ref={(ref) => {
                      if (ref) {
                        viewRefs.current[quote.id] = ref;
                        console.log(`Stored ref for quote ${quote.id}:`, !!ref);
                      }
                    }}
                    className="relative"
                    collapsable={false}
                  >
                    {/* Image with overlay */}
                    <View className="aspect-square bg-gray-200 dark:bg-gray-700">
                      {quote.backgroundImage ? (
                        <>
                          {/* Use RNImage for view-shot compatibility */}
                          <RNImage
                            source={{ uri: quote.backgroundImage }}
                            style={{
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              resizeMode: "cover",
                            }}
                            onError={() => {
                              console.log(
                                "Error loading image:",
                                quote.backgroundImage
                              );
                              if (quote.backgroundImage) {
                                handleImageError(quote.backgroundImage);
                              }
                            }}
                            onLoadStart={() => {
                              if (quote.backgroundImage) {
                                handleImageLoadStart(quote.backgroundImage);
                              }
                            }}
                            onLoadEnd={() => {
                              if (quote.backgroundImage) {
                                handleImageLoadEnd(quote.backgroundImage);
                              }
                            }}
                          />
                          {loadingImages[quote.backgroundImage] && (
                            <View className="absolute inset-0 bg-black/30 items-center justify-center">
                              <ActivityIndicator color="#ffffff" size="large" />
                            </View>
                          )}
                          {failedImageUrls.has(quote.backgroundImage) && (
                            <View className="absolute inset-0 bg-gray-200 dark:bg-gray-700 items-center justify-center">
                              <Ionicons
                                name="image-outline"
                                size={48}
                                color="#9ca3af"
                              />
                              <Text className="text-gray-500 mt-2 text-center px-2">
                                Couldn&apos;t load image
                              </Text>
                            </View>
                          )}
                        </>
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Ionicons
                            name="image-outline"
                            size={48}
                            color="#9ca3af"
                          />
                          <Text className="text-gray-500 mt-2 text-center px-2">
                            No image available
                          </Text>
                        </View>
                      )}

                      <View className="absolute inset-0 bg-black/30 p-4 justify-end">
                        <Text
                          className="text-white text-base font-medium mb-2"
                          numberOfLines={3}
                          style={{
                            textShadowColor: "rgba(0,0,0,0.8)",
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                          }}
                        >
                          &quot;{quote.text}&quot;
                        </Text>
                        {quote.author && quote.author !== "Unknown" && (
                          <Text
                            className="text-cyan-300 text-sm font-medium text-right"
                            style={{
                              textShadowColor: "rgba(0,0,0,0.8)",
                              textShadowOffset: { width: 0, height: 1 },
                              textShadowRadius: 2,
                            }}
                          >
                            — {quote.author}
                          </Text>
                        )}
                        <Text
                          className="text-xs text-right text-sky-50"
                          style={{
                            textShadowColor: "rgba(0,0,0,0.8)",
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                          }}
                        >
                          {new Date(quote.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Enhanced Card Footer */}
                  <View className="p-3 bg-black/20">
                    <View className="flex-row justify-between items-center w-full">
                      {renderActionButton(
                        () => handleEditQuote(quote as QuoteType),
                        "edit",
                        "white",
                        ["#667eea", "#764ba2"],
                        "FontAwesome"
                      )}
                      {renderActionButton(
                        () => handleShareQuote(quote as QuoteType),
                        "share",
                        "white",
                        ["#4facfe", "#00f2fe"],
                        "FontAwesome"
                      )}
                      {renderActionButton(
                        () => saveToGallery(quote as QuoteType),
                        "download",
                        "white",
                        ["#11998e", "#38ef7d"],
                        "FontAwesome"
                      )}
                      {renderActionButton(
                        () => handleDeleteQuote(quote.id),
                        "trash",
                        "white",
                        ["#ff7e5f", "#feb47b"],
                        "FontAwesome"
                      )}
                    </View>

                    {/* Quote metadata */}
                    <View className="mt-3 pt-3 border-t border-white/20">
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <AnimatedIcon
                            name="tag"
                            size={12}
                            color="rgba(255,255,255,0.7)"
                            library="FontAwesome"
                          />
                          <Text className="text-white/70 text-xs ml-1">
                            {quote.category || "General"}
                          </Text>
                        </View>
                        <Text className="text-white/70 text-xs">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </GradientCard>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}
