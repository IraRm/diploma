import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type FavId = string | number;

type FavoritesContextType = {
  favorites: string[];
  toggleFavorite: (id: FavId) => void;
  isFavorite: (id: FavId) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = useCallback((id: FavId) => {
  const key = String(id);
  setFavorites((prev) =>
    prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
  );
}, []);

const value = useMemo(
  () => ({
    favorites,
    toggleFavorite,
    isFavorite: (id: FavId) => favorites.includes(String(id))
  }),
  [favorites, toggleFavorite]
);


  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
