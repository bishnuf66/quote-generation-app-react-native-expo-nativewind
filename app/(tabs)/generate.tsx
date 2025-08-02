import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";

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
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuoteCategory, setSelectedQuoteCategory] =
    useState<QuoteCategory>("inspirational");
  const [selectedImageCategory, setSelectedImageCategory] =
    useState<string>("nature");
  const viewShotRef = useRef<ViewShot>(null);

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

  const fetchRandomImage = async (
    categoryId: string = selectedImageCategory
  ) => {
    try {
      let query = "nature";
      const category = imageCategories.find((cat) => cat.id === categoryId);
      if (category) {
        query = category.query;
      }

      // Get a random page (Pexels returns 15 results per page, we'll use first 5 pages for variety)
      const randomPage = Math.floor(Math.random() * 5) + 1;

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
    }
  };

  const fetchQuoteFromServer = async (category: QuoteCategory) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch quote first
      const quoteResponse = await axios.get("http://api.quotable.io/random", {
        params: { tags: category, maxLength: 150 },
      });

      // Then fetch a new random image
      await fetchRandomImage(selectedImageCategory);

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

  const handleNewBackground = (_event: GestureResponderEvent) => {
    fetchRandomImage(selectedImageCategory);
  };

  useEffect(() => {
    const init = async () => {
      await generateNewQuoteAndImage(selectedQuoteCategory);
      // Ensure we have a background image
      if (!backgroundUrl) {
        await fetchRandomImage(selectedImageCategory);
      }
    };
    init();
  }, [selectedQuoteCategory, selectedImageCategory]);

  const handleQuoteCategorySelect = (category: QuoteCategory) => {
    setSelectedQuoteCategory(category);
  };



  // Wrapper function for the onPress handler
  const handleImageCategoryPress = (categoryId: string) => {
    return (_event: GestureResponderEvent) => {
      setSelectedImageCategory(categoryId);
      fetchRandomImage(categoryId).catch(error => {
        console.error('Error fetching image:', error);
      });
    };
  };

  const handleSaveToFavorites = () => {
    if (quote) {
      saveQuote({
        text: quote.text,
        author: quote.author,
        backgroundImage: backgroundUrl,
      });
      Alert.alert("Success", "Quote saved to favorites!");
    }
  };

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

  return (
    <SafeAreaView className="flex-1 bg-black">
      {backgroundUrl ? (
        <Image
          source={{ uri: backgroundUrl }}
          className="absolute top-0 left-0 w-full h-full"
          contentFit="cover"
        />
      ) : null}
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/70" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center pt-8 pb-4">
          <Text className="text-3xl font-bold text-white drop-shadow-lg mb-1">
            Generate Quotes
          </Text>
          <Text className="text-base text-white/80">
            Select a category and generate random quotes
          </Text>
        </View>
        <View className="px-5 pb-2">
          <Text className="text-lg font-semibold text-white mb-2">
            Categories
          </Text>
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
              <TouchableOpacity onPress={handleNewBackground} className="p-1">
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
                  className={`p-2 rounded-lg items-center ${selectedImageCategory === category.id ? "bg-cyan-600/30 border border-cyan-500" : "bg-white/10"}`}
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
        <ViewShot
          ref={viewShotRef}
          options={{ fileName: "quote", format: "jpg", quality: 0.9 }}
        >
          <View className="mx-5 mt-6 rounded-2xl bg-black/60 items-center justify-center min-h-[220px] shadow-lg overflow-hidden">
            <Image
              source={{ uri: backgroundUrl }}
              className="absolute top-0 left-0 w-full h-full"
              contentFit="cover"
            />
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 p-4 justify-center items-center" />
            {loading ? (
              <ActivityIndicator size="large" color="#A1CEDC" />
            ) : error ? (
              <View className="items-center p-4">
                <Text className="text-red-400 text-center mb-2">{error}</Text>
                <TouchableOpacity
                  className="bg-cyan-700 px-4 py-2 rounded-lg"
                  onPress={() => generateNewQuoteAndImage(selectedCategory)}
                >
                  <Text className="text-white font-bold">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : quote ? (
              <View className="p-4">
                <Text className="text-xl font-semibold text-white text-center mb-3 drop-shadow-lg">
                  "{quote.text}"
                </Text>
                <Text className="text-base text-cyan-200 text-right w-full mb-4">
                  - {quote.author}
                </Text>
              </View>
            ) : null}
          </View>
        </ViewShot>
        <View className="mt-4 px-5">
          <View className="flex-row justify-around flex-wrap">
            <TouchableOpacity
              className="bg-white/10 px-4 py-3 rounded-lg border border-cyan-700 mb-3 flex-row items-center"
              onPress={() => fetchQuoteFromServer(selectedCategory)}
            >
              <FontAwesome name="quote-left" size={16} color="#67e8f9" />
              <Text className="text-cyan-300 font-bold ml-2">New Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white/10 px-4 py-3 rounded-lg border border-cyan-700 mb-3 flex-row items-center"
              onPress={fetchRandomImage}
            >
              <FontAwesome name="image" size={16} color="#67e8f9" />
              <Text className="text-cyan-300 font-bold ml-2">New Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-700 px-4 py-3 rounded-lg mb-3 flex-row items-center"
              onPress={handleSaveToFavorites}
            >
              <FontAwesome name="heart" size={16} color="white" />
              <Text className="text-white font-bold ml-2">
                Save to Favorites
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-teal-600 px-4 py-3 rounded-lg mb-3 flex-row items-center"
              onPress={handleSaveToDevice}
            >
              <FontAwesome name="save" size={16} color="white" />
              <Text className="text-white font-bold ml-2">Save to Device</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-cyan-700 px-4 py-3 rounded-lg mb-3 flex-row items-center"
              onPress={handleCustomize}
            >
              <FontAwesome name="paint-brush" size={16} color="white" />
              <Text className="text-white font-bold ml-2">Customize</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
