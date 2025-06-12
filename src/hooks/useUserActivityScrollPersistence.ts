// src/hooks/useUserActivityScrollPersistence.ts
import { useState, useRef, useCallback, useEffect } from "react";

type ActivityTab = "all" | "cases" | "answers" | "comments";

interface ScrollState {
  scrollTop: number;
  visibleCount: number;
}

interface TabScrollStates {
  all: ScrollState;
  cases: ScrollState;
  answers: ScrollState;
  comments: ScrollState;
}

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_INCREMENT = 10;

// Helper for initial state to avoid repetition
const getInitialTabStates = () => ({
  all: { scrollTop: 0, visibleCount: INITIAL_VISIBLE_COUNT },
  cases: { scrollTop: 0, visibleCount: INITIAL_VISIBLE_COUNT },
  answers: { scrollTop: 0, visibleCount: INITIAL_VISIBLE_COUNT },
  comments: { scrollTop: 0, visibleCount: INITIAL_VISIBLE_COUNT },
});

const useUserActivityScrollPersistence = (
  userId?: string,
  isDataReady: boolean = false
) => {
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");
  const [tabScrollStates, setTabScrollStates] = useState<TabScrollStates>(
    getInitialTabStates()
  );

  const scrollableActivityListRef = useRef<HTMLDivElement>(null);
  const isRestoringScroll = useRef(false);

  // Generate storage keys for each tab
  const getStorageKeys = useCallback(
    (userId: string) => ({
      activeTab: `userActivity_activeTab_${userId}`,
      scrollStates: `userActivity_scrollStates_${userId}`,
    }),
    []
  );

  // Save current scroll position for the active tab
  const saveCurrentScrollPosition = useCallback(() => {
    if (
      !userId ||
      !scrollableActivityListRef.current ||
      isRestoringScroll.current
    )
      return;

    const scrollTop = scrollableActivityListRef.current.scrollTop;

    setTabScrollStates((prev) => {
      const newStates = {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          scrollTop,
        },
      };

      // Save to sessionStorage
      const keys = getStorageKeys(userId);
      try {
        sessionStorage.setItem(keys.scrollStates, JSON.stringify(newStates));
      } catch (error) {
        console.warn("Failed to save scroll states to sessionStorage:", error);
      }

      return newStates;
    });
  }, [userId, activeTab, getStorageKeys]);

  // Restore scroll position for the current active tab
  const restoreScrollPosition = useCallback(() => {
    if (!scrollableActivityListRef.current || isRestoringScroll.current) return;

    const currentScrollState = tabScrollStates[activeTab];

    // Always set the scroll position, even if it's 0 (to reset scroll for new tabs)
    isRestoringScroll.current = true;
    scrollableActivityListRef.current.scrollTop = currentScrollState.scrollTop;

    // Reset the flag after a brief delay
    setTimeout(() => {
      isRestoringScroll.current = false;
    }, 100);
  }, [activeTab, tabScrollStates]);

  // Load saved data from sessionStorage on mount or when userId changes
  useEffect(() => {
    if (!userId || !isDataReady) return;

    const keys = getStorageKeys(userId);

    try {
      // Load active tab
      const savedActiveTab = sessionStorage.getItem(
        keys.activeTab
      ) as ActivityTab;
      if (
        savedActiveTab &&
        ["all", "cases", "answers", "comments"].includes(savedActiveTab)
      ) {
        setActiveTab(savedActiveTab);
      }

      // Load scroll states
      const savedScrollStates = sessionStorage.getItem(keys.scrollStates);
      if (savedScrollStates) {
        const parsedStates = JSON.parse(savedScrollStates) as TabScrollStates;

        // Validate the structure and merge with defaults
        const validatedStates: TabScrollStates = {
          all: {
            scrollTop: parsedStates.all?.scrollTop || 0,
            visibleCount:
              parsedStates.all?.visibleCount || INITIAL_VISIBLE_COUNT,
          },
          cases: {
            scrollTop: parsedStates.cases?.scrollTop || 0,
            visibleCount:
              parsedStates.cases?.visibleCount || INITIAL_VISIBLE_COUNT,
          },
          answers: {
            scrollTop: parsedStates.answers?.scrollTop || 0,
            visibleCount:
              parsedStates.answers?.visibleCount || INITIAL_VISIBLE_COUNT,
          },
          comments: {
            scrollTop: parsedStates.comments?.scrollTop || 0,
            visibleCount:
              parsedStates.comments?.visibleCount || INITIAL_VISIBLE_COUNT,
          },
        };

        setTabScrollStates(validatedStates);
      }
    } catch (error) {
      console.warn("Failed to load saved scroll states:", error);
    }
  }, [userId, isDataReady, getStorageKeys]);

  // Restore scroll position when tab changes or data is ready
  useEffect(() => {
    if (isDataReady && scrollableActivityListRef.current) {
      // Use a longer timeout to ensure the DOM has fully updated with new content
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

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Debounce scroll saving to avoid excessive writes
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

  // Handle tab change
  const handleTabChange = useCallback(
    (newTab: ActivityTab) => {
      if (newTab === activeTab) return; // Don't do anything if it's the same tab

      if (!userId) {
        setActiveTab(newTab);
        return;
      }

      // Save current scroll position before switching
      if (!isRestoringScroll.current) {
        saveCurrentScrollPosition();
      }

      // Update active tab
      setActiveTab(newTab);

      // Save active tab to sessionStorage
      const keys = getStorageKeys(userId);
      try {
        sessionStorage.setItem(keys.activeTab, newTab);
      } catch (error) {
        console.warn("Failed to save active tab to sessionStorage:", error);
      }
    },
    [activeTab, userId, saveCurrentScrollPosition, getStorageKeys]
  );

  // Handle load more items
  const handleLoadMoreItems = useCallback(() => {
    setTabScrollStates((prev) => {
      const newStates = {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          visibleCount: prev[activeTab].visibleCount + LOAD_MORE_INCREMENT,
        },
      };

      // Save updated states to sessionStorage
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

  // 1. ADD THE RESET FUNCTION
  const resetScrollAndVisibleCount = useCallback(() => {
    // Reset the state to its initial values
    setTabScrollStates(getInitialTabStates());
    // Also reset the scroll position of the div element itself
    if (scrollableActivityListRef.current) {
      scrollableActivityListRef.current.scrollTop = 0;
    }
    // We could also clear the sessionStorage here if desired, but resetting the state is sufficient for UX.
  }, []); // Empty dependency array as it has no external dependencies

  // Create visible counts object for backward compatibility
  const visibleCounts = {
    all: tabScrollStates.all.visibleCount,
    cases: tabScrollStates.cases.visibleCount,
    answers: tabScrollStates.answers.visibleCount,
    comments: tabScrollStates.comments.visibleCount,
  };

  // 2. EXPORT THE NEW FUNCTION
  return {
    activeTab,
    visibleCounts,
    scrollableActivityListRef,
    handleTabChange,
    handleLoadMoreItems,
    resetScrollAndVisibleCount, // Export the function
    tabScrollStates,
  };
};

export default useUserActivityScrollPersistence;
