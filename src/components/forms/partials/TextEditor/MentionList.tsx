import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 text-sm w-64 z-50 overflow-y-auto max-h-60">
        {props.items.map((item, index) => (
          <button
            key={item._id}
            className={`flex items-center w-full text-left px-3 py-2 ${
              index === selectedIndex ? "bg-indigo-100" : "hover:bg-gray-100"
            }`}
            onClick={() => selectItem(index)}
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
