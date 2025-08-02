export type QuoteType = {
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