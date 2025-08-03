import { QuoteType } from "@/types/quoteType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from "expo-media-library";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type QuotesContextType = {
  quotes: QuoteType[];
  savedQuotes: QuoteType[];
  addQuote: (quote: Omit<QuoteType, "id" | "createdAt">) => string;
  saveQuote: (quote: Omit<QuoteType, "id" | "createdAt">) => Promise<void>;
  deleteQuote: (id: string) => void;
  updateQuotePosition: (id: string, position: { x: number; y: number }) => void;
  saveToDevice: (uri: string) => Promise<void>;
};

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export const useQuotes = () => {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error("useQuotes must be used within a QuotesProvider");
  }
  return context;
};

type QuotesProviderProps = {
  children: ReactNode;
};

// Key for AsyncStorage
const SAVED_QUOTES_KEY = "@QuotesApp:savedQuotes";

export const QuotesProvider = ({ children }: QuotesProviderProps) => {
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<QuoteType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved quotes from AsyncStorage on initial render
  useEffect(() => {
    const loadSavedQuotes = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(SAVED_QUOTES_KEY);
        if (jsonValue !== null) {
          const parsedQuotes = JSON.parse(jsonValue).map((quote: any) => ({
            ...quote,
            createdAt: new Date(quote.createdAt),
          }));
          setSavedQuotes(parsedQuotes);
        }
      } catch (error) {
        console.error("Error loading saved quotes:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSavedQuotes();
  }, []);

  // Save to AsyncStorage whenever savedQuotes changes
  useEffect(() => {
    if (!isLoaded) return; // Skip initial render

    const saveQuotes = async () => {
      try {
        const jsonValue = JSON.stringify(savedQuotes);
        await AsyncStorage.setItem(SAVED_QUOTES_KEY, jsonValue);
      } catch (error) {
        console.error("Error saving quotes:", error);
      }
    };

    saveQuotes();
  }, [savedQuotes, isLoaded]);

  const addQuote = (quoteData: Omit<QuoteType, "id" | "createdAt">): string => {
    const newQuote: QuoteType = {
      ...quoteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      textPosition: quoteData.textPosition || { x: 50, y: 50 },
    };
    setQuotes((prev) => [...prev, newQuote]);
    return newQuote.id;
  };

  const normalizeImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;

    // If it's already a valid URL, return as is
    if (

      url.startsWith("https://") ||
      url.startsWith("file://")
    ) {
      return url;
    }

    // If it starts with //, add https:
    if (url.startsWith("//")) {
      return `https:${url}`;
    }

    // Otherwise, assume it's a full URL without protocol
    return `https://${url}`;
  };

  const saveQuote = async (quote: Omit<QuoteType, "id" | "createdAt">) => {
    setSavedQuotes((prev) => {
      const newQuote: QuoteType = {
        ...quote,
        id: Date.now().toString(),
        createdAt: new Date(),
        // Ensure backgroundImage is properly formatted
        backgroundImage: normalizeImageUrl(quote.backgroundImage),
      };

      console.log("Saving quote with image URL:", newQuote.backgroundImage); // Debug log

      // Avoid adding duplicates if the user spams the button
      if (
        prev.some(
          (q) => q.text === newQuote.text && q.author === newQuote.author
        )
      ) {
        return prev;
      }
      return [...prev, newQuote];
    });
  };

  const deleteQuote = (id: string) => {
    setSavedQuotes((prev) => prev.filter((quote) => quote.id !== id));
  };

  const updateQuotePosition = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setQuotes((prev) =>
      prev.map((quote) =>
        quote.id === id ? { ...quote, textPosition: position } : quote
      )
    );
  };

  const saveToDevice = async (uri: string) => {
    try {
      // Request permissions
      const permissions = await MediaLibrary.requestPermissionsAsync(true);
      if (permissions.status !== "granted") {
        throw new Error("Media library write permission not granted");
      }
      if (permissions.accessPrivileges !== "all") {
        throw new Error("App does not have full access to the media library.");
      }

      // Save the image
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("QuotesApp", asset, false);
    } catch (error) {
      console.error("Error saving to device:", error);
      throw error;
    }
  };

  const value = {
    quotes,
    savedQuotes,
    addQuote,
    saveQuote,
    deleteQuote,
    updateQuotePosition,
    saveToDevice,
  };

  return (
    <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>
  );
};
