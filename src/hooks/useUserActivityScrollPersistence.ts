// src/hooks/useUserActivityScrollPersistence.ts
import { useState, useRef, useCallback, useEffect } from "react";

interface ScrollState {
  scrollTop: number;
  visibleCount: number;
}

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_INCREMENT = 10;

const getDefaultScrollState = (): ScrollState => ({
  scrollTop: 0,
  visibleCount: INITIAL_VISIBLE_COUNT,
});

const useUserActivityScrollPersistence = (
  userId: string | undefined,
  activeTab: string,
  isDataReady: boolean = false,
) => {
  const [tabScrollStates, setTabScrollStates] = useState<
    Record<string, ScrollState>
  >({});

  const scrollableActivityListRef = useRef<HTMLDivElement>(null);
  const isRestoringScroll = useRef(false);

  const getStorageKeys = useCallback(
    (userId: string) => ({
      scrollStates: `userActivity_scrollStates_${userId}`,
    }),
    [],
  );

  const getScrollState = useCallback(
    (tab: string): ScrollState => {
      return tabScrollStates[tab] || getDefaultScrollState();
    },
    [tabScrollStates],
  );

  const saveCurrentScrollPosition = useCallback(() => {
    if (
      !userId ||
      !scrollableActivityListRef.current ||
      isRestoringScroll.current
    )
      return;

    const scrollTop = scrollableActivityListRef.current.scrollTop;

    setTabScrollStates((prev) => {
      const current = prev[activeTab] || getDefaultScrollState();
      const newStates = {
        ...prev,
        [activeTab]: { ...current, scrollTop },
      };

      const keys = getStorageKeys(userId);
      try {
        sessionStorage.setItem(keys.scrollStates, JSON.stringify(newStates));
      } catch (error) {
        console.warn("Failed to save scroll states to sessionStorage:", error);
      }

      return newStates;
    });
  }, [userId, activeTab, getStorageKeys]);

  const restoreScrollPosition = useCallback(() => {
    if (!scrollableActivityListRef.current || isRestoringScroll.current) return;

    const currentScrollState = getScrollState(activeTab);

    isRestoringScroll.current = true;
    scrollableActivityListRef.current.scrollTop = currentScrollState.scrollTop;

    setTimeout(() => {
      isRestoringScroll.current = false;
    }, 100);
  }, [activeTab, getScrollState]);

  // Load saved data from sessionStorage on mount or when userId changes
  useEffect(() => {
    if (!userId || !isDataReady) return;

    const keys = getStorageKeys(userId);

    try {
      const savedScrollStates = sessionStorage.getItem(keys.scrollStates);
      if (savedScrollStates) {
        const parsedStates = JSON.parse(savedScrollStates) as Record<
          string,
          ScrollState
        >;
        // Validate each entry
        const validatedStates: Record<string, ScrollState> = {};
        for (const [key, state] of Object.entries(parsedStates)) {
          validatedStates[key] = {
            scrollTop: state?.scrollTop || 0,
            visibleCount: state?.visibleCount || INITIAL_VISIBLE_COUNT,
          };
        }
        setTabScrollStates(validatedStates);
      }
    } catch (error) {
      console.warn("Failed to load saved scroll states:", error);
    }
  }, [userId, isDataReady, getStorageKeys]);

  // Restore scroll position when tab changes or data is ready
  useEffect(() => {
    if (isDataReady && scrollableActivityListRef.current) {
      const timeoutId = setTimeout(() => {
        restoreScrollPosition();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, isDataReady, restoreScrollPosition]);

  // Add scroll event listener to save position
  useEffect(() => {
    const scrollContainer = scrollableActivityListRef.current;
    if (!scrollContainer || !userId) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isRestoringScroll.current) {
          saveCurrentScrollPosition();
        }
      }, 150);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [userId, saveCurrentScrollPosition]);

  const handleLoadMoreItems = useCallback(() => {
    setTabScrollStates((prev) => {
      const current = prev[activeTab] || getDefaultScrollState();
      const newStates = {
        ...prev,
        [activeTab]: {
          ...current,
          visibleCount: current.visibleCount + LOAD_MORE_INCREMENT,
        },
      };

      if (userId) {
        const keys = getStorageKeys(userId);
        try {
          sessionStorage.setItem(keys.scrollStates, JSON.stringify(newStates));
        } catch (error) {
          console.warn("Failed to save updated scroll states:", error);
        }
      }

      return newStates;
    });
  }, [activeTab, userId, getStorageKeys]);

  const resetScrollAndVisibleCount = useCallback(() => {
    setTabScrollStates({});
    if (scrollableActivityListRef.current) {
      scrollableActivityListRef.current.scrollTop = 0;
    }
  }, []);

  // Create a proxy object that returns visibleCount for any tab key
  const visibleCount = getScrollState(activeTab).visibleCount;

  return {
    visibleCount,
    scrollableActivityListRef,
    handleLoadMoreItems,
    resetScrollAndVisibleCount,
  };
};

export default useUserActivityScrollPersistence;
