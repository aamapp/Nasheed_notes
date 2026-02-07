export interface Nasheed {
  id: string;
  title: string;
  lyrics: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  isFavorite: boolean;
  category?: string;
}

export interface User {
  id: string;
  email: string;
}

export enum ViewState {
  AUTH = 'AUTH',
  HOME = 'HOME',
  EDITOR = 'EDITOR',
  READER = 'READER',
}

export type SortOption = 'date_desc' | 'date_asc' | 'title_asc';