// src/hooks/useCategoryScrollPersistence.ts
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";

const INITIAL_VISIBLE_CASES = 10;
const SESSION_STORAGE_PREFIX = "categoryScrollState_";

const getStorageKey = (categoryName: string | undefined): string | null =>
  categoryName ? `${SESSION_STORAGE_PREFIX}${categoryName}` : null;

interface StoredScrollState {
  scrollTop: number;
  count: number;
}

const useCategoryScrollPersistence = (
  categoryNameFromParams: string | undefined,
  isDataReady: boolean
) => {
  const [visibleCasesCount, setVisibleCasesCount] = useState<number>(() => {
    const key = getStorageKey(categoryNameFromParams);
    if (key) {
      try {
        const storedStateJSON = sessionStorage.getItem(key);
        if (storedStateJSON) {
          const storedState: StoredScrollState = JSON.parse(storedStateJSON);
          if (typeof storedState.count === "number" && storedState.count > 0) {
            return storedState.count;
          }
        }
      } catch (e) {
        console.error(
          "[Initial State] Error reading count from sessionStorage:",
          e
        );
      }
    }
    return INITIAL_VISIBLE_CASES;
  });

  const visibleCasesCountRef = useRef(visibleCasesCount);
  const scrollableCasesListRef = useRef<HTMLDivElement>(null);
  const scrollRestoredForCurrentCategoryInstanceRef = useRef<boolean>(false);
  const categoryNameRef = useRef(categoryNameFromParams); // For immediate saves like unmount/category change cleanup

  useEffect(() => {
    visibleCasesCountRef.current = visibleCasesCount;
  }, [visibleCasesCount]);

  const saveDataToSessionStorage = useCallback(
    (source: string, targetCategoryName: string | undefined) => {
      //   console.log(
      //     `[SAVE_DATA] Attempting: source="<span class="math-inline">\{source\}", category\="</span>{targetCategoryName}"`
      //   );
      if (scrollableCasesListRef.current && targetCategoryName) {
        const key = getStorageKey(targetCategoryName);
        if (key) {
          const stateToSave: StoredScrollState = {
            scrollTop: scrollableCasesListRef.current.scrollTop,
            count: visibleCasesCountRef.current,
          };
          //   console.log(
          //     `[SAVE_DATA] Saving for key "${key}":`,
          //     JSON.stringify(stateToSave)
          //   );
          try {
            sessionStorage.setItem(key, JSON.stringify(stateToSave));
          } catch (e) {
            console.error(`[SAVE_DATA] Error for key "${key}":`, e);
          }
        } else {
          console.warn(
            `[SAVE_DATA] No storage key for category "${targetCategoryName}"`
          );
        }
      } else {
        console.warn(
          `[SAVE_DATA] Skipped: scrollRef=<span class="math-inline">\{\!\!scrollableCasesListRef\.current\}, category\="</span>{targetCategoryName}"`
        );
      }
    },
    []
  );

  useEffect(() => {
    const previousCategoryName = categoryNameRef.current; // Capture previous name before updating ref
    categoryNameRef.current = categoryNameFromParams; // Update ref for current category

    const key = getStorageKey(categoryNameFromParams);
    let initialCount = INITIAL_VISIBLE_CASES;

    if (key) {
      try {
        const storedStateJSON = sessionStorage.getItem(key);
        if (storedStateJSON) {
          const storedState: StoredScrollState = JSON.parse(storedStateJSON);
          if (typeof storedState.count === "number" && storedState.count > 0) {
            initialCount = storedState.count;
          }
        }
      } catch (e) {
        console.error(
          `[Category Change Effect] Error reading state for ${categoryNameFromParams}:`,
          e
        );
      }
    }
    setVisibleCasesCount(initialCount);

    if (scrollableCasesListRef.current) {
      scrollableCasesListRef.current.scrollTop = 0;
    }
    scrollRestoredForCurrentCategoryInstanceRef.current = false;

    return () => {
      // Save state for the *previous* category when categoryNameFromParams changes
      if (previousCategoryName) {
        // Only save if there was a previous category
        saveDataToSessionStorage("CategoryChangeCleanup", previousCategoryName);
      }
    };
  }, [categoryNameFromParams, saveDataToSessionStorage]);

  useLayoutEffect(() => {
    if (
      isDataReady &&
      scrollableCasesListRef.current &&
      !scrollRestoredForCurrentCategoryInstanceRef.current &&
      categoryNameFromParams
    ) {
      const key = getStorageKey(categoryNameFromParams);
      if (key) {
        try {
          const storedStateJSON = sessionStorage.getItem(key);
          if (storedStateJSON) {
            const storedState: StoredScrollState = JSON.parse(storedStateJSON);
            if (typeof storedState.scrollTop === "number") {
              scrollableCasesListRef.current.scrollTop = storedState.scrollTop;
              scrollRestoredForCurrentCategoryInstanceRef.current = true;
            }
          }
        } catch (e) {
          console.error(
            "[Restore Scroll LayoutEffect] Error restoring scroll position:",
            e
          );
        }
      }
    }
  }, [categoryNameFromParams, visibleCasesCount, isDataReady]);

  useEffect(() => {
    const scrollDiv = scrollableCasesListRef.current;
    let debounceTimer: number | undefined;
    const categoryNameForListener = categoryNameFromParams;

    // console.log(
    //   `[WHEEL_EFFECT_SETUP] category="<span class="math-inline">\{categoryNameForListener\}", scrollDivExists\=</span>{!!scrollDiv}, isDataReady=${isDataReady}`
    // );

    const handleDebouncedWheelSave = () => {
      //   console.log(
      //     `[WHEEL_EVENT_HANDLER] Scroll detected for category="${categoryNameForListener}" at ${new Date().toLocaleTimeString()}`
      //   );
      clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        // console.log(
        //   `[WHEEL_DEBOUNCE_TIMEOUT] Firing save for category="${categoryNameForListener}" at ${new Date().toLocaleTimeString()}`
        // );
        saveDataToSessionStorage("WheelDebounced", categoryNameForListener);
      }, 500);
    };

    if (scrollDiv && categoryNameForListener) {
      //   console.log(
      //     `[WHEEL_EFFECT_SETUP] Attaching wheel listener for category="${categoryNameForListener}"`
      //   );
      scrollDiv.addEventListener("wheel", handleDebouncedWheelSave, {
        passive: true,
      });
    } else {
      //   console.log(
      //     `[WHEEL_EFFECT_SETUP] NOT attaching listener for category="${categoryNameForListener}" (scrollDiv: ${!!scrollDiv})`
      //   );
    }

    return () => {
      //   console.log(
      //     `[WHEEL_EFFECT_CLEANUP] Cleaning up for category="<span class="math-inline">\{categoryNameForListener\}", scrollDivExists\=</span>{!!scrollDiv}`
      //   );
      if (scrollDiv && categoryNameForListener) {
        // console.log(
        //   `[WHEEL_EFFECT_CLEANUP] Removing wheel listener for category="${categoryNameForListener}"`
        // );
        scrollDiv.removeEventListener("wheel", handleDebouncedWheelSave);
      }
      clearTimeout(debounceTimer);
    };
    // Make sure isDataReady is in the deps array if it wasn't already,
    // as it signals when the scrollDiv is likely to be available.
  }, [categoryNameFromParams, saveDataToSessionStorage, isDataReady]);

  useEffect(() => {
    // This captures the categoryNameFromParams active at the time of unmount.
    const currentCategoryOnUnmount = categoryNameFromParams;
    return () => {
      if (currentCategoryOnUnmount) {
        // Only save if there was a category
        saveDataToSessionStorage("UnmountCleanup", currentCategoryOnUnmount);
      }
    };
  }, [categoryNameFromParams, saveDataToSessionStorage]); // Rerun if categoryNameFromParams changes to update closure

  const handleLoadMoreCases = useCallback(() => {
    const currentScrollTop = scrollableCasesListRef.current
      ? scrollableCasesListRef.current.scrollTop
      : 0;

    setVisibleCasesCount((prevCount: number) => {
      const newCount = prevCount + 10;
      if (categoryNameFromParams) {
        const key = getStorageKey(categoryNameFromParams);
        if (key) {
          try {
            const stateToSave: StoredScrollState = {
              scrollTop: currentScrollTop,
              count: newCount,
            };
            sessionStorage.setItem(key, JSON.stringify(stateToSave));
          } catch (e) {
            console.error(
              `[Load More] Error saving state for ${categoryNameFromParams}:`,
              e
            );
          }
        }
      }
      return newCount;
    });
  }, [categoryNameFromParams]);

  return {
    visibleCasesCount,
    scrollableCasesListRef,
    handleLoadMoreCases,
  };
};

export default useCategoryScrollPersistence;
