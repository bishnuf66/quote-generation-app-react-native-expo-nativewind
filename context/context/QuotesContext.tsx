// QuotesContext implementation
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Quote = {
  id: string;
  text: string;
  author: string;
  backgroundImage?: string;
  textPosition?: { x: number; y: number };
  createdAt?: Date;
};

type QuotesContextType = {
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  deleteQuote: (id: string) => void;
  updateQuotePosition: (id: string, position: { x: number; y: number }) => void;
  saveQuote: (quote: Quote) => void;
  saveToDevice: (uri: string) => Promise<void>;
};

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export const QuotesProvider = ({ children }: { children: ReactNode }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const addQuote = (quote: Quote) => {
    setQuotes((prev) => [...prev, quote]);
  };

  const deleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuotePosition = (id: string, position: { x: number; y: number }) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, textPosition: position } : q))
    );
  };

  const saveQuote = (quote: Quote) => {
    setQuotes((prev) => {
      const exists = prev.some((q) => q.id === quote.id);
      if (exists) {
        return prev.map((q) => (q.id === quote.id ? quote : q));
      }
      return [...prev, quote];
    });
  };

  const saveToDevice = async (uri: string) => {
    // Implement saving to device using expo-file-system
    // Placeholder for now
    return;
  };

  return (
    <QuotesContext.Provider
      value={{ quotes, addQuote, deleteQuote, updateQuotePosition, saveQuote, saveToDevice }}
    >
      {children}
    </QuotesContext.Provider>
  );
};

export const useQuotes = () => {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes must be used within a QuotesProvider');
  }
  return context;
};
