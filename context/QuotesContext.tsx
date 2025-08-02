import React, { createContext, useState, useContext, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

type QuoteType = {
  id: string;
  text: string;
  author?: string;
  category?: string;
  backgroundImage?: string;
  customImage?: string;
  textPosition?: { x: number; y: number };
  isFavorite?: boolean;
  createdAt: Date;
};

type QuotesContextType = {
  quotes: QuoteType[];
  savedQuotes: QuoteType[];
  addQuote: (quote: Omit<QuoteType, 'id' | 'createdAt'>) => string;
  saveQuote: (quote: Omit<QuoteType, 'id' | 'createdAt'>) => Promise<void>;
  deleteQuote: (id: string) => void;
  updateQuotePosition: (id: string, position: { x: number; y: number }) => void;
  saveToDevice: (uri: string) => Promise<void>;
};

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export const useQuotes = () => {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes must be used within a QuotesProvider');
  }
  return context;
};

type QuotesProviderProps = {
  children: ReactNode;
};

export const QuotesProvider = ({ children }: QuotesProviderProps) => {
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<QuoteType[]>([]);

  const addQuote = (quoteData: Omit<QuoteType, 'id' | 'createdAt'>): string => {
    const newQuote: QuoteType = {
      ...quoteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      textPosition: quoteData.textPosition || { x: 50, y: 50 },
    };
    setQuotes((prev) => [...prev, newQuote]);
    return newQuote.id;
  };

  const saveQuote = async (quote: Omit<QuoteType, 'id' | 'createdAt'>) => {
    setSavedQuotes((prev) => {
      const newQuote: QuoteType = {
        ...quote,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      // Avoid adding duplicates if the user spams the button
      if (prev.some(q => q.text === newQuote.text && q.author === newQuote.author)) {
        return prev;
      }
      return [...prev, newQuote];
    });
  };

  const deleteQuote = (id: string) => {
    setSavedQuotes((prev) => prev.filter((quote) => quote.id !== id));
  };

  const updateQuotePosition = (id: string, position: { x: number; y: number }) => {
    setQuotes((prev) =>
      prev.map((quote) => (quote.id === id ? { ...quote, textPosition: position } : quote))
    );
  };

  const saveToDevice = async (uri: string) => {
    try {
      // Request permissions
      const permissions = await MediaLibrary.requestPermissionsAsync(true);
      if (permissions.status !== 'granted') {
        throw new Error('Media library write permission not granted');
      }
      if (permissions.accessPrivileges !== 'all') {
        throw new Error('App does not have full access to the media library.');
      }

      // Save the image
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('QuotesApp', asset, false);
    } catch (error) {
      console.error('Error saving to device:', error);
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

  return <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>;
};