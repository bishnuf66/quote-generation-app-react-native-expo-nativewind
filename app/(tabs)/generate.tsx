import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemedText } from "@/components/ThemedText";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { GlassCard } from "@/components/ui/GradientCard";
import { SimpleDots, SimpleLoader } from "@/components/ui/SimpleLoader";
import { fallbackQuotes } from "@/constants/fallbackQuotes";
import { commonGradients } from "@/constants/Theme";
import { useQuotes } from "@/context/QuotesContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";

type QuoteCategory =
  | "inspirational"
  | "motivational"
  | "life"
  | "success"
  | "funny"
  | "love";

type ImageCategory = {
  id: string;
  name: string;
  query: string;
  icon: keyof typeof FontAwesome.glyphMap;
};

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export default function GenerateScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { addQuote, saveQuote, saveToDevice } = useQuotes();
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(
    null
  );
  const [backgroundUrl, setBackgroundUrl] = useState<string>(
    "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg"
  );
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuoteCategory, setSelectedQuoteCategory] =
    useState<QuoteCategory>("inspirational");
  const [selectedImageCategory, setSelectedImageCategory] =
    useState<string>("nature");
  const viewShotRef = useRef<ViewShot>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const refreshRotateAnim = useRef(new Animated.Value(0)).current;

  const quoteCategories: QuoteCategory[] = [
    "inspirational",
    "motivational",
    "life",
    "success",
    "funny",
    "love",
  ];

  const imageCategories: ImageCategory[] = [
    { id: "nature", name: "Nature", query: "nature landscape", icon: "tree" },
    {
      id: "abstract",
      name: "Abstract",
      query: "abstract art",
      icon: "paint-brush",
    },
    {
      id: "city",
      name: "City",
      query: "city urban architecture",
      icon: "building",
    },
    {
      id: "space",
      name: "Space",
      query: "galaxy universe cosmos",
      icon: "star",
    },
    { id: "ocean", name: "Ocean", query: "ocean beach sea", icon: "ship" },
    {
      id: "minimal",
      name: "Minimal",
      query: "minimal aesthetic",
      icon: "window-minimize",
    },
  ];

  // Load Pexels API key from environment variables
  const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY;

  const fetchRandomImage = useCallback(
    async (categoryId: string = selectedImageCategory) => {
      setImageLoading(true);
      try {
        let query = "nature";
        const category = imageCategories.find((cat) => cat.id === categoryId);
        if (category) {
          query = category.query;
        }

        console.log("Fetching image with query:", query);

        // Get a random page (Pexels returns 15 results per page, we'll use first 5 pages for variety)
        const randomPage = Math.floor(Math.random() * 5) + 1;

        console.log("Making API request to Pexels...");
        const response = await axios.get("https://api.pexels.com/v1/search", {
          params: {
            query,
            per_page: 15,
            page: randomPage,
            orientation: "landscape",
          },
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        });

        console.log("Pexels API response status:", response.status);

        if (
          response.data &&
          response.data.photos &&
          response.data.photos.length > 0
        ) {
          // Select a random photo from the results
          const randomIndex = Math.floor(
            Math.random() * response.data.photos.length
          );
          const photo: PexelsPhoto = response.data.photos[randomIndex];

          console.log("Selected photo URL:", photo.src.large);

          // Use the large image URL (you can also use photo.src.medium or other sizes)
          setBackgroundUrl(photo.src.large);
        } else {
          // Fallback to a default image if no results
          setBackgroundUrl(
            "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg"
          );
        }
      } catch (error) {
        console.error("Error fetching image from Pexels:", error);
        // Fallback to a default image on error
        setBackgroundUrl(
          "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg"
        );
      } finally {
        setImageLoading(false);
      }
    },
    [PEXELS_API_KEY, imageCategories, selectedImageCategory]
  );

  const getRandomFallbackQuote = (category: QuoteCategory) => {
    const quotes = fallbackQuotes[category] || fallbackQuotes.inspirational;
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const fetchQuoteFromServer = async (category: QuoteCategory) => {
    setLoading(true);
    setError(null);
    console.log("Starting to fetch quote with category:", category);

    try {
      // Try the Quotable API first
      console.log("Trying Quotable API...");
      try {
        const response = await axios.get("https://api.quotable.io/random", {
          params: {
            tags: category,
            maxLength: 150,
          },
          timeout: 5000,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (response.data && response.data.content) {
          console.log("Successfully fetched from Quotable API");
          setQuote({
            text: response.data.content,
            author: response.data.author || "Unknown",
          });
          return;
        }
      } catch (apiError) {
        console.warn("Quotable API failed, trying fallback...");
      }

      // If Quotable fails, try ZenQuotes API
      console.log("Trying ZenQuotes API...");
      try {
        const response = await axios.get("https://zenquotes.io/api/random", {
          timeout: 5000,
        });

        if (response.data && response.data[0]?.q) {
          console.log("Successfully fetched from ZenQuotes API");
          setQuote({
            text: response.data[0].q,
            author: response.data[0].a || "Unknown",
          });
          return;
        }
      } catch (zenError) {
        console.warn("ZenQuotes API failed, using fallback quotes...");
      }

      // If all APIs fail, use local fallback quotes
      console.log("Using local fallback quotes");
      const fallbackQuote = getRandomFallbackQuote(category);
      setQuote({
        text: fallbackQuote.text,
        author: fallbackQuote.author,
      });
    } catch (error: any) {
      let errorMessage = "Failed to fetch quote. ";

      if (error.code === "ECONNABORTED") {
        errorMessage += "Request timed out.";
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `Server responded with status ${error.response.status}: ${error.response.statusText}`;
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage +=
          "No response received from server. Check your internet connection.";
        console.error(
          "Request was made but no response received:",
          error.request
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += error.message;
      }

      setError(errorMessage);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
        },
      });

      // Set a fallback quote
      setQuote({
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewQuoteAndImage = useCallback((category: QuoteCategory) => {
    fetchQuoteFromServer(category);
  }, []);

  const handleNewBackground = () => {
    fetchRandomImage(selectedImageCategory);
  };

  const handleRefreshPress = () => {
    // Start rotation animation
    Animated.timing(refreshRotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Reset the animation value for next press
      refreshRotateAnim.setValue(0);
    });

    // Trigger the refresh actions
    handleNewBackground();
    generateNewQuoteAndImage(selectedQuoteCategory);
  };

  useEffect(() => {
    const init = async () => {
      await generateNewQuoteAndImage(selectedQuoteCategory);
      // Ensure we have a background image
      if (!backgroundUrl) {
        await fetchRandomImage(selectedImageCategory).catch(console.error);
      }
    };
    init();
  }, [selectedQuoteCategory, selectedImageCategory, generateNewQuoteAndImage]);

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

  const handleQuoteCategorySelect = (category: QuoteCategory) => {
    setSelectedQuoteCategory(category);
  };

  // Wrapper function for the onPress handler
  const handleImageCategoryPress = (categoryId: string) => {
    return () => {
      setSelectedImageCategory(categoryId);
      fetchRandomImage(categoryId).catch((error) => {
        console.error("Error fetching image:", error);
      });
    };
  };

  const handleSaveToFavorites = async () => {
    if (quote && backgroundUrl) {
      // Ensure we have a valid URL (add https:// if missing)
      let imageUrl = backgroundUrl;
      if (imageUrl && !imageUrl.startsWith("https")) {
        imageUrl = `https:${imageUrl}`;
      }

      const newQuote = {
        text: quote.text,
        author: quote.author || "Unknown",
        backgroundImage: imageUrl,
        category: selectedQuoteCategory,
        imageCategory: selectedImageCategory,
      };

      try {
        console.log("Saving quote with image URL:", imageUrl); // Debug log
        await saveQuote(newQuote);
        Alert.alert("Success", "Quote saved to favorites!");
      } catch (error) {
        console.error("Error saving quote:", error);
        Alert.alert("Error", "Failed to save quote to favorites.");
      }
    } else {
      Alert.alert(
        "Error",
        "Cannot save quote: Missing quote or background image"
      );
    }
  };

  const handleSaveToDevice = async () => {
    try {
      if (!quote) {
        Alert.alert("Error", "No quote to save!");
        return;
      }

      console.log("Attempting to capture quote card...");
      if (!viewShotRef.current || !viewShotRef.current.capture) {
        Alert.alert("Error", "Unable to capture quote image.");
        return;
      }
      const uri = await viewShotRef.current.capture();
      if (uri) {
        console.log("Captured successfully:", uri);
        await saveToDevice(uri);
        Alert.alert("Success", "Quote saved to device!");
      } else {
        Alert.alert("Error", "Failed to capture quote image.");
      }
    } catch (error) {
      console.error("Error saving to device:", error);
      Alert.alert("Error", "Failed to save quote to device.");
    }
  };

  const handleCustomize = () => {
    if (quote) {
      const newQuoteId = addQuote({
        text: quote.text,
        author: quote.author,
        backgroundImage: backgroundUrl,
      });
      router.push({ pathname: "/customize", params: { quoteId: newQuoteId } });
    }
  };

  // Create rotation interpolation for refresh button
  const refreshRotation = refreshRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ErrorBoundary>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#0f0f23", "#1a1a2e"]
            : ["#ffffff", "#f8fafc"]
        }
        style={{ flex: 1 }}
      >
        {/* Enhanced Header */}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              paddingTop: 56,
              paddingBottom: 24,
              paddingHorizontal: 24,
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText type="hero" shadow>
                  Generate
                </ThemedText>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <AnimatedIcon
                    name="magic"
                    size={16}
                    color="#667eea"
                    animationType="pulse"
                    library="FontAwesome"
                  />
                  <ThemedText
                    style={{
                      marginLeft: 8,
                      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
                      fontSize: 16,
                    }}
                  >
                    Create inspiring quotes with beautiful backgrounds
                  </ThemedText>
                </View>
              </View>

              <GlassCard
                style={{ padding: 12, borderRadius: 12 }}
                backgroundColor={
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)"
                }
              >
                <AnimatedIcon
                  name="quote-left"
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

            {loading && (
              <View style={{ alignItems: "center", marginTop: 16 }}>
                <SimpleDots color="#67e8f9" />
              </View>
            )}
          </Animated.View>
          <Animated.View
            style={{
              paddingHorizontal: 24,
              marginBottom: 16,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <GlassCard
              style={{ padding: 20, borderRadius: 16, marginBottom: 16 }}
              backgroundColor={
                colorScheme === "dark"
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)"
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AnimatedIcon
                    name="tags"
                    size={16}
                    color="#667eea"
                    library="FontAwesome"
                  />
                  <ThemedText
                    style={{ marginLeft: 8, fontWeight: "600", fontSize: 18 }}
                  >
                    Quote Categories
                  </ThemedText>
                </View>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#67e8f9",
                  }}
                />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 4, gap: 12 }}
              >
                {quoteCategories.map((category) => (
                  <Animated.View
                    key={category}
                    style={{
                      transform: [
                        {
                          scale: selectedQuoteCategory === category ? 1.05 : 1,
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleQuoteCategorySelect(category)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          selectedQuoteCategory === category
                            ? ["#667eea", "#764ba2"]
                            : colorScheme === "dark"
                              ? [
                                  "rgba(255,255,255,0.1)",
                                  "rgba(255,255,255,0.05)",
                                ]
                              : ["rgba(0,0,0,0.05)", "rgba(0,0,0,0.02)"]
                        }
                        style={{
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          borderRadius: 20,
                          marginLeft: 3,
                          borderWidth:
                            selectedQuoteCategory === category ? 1 : 0,
                          borderColor: "#667eea",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color:
                              selectedQuoteCategory === category
                                ? "white"
                                : colorScheme === "dark"
                                  ? "#e2e8f0"
                                  : "#374151",
                          }}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                  marginTop: 24,
                }}
              >
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <AnimatedIcon
                      name="image"
                      size={16}
                      color="#667eea"
                      library="FontAwesome"
                    />
                    <ThemedText
                      style={{ marginLeft: 8, fontWeight: "600", fontSize: 18 }}
                    >
                      Backgrounds
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={{
                      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Tap to change the background style
                  </ThemedText>
                </View>
                <TouchableOpacity
                  onPress={handleRefreshPress}
                  style={{
                    padding: 8,

                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)",
                    borderRadius: 20,
                  }}
                >
                  <Animated.View
                    style={{
                      transform: [{ rotate: refreshRotation }],
                    }}
                  >
                    <FontAwesome
                      name="refresh"
                      size={16}
                      color={colorScheme === "dark" ? "#ffffff" : "#374151"}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 4,
                  gap: 12,
                  marginLeft: 2,
                }}
              >
                {imageCategories.map((category) => (
                  <Animated.View
                    key={category.id}
                    style={{
                      transform: [
                        {
                          scale:
                            selectedImageCategory === category.id ? 1.05 : 1,
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleImageCategoryPress(category.id)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          selectedImageCategory === category.id
                            ? ["#667eea", "#764ba2"]
                            : colorScheme === "dark"
                              ? [
                                  "rgba(255,255,255,0.05)",
                                  "rgba(255,255,255,0.02)",
                                ]
                              : ["rgba(0,0,0,0.03)", "rgba(0,0,0,0.01)"]
                        }
                        style={{
                          padding: 12,
                          borderRadius: 16,
                          width: 80,
                          height: 80,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth:
                            selectedImageCategory === category.id ? 1 : 0,
                          borderColor: "#667eea",
                        }}
                      >
                        <FontAwesome
                          name={category.icon}
                          size={20}
                          color={
                            selectedImageCategory === category.id
                              ? "white"
                              : colorScheme === "dark"
                                ? "#9ca3af"
                                : "#6b7280"
                          }
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "500",
                            marginTop: 4,
                            color:
                              selectedImageCategory === category.id
                                ? "white"
                                : colorScheme === "dark"
                                  ? "#9ca3af"
                                  : "#6b7280",
                          }}
                        >
                          {category.name}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </GlassCard>
          </Animated.View>

          {/* Quote Card - Only this section will be captured */}
          <Animated.View
            style={{
              marginHorizontal: 24,
              marginTop: 24,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <ViewShot
              ref={viewShotRef}
              options={{
                fileName: "quote",
                format: "png",
                quality: 1.0,
                result: "tmpfile",
              }}
              style={{
                width: "100%",
                aspectRatio: 1,
              }}
            >
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  borderRadius: 20,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  overflow: "hidden",
                  shadowColor: "#667eea",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 16,
                  borderWidth: 2,
                  borderColor: colorScheme === "dark" ? "#667eea" : "#764ba2",
                }}
              >
                <Image
                  source={{ uri: backgroundUrl }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    height: "100%",
                    resizeMode: "cover",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    padding: 24,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {loading ? (
                    <View style={{ alignItems: "center" }}>
                      <SimpleLoader size={50} color="#67e8f9" />
                      <Text
                        style={{ color: "white", marginTop: 12, fontSize: 14 }}
                      >
                        Generating quote...
                      </Text>
                    </View>
                  ) : error ? (
                    <View style={{ alignItems: "center", padding: 16 }}>
                      <AnimatedIcon
                        name="exclamation-triangle"
                        size={32}
                        color="#f87171"
                        animationType="shake"
                        library="FontAwesome"
                        style={{ marginBottom: 12 }}
                      />
                      <Text
                        style={{
                          color: "#f87171",
                          textAlign: "center",
                          marginBottom: 16,
                          fontSize: 16,
                        }}
                      >
                        {error}
                      </Text>
                      <AnimatedButton
                        title="Try Again"
                        onPress={() =>
                          generateNewQuoteAndImage(selectedQuoteCategory)
                        }
                        gradientColors={commonGradients.info}
                        size="small"
                        icon={
                          <AnimatedIcon
                            name="refresh"
                            size={16}
                            color="white"
                            library="FontAwesome"
                          />
                        }
                      />
                    </View>
                  ) : quote ? (
                    <View
                      style={{
                        padding: 16,
                        width: "100%",
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "600",
                          color: "white",
                          textAlign: "center",
                          marginBottom: 24,
                          textShadowColor: "rgba(0,0,0,0.8)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                          lineHeight: 28,
                        }}
                      >
                        &quot;{quote.text}&quot;
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#67e8f9",
                          textAlign: "right",
                          width: "100%",
                          textShadowColor: "rgba(0,0,0,0.8)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        — {quote.author}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </ViewShot>
          </Animated.View>

          <Animated.View
            style={{
              marginTop: 24,
              paddingHorizontal: 24,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <AnimatedButton
                title="New Quote"
                onPress={() => fetchQuoteFromServer(selectedQuoteCategory)}
                gradientColors={commonGradients.primary}
                size="small"
                disabled={loading}
                icon={
                  <AnimatedIcon
                    name="quote-left"
                    size={16}
                    color="white"
                    library="FontAwesome"
                  />
                }
                style={{ flex: 1, marginHorizontal: 4 }}
              />

              <AnimatedButton
                title={imageLoading ? "Loading..." : "New Image"}
                onPress={() => fetchRandomImage(selectedImageCategory)}
                gradientColors={commonGradients.accent}
                size="small"
                disabled={imageLoading}
                icon={
                  imageLoading ? (
                    <SimpleLoader size={16} color="white" />
                  ) : (
                    <AnimatedIcon
                      name="image"
                      size={16}
                      color="white"
                      library="FontAwesome"
                    />
                  )
                }
                style={{ flex: 1, marginHorizontal: 4 }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 12,
              }}
            >
              <AnimatedButton
                title="Save to Favorites"
                onPress={handleSaveToFavorites}
                gradientColors={commonGradients.warning}
                size="small"
                icon={
                  <AnimatedIcon
                    name="heart"
                    size={16}
                    color="white"
                    animationType="pulse"
                    library="FontAwesome"
                  />
                }
                // style={{ flex: 1, marginHorizontal: 4 }}
              />

              <AnimatedButton
                title="Save to Device"
                onPress={handleSaveToDevice}
                gradientColors={commonGradients.success}
                size="small"
                icon={
                  <AnimatedIcon
                    name="save"
                    size={16}
                    color="white"
                    library="FontAwesome"
                  />
                }
                // style={{ flex: 1, marginHorizontal: 4 }}
              />

              <AnimatedButton
                title="Customize"
                onPress={handleCustomize}
                gradientColors={commonGradients.secondary}
                size="small"
                icon={
                  <AnimatedIcon
                    name="paint-brush"
                    size={16}
                    color="white"
                    library="FontAwesome"
                  />
                }
                style={{ flex: 1, marginHorizontal: 4 }}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </ErrorBoundary>
  );
}
