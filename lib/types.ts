export type Category =
  | "Beach"
  | "Temple"
  | "Wildlife"
  | "Hiking"
  | "Waterfall"
  | "Historical"
  | "Viewpoint"
  | "Museum"
  | "Garden"
  | "Other";

export const CATEGORIES: Category[] = [
  "Beach",
  "Temple",
  "Wildlife",
  "Hiking",
  "Waterfall",
  "Historical",
  "Viewpoint",
  "Museum",
  "Garden",
  "Other",
];

export interface Location {
  id: string;
  name: string;
  category: Category;
  lat: number;
  lng: number;
  description: string;
  entry_fee: string;
  hours: string;
  photo_url: string | null;
  created_at: string;
}

export interface LocationInput {
  name: string;
  category: Category;
  lat: number;
  lng: number;
  description: string;
  entry_fee: string;
  hours: string;
  photo_url?: string | null;
}
