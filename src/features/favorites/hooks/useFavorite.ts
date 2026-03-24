import { useState, useCallback } from 'react';

// TODO: replace optimistic local state with a real API mutation once the
// backend is ready:
//   const mutation = useMutation({ mutationFn: () => apiClient.post(`/favorites/${id}`) });

export function useFavorite(initialValue: boolean) {
  const [isFavorited, setIsFavorited] = useState(initialValue);
  const [isToggling, setIsToggling] = useState(false);

  const toggle = useCallback(async () => {
    setIsToggling(true);
    try {
      // Optimistic update — swap to API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 200));
      setIsFavorited((prev) => !prev);
    } finally {
      setIsToggling(false);
    }
  }, []);

  return { isFavorited, toggle, isToggling };
}
