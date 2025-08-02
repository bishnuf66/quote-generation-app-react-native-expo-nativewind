import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useQuotes } from "../../context/QuotesContext";

export default function SavedScreen() {
  const router = useRouter();
  const { quotes, deleteQuote } = useQuotes();

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
    // Navigate to customize screen with the selected quote
    router.push("/customize");
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText>Saved Quotes</ThemedText>
        <ThemedText>Your collection of saved quotes</ThemedText>
      </ThemedView>

      {quotes.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText>No saved quotes yet.</ThemedText>
          <ThemedText>
            Generate or create a quote and save it to see it here.
          </ThemedText>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => router.push("/generate")}
          >
            <ThemedText style={styles.generateButtonText}>
              Generate a Quote
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ThemedView style={styles.quotesContainer}>
          {quotes.map((quote) => (
            <ThemedView key={quote.id} style={styles.quoteCard}>
              <View style={styles.quoteImageContainer}>
                <Image
                  source={{
                    uri: quote.backgroundImage || quote.backgroundImage,
                  }}
                  style={styles.quoteImage}
                />
                <View style={styles.quoteTextOverlay}>
                  <ThemedText style={styles.quoteText}>
                    "{quote.text}"
                  </ThemedText>
                  {quote.author && (
                    <ThemedText style={styles.authorText}>
                      - {quote.author}
                    </ThemedText>
                  )}
                </View>
              </View>

              <ThemedView style={styles.quoteActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditQuote(quote.id)}
                >
                  <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteQuote(quote.id)}
                >
                  <ThemedText style={styles.actionButtonText}>
                    Delete
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  generateButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1D3D47",
    borderRadius: 5,
  },
  generateButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  quotesContainer: {
    padding: 20,
  },
  quoteCard: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quoteImageContainer: {
    height: 200,
    position: "relative",
  },
  quoteImage: {
    width: "100%",
    height: "100%",
  },
  quoteTextOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  quoteText: {
    color: "white",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 10,
  },
  authorText: {
    color: "white",
    fontSize: 14,
    textAlign: "right",
    alignSelf: "flex-end",
  },
  quoteActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: "#1D3D47",
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
