import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ViewShot from "react-native-view-shot";

import { useQuotes } from "@/context/QuotesContext";

type Category =
  | "inspirational"
  | "motivational"
  | "life"
  | "success"
  | "funny"
  | "love";

export default function GenerateScreen() {
  const router = useRouter();
  const { addQuote, saveQuote, saveToDevice } = useQuotes();
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(
    null
  );
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("inspirational");
  const viewShotRef = useRef<ViewShot>(null);

  const categories: Category[] = [
    "inspirational",
    "motivational",
    "life",
    "success",
    "funny",
    "love",
  ];

  const fetchRandomImage = () => {
    const randomKeywords = [
      "nature",
      "mountain",
      "beach",
      "forest",
      "city",
      "sunset",
      "abstract",
      "sky",
      "flowers",
      "space",
    ];
    const keyword =
      randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
    setBackgroundUrl(`https://source.unsplash.com/random/800x600/?${keyword}`);
  };

  const fetchQuoteFromServer = async (category: Category) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch quote and image in parallel
      const quotePromise = axios.get("http://api.quotable.io/random", {
        params: { tags: category, maxLength: 150 },
      });

      // Fetch a new random image at the same time
      fetchRandomImage();

      const quoteResponse = await quotePromise;

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

  const generateNewQuoteAndImage = (category: Category) => {
    // fetchQuoteFromServer now handles fetching a new image as well
    fetchQuoteFromServer(category);
  };

  useEffect(() => {
    generateNewQuoteAndImage(selectedCategory);
  }, [selectedCategory]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row space-x-2"
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-4 py-2 rounded-full ${selectedCategory === category ? "bg-cyan-600" : "bg-white/20"}`}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  className={`text-sm ${selectedCategory === category ? "font-bold text-white" : "text-white/80"}`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ViewShot ref={viewShotRef} options={{ fileName: "quote", format: "jpg", quality: 0.9 }}>
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
              <Text className="text-white font-bold ml-2">Save to Favorites</Text>
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
