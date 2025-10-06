import { useState, useRef, useEffect } from "react";
import {
  CalendarIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
// @ts-ignore
import "moment/locale/bg"; // Import Bulgarian locale for moment

moment.updateLocale("bg", {
  relativeTime: {
    past: (input) =>
      input === "няколко секунди" ? "току-що" : `преди ${input}`,
    s: "няколко секунди",
    ss: "%d секунди",
    m: "минута",
    mm: "%d минути",
    h: "час",
    hh: "%d часа",
    d: "ден",
    dd: "%d дни",
    M: "месец",
    MM: "%d месеца",
    y: "година",
    yy: "%d години",
  },
});

// A simple hook to check for screen size without needing a separate file
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
};

const ShowDate = ({
  date,
  centered = false,
  isCase = false,
  collapsible = false,
}: {
  date: string;
  centered?: boolean;
  isCase?: boolean;
  collapsible?: boolean;
}) => {
  const [showDate, setShowDate] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 40rem)"); // Corresponds to `sm:` breakpoint
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPopoverOpen]);

  const handleMainClick = () => {
    if (isMobile && collapsible) {
      setIsPopoverOpen((prev) => !prev);
    } else {
      setShowDate((prev) => !prev);
    }
  };

  let parseDate;
  if (isCase) {
    parseDate = moment.utc(parseInt(date, 10));
  } else parseDate = date;

  const fullFormatDate = moment(parseDate).local().format("lll");
  const relativeFormatDate = moment(parseDate).fromNow();
  const textVisibilityClass = collapsible ? "hidden sm:inline" : "";

  return (
    <div
      ref={containerRef}
      className={`whitespace-nowrap text-sm text-gray-500 flex items-center flex-shrink-0 ${
        centered ? "justify-center" : ""
      } gap-1.5 group relative hover:cursor-pointer`}
      onClick={handleMainClick}
      title={
        isMobile && collapsible
          ? "Виж конкретната дата"
          : showDate
          ? relativeFormatDate
          : fullFormatDate
      }
    >
      <CalendarIcon className="!h-4 !w-4 min-w-4 min-h-4" />
      {!showDate && (
        <span className={textVisibilityClass}>{relativeFormatDate}</span>
      )}
      {showDate && (
        <span className={textVisibilityClass}>{fullFormatDate}</span>
      )}

      {isMobile && collapsible && isPopoverOpen && (
        <div
          className="absolute right-0 mr-5 w-max max-w-xs z-20 bg-white text-gray-500 rounded-md shadow-md border border-gray-100 p-1 flex items-center gap-2 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowDate(!showDate)}
            className="cursor-pointer p-1 rounded-xs hover:bg-gray-100 hover:text-gray-900"
            title="Смени формата"
          >
            <span className="text-sm">
              {showDate ? fullFormatDate : relativeFormatDate}
            </span>
          </button>
          <button
            onClick={() => setIsPopoverOpen(false)}
            className="cursor-pointer p-1 rounded-full hover:bg-gray-100 hover:text-gray-900"
            title="Затвори"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ShowDate;
