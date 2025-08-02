import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ViewShot from "react-native-view-shot";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { SimpleDots, SimpleLoader } from "@/components/ui/SimpleLoader";
import { commonGradients } from "@/constants/Theme";
import { useQuotes } from "@/context/QuotesContext";

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

  // Use Expo's Constants.manifest.extra for environment variables
  const PEXELS_API_KEY =
    "BtZxhO8KoxJnYW98pyeIV41T1f3oreY1sbMJHmKFXnkgz0mb1w7Vi6Zh";
  console.log(
    "Using Pexels API key:",
    PEXELS_API_KEY ? "Key found" : "Key missing!"
  );

  const fetchRandomImage = async (
    categoryId: string = selectedImageCategory
  ) => {
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
  };

  const fetchQuoteFromServer = async (category: QuoteCategory) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch quote only
      const quoteResponse = await axios.get("http://api.quotable.io/random", {
        params: { tags: category, maxLength: 150 },
      });

      setQuote({
        text: quoteResponse.data.content,
        author: quoteResponse.data.author,
      });
    } catch (e) {
      setError("Failed to fetch quote. Please check your connection.");
      console.error("Error fetching quote:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQuoteAndImage = (category: QuoteCategory) => {
    fetchQuoteFromServer(category);
  };

  const handleNewBackground = () => {
    fetchRandomImage(selectedImageCategory);
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
  }, [selectedQuoteCategory, selectedImageCategory]);

  useEffect(() => {
    // Entrance animation
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
    ]).start();
  }, [fadeAnim, slideAnim]); // Run only once on mount

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
      if (imageUrl && !imageUrl.startsWith("http")) {
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
      if (!viewShotRef.current) {
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

  console.log("Current background URL:", backgroundUrl);

  return (
    <ErrorBoundary>
      <View className="flex-1 bg-black">
        {/* Background Image */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
          }}
        >
          <Image
            source={{ uri: backgroundUrl }}
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
            }}
            resizeMode="cover"
            onError={(e: NativeSyntheticEvent<{ error: any }>) => {
              console.log("Image loading error:", e.nativeEvent.error);
              console.log("Failed URL:", backgroundUrl);
              // Fallback to a default image
              setBackgroundUrl(
                "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg"
              );
            }}
            onLoad={() => console.log("Image loaded successfully")}
          />
        </View>

        {/* Dark Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1,
          }}
          pointerEvents="none"
        />
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: 1,
            zIndex: 2,
          }}
          style={{
            flex: 1,
            zIndex: 2,
          }}
        >
          <Animated.View
            className="items-center pt-8 pb-4"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text className="text-3xl font-bold text-white drop-shadow-lg mb-1">
              Generate Quotes
            </Text>
            {loading && (
              <View className="mt-2">
                <SimpleDots color="#67e8f9" />
              </View>
            )}
          </Animated.View>
          <View className="px-5 pb-2">
            <View className="mb-4">
              <Text className="text-white font-medium mb-2 ml-1">
                Quote Categories
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row space-x-2 mb-4"
              >
                {quoteCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    className={`px-4 py-2 mx-1 rounded-full ${selectedQuoteCategory === category ? "bg-cyan-600" : "bg-white/20"}`}
                    onPress={() => handleQuoteCategorySelect(category)}
                  >
                    <Text
                      className={`text-sm font-medium ${selectedQuoteCategory === category ? "text-white" : "text-gray-200"}`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="flex-row justify-between items-center mb-2 px-1">
                <Text className="text-white font-medium">Backgrounds</Text>
                <TouchableOpacity
                  onPress={() => {
                    handleNewBackground();
                    generateNewQuoteAndImage(selectedQuoteCategory);
                  }}
                  className="p-"
                >
                  <FontAwesome name="refresh" size={16} color="#06b6d4" />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row space-x-2"
              >
                {imageCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`p-2 rounded-lg mx-1 w-16 h-14 items-center ${selectedImageCategory === category.id ? "bg-cyan-600/30 border border-cyan-500" : "bg-white/10"}`}
                    onPress={handleImageCategoryPress(category.id)}
                  >
                    <FontAwesome
                      name={category.icon}
                      size={20}
                      color={
                        selectedImageCategory === category.id
                          ? "#06b6d4"
                          : "#e5e7eb"
                      }
                      className="mb-1"
                    />
                    <Text
                      className={`text-xs ${selectedImageCategory === category.id ? "text-cyan-400" : "text-gray-300"}`}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Quote Card - Only this section will be captured */}
          <View className="mx-5 mt-6">
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
                  borderRadius: 16,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
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
                      <Text style={{ color: "white", marginTop: 12, fontSize: 14 }}>
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
                        onPress={() => generateNewQuoteAndImage(selectedQuoteCategory)}
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
          </View>

          <Animated.View
            className="mt-4 px-5"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="flex-row justify-around flex-wrap">
              <AnimatedButton
                title="New Quote"
                onPress={() => fetchQuoteFromServer(selectedQuoteCategory)}
                gradientColors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                variant="outline"
                size="small"
                disabled={loading}
                icon={
                  <AnimatedIcon
                    name="quote-left"
                    size={16}
                    color="#67e8f9"
                    library="FontAwesome"
                  />
                }
                style={{ marginBottom: 12, marginHorizontal: 4, borderColor: "#0891b2" }}
              />

              <AnimatedButton
                title={imageLoading ? "Loading..." : "New Image"}
                onPress={() => fetchRandomImage(selectedImageCategory)}
                gradientColors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                variant="outline"
                size="small"
                disabled={imageLoading}
                icon={
                  imageLoading ? (
                    <SimpleLoader size={16} color="#67e8f9" />
                  ) : (
                    <AnimatedIcon
                      name="image"
                      size={16}
                      color="#67e8f9"
                      library="FontAwesome"
                    />
                  )
                }
                style={{ marginBottom: 12, marginHorizontal: 4, borderColor: "#0891b2" }}
              />

              <AnimatedButton
                title="Save to Favorites"
                onPress={handleSaveToFavorites}
                gradientColors={commonGradients.success}
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
                style={{ marginBottom: 12, marginHorizontal: 4 }}
              />

              <AnimatedButton
                title="Save to Device"
                onPress={handleSaveToDevice}
                gradientColors={commonGradients.accent}
                size="small"
                icon={
                  <AnimatedIcon
                    name="save"
                    size={16}
                    color="white"
                    library="FontAwesome"
                  />
                }
                style={{ marginBottom: 12, marginHorizontal: 4 }}
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
                    animationType="shake"
                    library="FontAwesome"
                  />
                }
                style={{ marginBottom: 12, marginHorizontal: 4 }}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}
