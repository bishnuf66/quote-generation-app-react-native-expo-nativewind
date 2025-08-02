import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import { useQuotes } from "@/context/QuotesContext";

const { width } = Dimensions.get("window");
const CARD_GAP = 16;
const CARD_WIDTH = (width - CARD_GAP * 3) / 2;

type QuoteType = {
  id: string;
  text: string;
  author?: string;
  backgroundImage: string; // Ensure this is always a string
  createdAt: string | number | Date;
  category?: string;
  imageCategory?: string;
  [key: string]: unknown; // More specific than 'any'
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { savedQuotes, deleteQuote } = useQuotes();
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());
  
  // Ensure we have a valid image URL
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    // If it's already a full URL or a local file, return as is
    if (url.startsWith('http') || url.startsWith('file://') || url.startsWith('data:')) {
      return url;
    }
    // Otherwise, assume it's a path that needs https
    return `https:${url}`;
  };
  
  // Check if we should show the image or fallback
  const shouldShowImage = (url: string | undefined): boolean => {
    if (!url) return false;
    const fullUrl = getImageUrl(url);
    return !failedImageUrls.has(fullUrl);
  };
  
  // Handle image loading errors
  const handleImageError = (url: string) => {
    if (!url) return;
    const fullUrl = getImageUrl(url);
    setFailedImageUrls(prev => {
      const newSet = new Set(prev);
      newSet.add(fullUrl);
      return newSet;
    });
  };
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const viewRefs = useRef<{ [key: string]: View | null }>({});

  // Colors based on theme
  const backgroundColor = colorScheme === "dark" ? "bg-black" : "bg-gray-50";
  const textColor = colorScheme === "dark" ? "text-white" : "text-gray-900";
  const cardBg = colorScheme === "dark" ? "bg-gray-800" : "bg-white";
  const secondaryText =
    colorScheme === "dark" ? "text-gray-300" : "text-gray-600";
  const dividerColor =
    colorScheme === "dark" ? "border-gray-700" : "border-gray-200";
  const actionButtonBg =
    colorScheme === "dark" ? "bg-gray-700/80" : "bg-white/80";
  const shadowColor =
    colorScheme === "dark" ? "shadow-gray-900" : "shadow-gray-400";

  const styles = StyleSheet.create({
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        colorScheme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)",
      marginHorizontal: 4,
    } as ViewStyle,
    actionContainer: {
      position: "absolute",
      bottom: 12,
      right: 12,
      left: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 8,
      borderRadius: 20,
      backgroundColor:
        colorScheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)",
      backdropFilter: "blur(10px)",
    } as ViewStyle,
    cardContainer: {
      width: CARD_WIDTH,
      marginBottom: CARD_GAP,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: colorScheme === "dark" ? "#000" : "#888",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    } as ViewStyle,
    imageContainer: {
      width: "100%",
      aspectRatio: 1,
      position: "relative",
    } as ViewStyle,
    modernCard: {
      backgroundColor: cardBg,
      borderRadius: 16,
      padding: 16,
      shadowColor: shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    } as ViewStyle,
  });

  const handleDeleteQuote = (id: string) => {
    Alert.alert("Delete Quote", "Are you sure you want to delete this quote?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => deleteQuote(id),
        style: "destructive",
      },
    ]);
  };

  const handleEditQuote = (id: string) => {
    router.push({ pathname: "/customize", params: { quoteId: id } });
  };

  const handleShareQuote = async (quote: QuoteType) => {
    try {
      const viewRef = viewRefs.current[quote.id];
      if (!viewRef) return;

      const result = await captureRef(viewRef, {
        format: "png",
        quality: 0.8,
      });

      await Share.share({
        url: result,
        title: "Share Quote",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const saveToGallery = async (quote: QuoteType) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant permission to save images to your gallery."
        );
        return;
      }

      const viewRef = viewRefs.current[quote.id];
      if (!viewRef) return;

      const result = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });

      const asset = await MediaLibrary.createAssetAsync(result);
      await MediaLibrary.createAlbumAsync("QuoteCards", asset, false);

      Alert.alert("Success", "Quote saved to your gallery!");
    } catch (error) {
      console.error("Error saving to gallery:", error);
      Alert.alert("Error", "Failed to save to gallery. Please try again.");
    }
  };

  const renderActionButton = (
    onPress: () => void,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    bgColor: string
  ) => (
    <TouchableOpacity
      onPress={onPress}
      className={`p-2 rounded-full ${bgColor} items-center justify-center`}
      style={styles.actionButton}
    >
      <Ionicons name={icon} size={20} color={color} />
    </TouchableOpacity>
  );

  if (savedQuotes.length === 0) {
    return (
      <View
        className={`flex-1 ${backgroundColor} justify-center items-center p-6`}
      >
        <View className="bg-gray-200 dark:bg-gray-700 p-6 rounded-full mb-6">
          <Ionicons
            name="heart-outline"
            size={64}
            color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
          />
        </View>
        <Text className={`text-2xl font-bold ${textColor} text-center`}>
          No Favorites Yet
        </Text>
        <Text className={`text-center mt-2 ${secondaryText} mb-8 max-w-xs`}>
          Save your favorite quotes and they'll appear here
        </Text>
        <TouchableOpacity
          className="bg-cyan-600 px-8 py-4 rounded-full flex-row items-center shadow-lg shadow-cyan-500/20"
          onPress={() => router.push("/generate")}
        >
          <Ionicons name="sparkles" size={20} color="white" />
          <Text className="text-white font-semibold ml-2 text-lg">
            Generate a Quote
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${backgroundColor}`}>
      {/* Header */}
      <View className="pt-14 pb-4 px-4">
        <Text className={`text-3xl font-bold ${textColor} mb-1`}>
          Favorites
        </Text>
        <Text className={`text-base ${secondaryText}`}>
          {savedQuotes.length} {savedQuotes.length === 1 ? "quote" : "quotes"}{" "}
          saved
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: CARD_GAP / 2,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-row flex-wrap"
          style={{ marginHorizontal: -CARD_GAP / 2 }}
        >
          {savedQuotes.map((quote) => (
            <View
              key={quote.id}
              className="mb-4"
              style={{
                width: CARD_WIDTH,
                marginHorizontal: CARD_GAP / 2,
              }}
            >
              <View
                ref={(ref) => {
                  if (ref) {
                    viewRefs.current[quote.id] = ref;
                  }
                }}
                className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
                style={{
                  shadowColor: colorScheme === "dark" ? "#1f2937" : "#9ca3af",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                {/* Image with overlay */}
                <View className="relative aspect-square">
                  {shouldShowImage(quote.backgroundImage) ? (
                    <Image
                      source={{ 
                        uri: getImageUrl(quote.backgroundImage)
                      }}
                      className="w-full h-full"
                      contentFit="cover"
                      transition={200}
                      onError={() => {
                        if (quote.backgroundImage) {
                          console.log('Image failed to load, adding to failed set:', quote.backgroundImage);
                          handleImageError(quote.backgroundImage);
                        }
                      }}
                    />
                  ) : (
                    <View className="w-full h-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
                      <Ionicons name="image-outline" size={48} color="#9ca3af" />
                      <Text className="text-gray-500 mt-2 text-center px-2">
                        Image not available
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
                      "{quote.text}"
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
                  </View>
                </View>

                {/* Card Footer */}
                <View className="p-3">
                  <View className="flex-row justify-between items-center">
                    <Text className={`text-xs ${secondaryText}`}>
                      {new Date(quote.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <View className="flex-row space-x-1">
                      {renderActionButton(
                        () => handleShareQuote(quote as QuoteType),
                        "share-outline",
                        colorScheme === "dark" ? "#e5e7eb" : "#4b5563",
                        colorScheme === "dark"
                          ? "bg-gray-700/50"
                          : "bg-gray-100"
                      )}
                      {renderActionButton(
                        () => saveToGallery(quote as QuoteType),
                        "download-outline",
                        colorScheme === "dark" ? "#e5e7eb" : "#4b5563",
                        colorScheme === "dark"
                          ? "bg-gray-700/50"
                          : "bg-gray-100"
                      )}
                      {renderActionButton(
                        () => handleDeleteQuote(quote.id),
                        "trash-outline",
                        "#ef4444",
                        colorScheme === "dark" ? "bg-red-900/30" : "bg-red-100"
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
