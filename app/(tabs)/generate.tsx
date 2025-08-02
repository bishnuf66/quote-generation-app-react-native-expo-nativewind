import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useQuotes } from "@/context/QuotesContext";
import { useColorScheme } from "@/hooks/useColorScheme";

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
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(
    null
  );
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
        text: quote.text,
        author: quote.author,
        category: selectedCategory,
        backgroundImage: "https://source.unsplash.com/random/800x600/?nature",
      });
      router.push("/customize");
    }
  };

  const handleRefresh = () => {
    fetchQuote(selectedCategory);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Generate Quotes</ThemedText>
        <ThemedText>Select a category and generate random quotes</ThemedText>
      </ThemedView>

      <ThemedView style={styles.categoriesContainer}>
        <ThemedText type="subtitle">Categories</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedCategory === category
                      ? colorScheme === "dark"
                        ? "#1D3D47"
                        : "#A1CEDC"
                      : colorScheme === "dark"
                      ? "#2D2D2D"
                      : "#E0E0E0",
                },
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <ThemedText
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.quoteContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#A1CEDC" : "#1D3D47"}
          />
        ) : error ? (
          <ThemedView>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRefresh}
            >
              <ThemedText style={styles.buttonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : quote ? (
          <View>
            <ThemedText style={styles.quoteText}>"{quote.text}"</ThemedText>
            <ThemedText style={styles.authorText}>- {quote.author}</ThemedText>

            <ThemedView style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRefresh}
              >
                <ThemedText style={styles.buttonText}>Refresh</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveQuote}
              >
                <ThemedText style={styles.buttonText}>Customize</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        ) : null}
      </ThemedView>
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
  },
  categoriesContainer: {
    padding: 20,
  },
  categoriesScroll: {
    marginTop: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    fontWeight: "bold",
  },
  quoteContainer: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  quoteText: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 10,
  },
  authorText: {
    fontSize: 14,
    textAlign: "right",
    marginBottom: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#2D2D2D",
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#1D3D47",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
