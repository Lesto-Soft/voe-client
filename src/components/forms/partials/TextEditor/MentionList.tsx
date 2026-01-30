// src/components/forms/partials/TextEditor/MentionList.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import type { MentionUser } from "./MentionSuggestion";

interface MentionListProps {
  items: MentionUser[];
  command: (user: { id: string; label: string }) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command({
          id: item.username,
          label: item.name,
        });
      }
    };

    useEffect(() => setSelectedIndex(0), [props.items]);
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (container) {
        const item = container.children[selectedIndex] as HTMLElement;
        if (item) {
          item.scrollIntoView({
            block: "nearest",
          });
        }
      }
    }, [selectedIndex]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (prevIndex) =>
              (prevIndex + props.items.length - 1) % props.items.length
          );
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prevIndex) => (prevIndex + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (props.items.length === 0) {
      return null;
    }

    return (
      <div
        className="bg-white rounded-lg shadow-lg border border-gray-200 text-sm w-64 z-[1000] overflow-y-auto max-h-60"
        ref={scrollContainerRef}
      >
        {props.items.map((item, index) => (
          <button
            key={item._id}
            className={`items-center cursor-pointer flex justify-between w-full text-left px-3 py-2 ${
              index === selectedIndex ? "bg-indigo-100" : "hover:bg-gray-100"
            }`}
            onClick={() => selectItem(index)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="font-semibold text-gray-800">{item.name}</div>
            <div className="ml-2 text-gray-500">@{item.username}</div>
          </button>
        ))}
      </div>
    );
  }
);

export default MentionList;
