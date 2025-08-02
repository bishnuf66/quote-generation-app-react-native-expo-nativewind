import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import { useQuotes } from "@/context/QuotesContext";

export default function FavoritesScreen() {
  const router = useRouter();
  const { savedQuotes, deleteQuote } = useQuotes();

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

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="items-center pt-14 pb-4">
        <Text className="text-3xl font-bold text-white drop-shadow-lg mb-1">Favorites</Text>
        <Text className="text-base text-white/80">Your collection of favorite quotes</Text>
      </View>

      {savedQuotes.length === 0 ? (
        <View className="items-center justify-center mt-20">
          <Text className="text-white/80 text-lg mb-2">No favorite quotes yet.</Text>
          <Text className="text-white/60 mb-5">Generate a quote to get started!</Text>
          <TouchableOpacity
            className="bg-cyan-700 px-5 py-3 rounded-lg flex-row items-center"
            onPress={() => router.push("/(tabs)/generate")}
          >
            <FontAwesome name="plus" size={16} color="white" />
            <Text className="text-white font-bold ml-2">Generate a Quote</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="px-5">
          {savedQuotes.map((quote) => (
            <View key={quote.id} className="mb-5 rounded-2xl overflow-hidden bg-black/50">
              <Image
                source={{ uri: quote.backgroundImage }}
                className="w-full h-48"
                contentFit="cover"
              />
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 p-4 justify-center items-center">
                <Text className="text-white text-lg font-semibold text-center">"{quote.text}"</Text>
                {quote.author ? (
                  <Text className="text-cyan-200 text-right w-full mt-2">- {quote.author}</Text>
                ) : null}
              </View>
              <View className="absolute bottom-2 right-2 flex-row">
                <TouchableOpacity
                  className="bg-blue-600 p-2 rounded-full mr-2"
                  onPress={() => handleEditQuote(quote.id)}
                >
                  <FontAwesome name="pencil" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-600 p-2 rounded-full"
                  onPress={() => handleDeleteQuote(quote.id)}
                >
                  <FontAwesome name="trash" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
