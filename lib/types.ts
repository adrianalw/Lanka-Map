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
  photos?: string[] | null;
  created_at: string;
}

export interface Suggestion {
  id: string;
  location_name: string;
  category?: string | null;
  description?: string | null;
  location_details?: string | null;
  submitter_email?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface SuggestionInput {
  location_name: string;
  category?: string;
  description?: string;
  location_details?: string;
  submitter_email?: string;
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
