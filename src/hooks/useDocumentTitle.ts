import { useEffect } from "react";

const SUFFIX = "ГНС";

/**
 * Sets document.title to `title | ГНС` (or just `ГНС` when no title provided).
 * Restores the default suffix on unmount.
 */
const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : SUFFIX;
    return () => {
      document.title = SUFFIX;
    };
  }, [title]);
};

export default useDocumentTitle;
