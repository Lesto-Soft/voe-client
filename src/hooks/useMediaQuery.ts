import { useState, useEffect } from "react";

/**
 * A custom hook to check if the window matches a CSS media query.
 * @param query The media query string (e.g., '(min-width: 1024px)').
 * @returns `true` if the query matches, otherwise `false`.
 */
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Set the initial value
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Update the value on window resize
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};

export default useMediaQuery;
