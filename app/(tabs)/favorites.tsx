import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
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
  backgroundImage: string;
  createdAt: string | number | Date;
  [key: string]: any; // Add index signature for additional properties
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { savedQuotes, deleteQuote } = useQuotes();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const viewRefs = useRef<{ [key: string]: View | null }>({});

  const backgroundColor = colorScheme === "dark" ? "bg-black" : "bg-white";
  const textColor = colorScheme === "dark" ? "text-white" : "text-gray-900";
  const cardBg = colorScheme === "dark" ? "bg-gray-800/90" : "bg-white";
  const secondaryText =
    colorScheme === "dark" ? "text-gray-300" : "text-gray-600";
  const dividerColor =
    colorScheme === "dark" ? "border-gray-700" : "border-gray-200";

  const styles = StyleSheet.create({
    actionButton: {
      width: 32,
      height: 32,
      marginLeft: 8,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
    actionContainer: {
      position: "absolute",
      bottom: 8,
      right: 8,
      flexDirection: "row",
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 20,
      padding: 4,
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

  return (
    <View className={`flex-1 ${backgroundColor}`}>
      {/* Header */}
      <View className="pt-14 pb-4 px-4">
        <Text className={`text-3xl font-bold ${textColor} mb-1`}>
          Favorites
        </Text>
        <Text className={`text-base ${secondaryText}`}>
          Your collection of favorite quotes
        </Text>
      </View>

      {savedQuotes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="bookmark-outline"
            size={60}
            color={colorScheme === "dark" ? "#4B5563" : "#9CA3AF"}
            style={{ opacity: 0.5 }}
          />
          <Text
            className={`${textColor} text-xl font-semibold mt-4 mb-2 text-center`}
          >
            No favorite quotes yet
          </Text>
          <Text className={`${secondaryText} text-center mb-6`}>
            Save your favorite quotes and they'll appear here
          </Text>
          <TouchableOpacity
            className={`${colorScheme === "dark" ? "bg-cyan-600" : "bg-cyan-500"} px-6 py-3 rounded-full flex-row items-center`}
            onPress={() => router.push("/(tabs)/generate")}
          >
            <Ionicons name="sparkles" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">
              Generate a Quote
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
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
                className={`rounded-2xl overflow-hidden mb-4 mx-1 ${cardBg} shadow-sm`}
                style={{
                  width: CARD_WIDTH,
                  marginHorizontal: CARD_GAP / 2,
                  borderWidth: 1,
                  borderColor:
                    colorScheme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                }}
              >
                <View
                  ref={(ref) => {
                    if (ref) {
                      viewRefs.current[quote.id] = ref;
                    }
                  }}
                  collapsable={false}
                  className="relative"
                >
                  <Image
                    source={{ uri: quote.backgroundImage }}
                    className="w-full h-40"
                    contentFit="cover"
                  />
                  <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 p-4 justify-center items-center">
                    <Text
                      className={`${textColor} text-base font-medium text-center`}
                      style={{
                        textShadowColor: "rgba(0,0,0,0.5)",
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      "{quote.text}"
                    </Text>
                    {quote.author && (
                      <Text
                        className={`${
                          colorScheme === "dark"
                            ? "text-cyan-300"
                            : "text-cyan-700"
                        } text-sm text-right w-full mt-2 font-medium`}
                        style={{
                          textShadowColor: "rgba(0,0,0,0.5)",
                          textShadowOffset: { width: 1, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        - {quote.author}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="p-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className={`text-xs ${secondaryText}`}>
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </Text>
                    <View className="flex-row">
                      {renderActionButton(
                        () => handleEditQuote(quote.id),
                        "create-outline",
                        colorScheme === "dark" ? "#d1d5db" : "#4b5563",
                        colorScheme === "dark"
                          ? "bg-gray-700/50"
                          : "bg-gray-100"
                      )}
                      {renderActionButton(
                        () => handleShareQuote(quote as QuoteType),
                        "share-social-outline",
                        colorScheme === "dark" ? "#d1d5db" : "#4b5563",
                        colorScheme === "dark"
                          ? "bg-gray-700/50"
                          : "bg-gray-100"
                      )}
                      {renderActionButton(
                        () => saveToGallery(quote as QuoteType),
                        "download-outline",
                        colorScheme === "dark" ? "#d1d5db" : "#4b5563",
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
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
