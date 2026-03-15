import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export function useFavorites() {
  const { isAuthenticated, getToken } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch favorites from the API when the user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      const token = getToken();
      if (!token || !API_URL) return;

      try {
        const res = await fetch(`${API_URL}/profile/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFavorites(data.favoriteStops ?? []);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  const toggleFavorite = useCallback(async (stopId: string) => {
    const token = getToken();
    if (!token || !API_URL) return;

    const alreadyFavorited = favorites.includes(stopId);
    if (!alreadyFavorited && favorites.length >= 5) return;
    // ^ Don't allow adding if already at 5

    // Update UI immediately before API responds (optimistic update)
    const newFavorites = alreadyFavorited
      ? favorites.filter((id) => id !== stopId)
      : [...favorites, stopId];

    setFavorites(newFavorites);
    console.log(newFavorites)

    try {
      await fetch(`${API_URL}/profile/favorites`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favoriteStops: newFavorites }),
      });
    } catch (err) {
      // On failure, revert UI update
      setFavorites(favorites);
      console.error('Failed to update favorites:', err);
    }
  }, [favorites, getToken]);

  return {
    favorites,
    isFavorited: (stopId: string) => favorites.includes(stopId),
    toggleFavorite,
    isFull: favorites.length >= 5,
  };
}
