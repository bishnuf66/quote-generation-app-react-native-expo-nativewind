
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ActivityIndicator, ScrollView, TouchableOpacity, View, Text } from "react-native";
import { Image } from "expo-image";

// import { ThemedText } from "../components/ThemedText";
// import { ThemedView } from "../components/ThemedView";
import { useQuotes } from "../context/QuotesContext";
import { useColorScheme } from "../hooks/useColorScheme";

type Category =
  | "inspirational"
  | "motivational"
  | "life"
  | "success"
  | "funny"
  | "love";

export default function GenerateScreen() {
  const router = useRouter();
  const { addQuote } = useQuotes();
  const colorScheme = useColorScheme();
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string>("https://source.unsplash.com/random/800x600/?nature");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("inspirational");

  const categories: Category[] = [
    "inspirational",
    "motivational",
    "life",
    "success",
    "funny",
    "love",
  ];

  const fetchQuote = async (category: Category) => {
    // Get a new random background each time
    const randomKeywords = ["nature", "mountain", "beach", "forest", "city", "sunset", "abstract", "sky", "flowers", "space"];
    const keyword = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
    setBackgroundUrl(`https://source.unsplash.com/random/800x600/?${keyword}`);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://api.quotable.io/random?tags=${category}`
      );
      setQuote({
        text: response.data.content,
        author: response.data.author,
      });
    } catch (err: any) {
      setError("Failed to fetch quote. Please try again.");
      // Enhanced Axios error logging
      if (err.response) {
        // Server responded but with error status
        console.log("Response error:", err.response);
      } else if (err.request) {
        // Request made, but no response received
        console.log("Request error:", err.request);
      } else {
        // Something else happened
        console.log("Other error:", err.message);
      }
      console.error("Error fetching quote:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote(selectedCategory);
  }, [selectedCategory]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleSaveQuote = () => {
    if (quote) {
      addQuote({
        id: Date.now().toString(),
        text: quote.text,
        author: quote.author,
        backgroundImage: "https://source.unsplash.com/random/800x600/?nature",
        createdAt: new Date(),
      });
      router.push("/customize");
    }
  };

  const handleRefresh = () => {
    fetchQuote(selectedCategory);
  };

  return (
    <View className="flex-1 bg-black">
      <Image
        source={{ uri: backgroundUrl }}
        className="absolute top-0 left-0 w-full h-full"
        style={{ opacity: 0.35 }}
        contentFit="cover"
        blurRadius={2}
      />
      <ScrollView className="flex-1">
        <View className="items-center pt-14 pb-4">
          <Text className="text-3xl font-bold text-white drop-shadow-lg mb-1">Generate Quotes</Text>
          <Text className="text-base text-white/80">Select a category and generate random quotes</Text>
        </View>
        <View className="px-5 pb-2">
          <Text className="text-lg font-semibold text-white mb-2">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-4 py-2 rounded-full ${selectedCategory === category ? 'bg-cyan-600' : 'bg-white/20'}`}
                onPress={() => handleCategorySelect(category)}
              >
                <Text className={`text-sm ${selectedCategory === category ? 'font-bold text-white' : 'text-white/80'}`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View className="mx-5 mt-6 p-6 rounded-2xl bg-black/60 items-center min-h-[220px] shadow-lg">
          {loading ? (
            <ActivityIndicator size="large" color="#A1CEDC" />
          ) : error ? (
            <View className="items-center">
              <Text className="text-red-400 text-center mb-2">{error}</Text>
              <TouchableOpacity
                className="bg-cyan-700 px-4 py-2 rounded-lg"
                onPress={handleRefresh}
              >
                <Text className="text-white font-bold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : quote ? (
            <>
              <Text className="text-xl font-semibold text-white text-center mb-3 drop-shadow-lg">"{quote.text}"</Text>
              <Text className="text-base text-cyan-200 text-right w-full mb-4">- {quote.author}</Text>
              <View className="flex-row justify-center space-x-3 mt-2">
                <TouchableOpacity
                  className="bg-white/10 px-5 py-2 rounded-lg border border-cyan-700"
                  onPress={handleRefresh}
                >
                  <Text className="text-cyan-300 font-bold">Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-cyan-700 px-5 py-2 rounded-lg"
                  onPress={handleSaveQuote}
                >
                  <Text className="text-white font-bold">Customize</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
