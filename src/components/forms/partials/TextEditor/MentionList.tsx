// src/components/forms/partials/TextEditor/MentionList.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import type { MentionGuestOptions, MentionUser } from "./MentionSuggestion";

interface MentionListProps {
  items: MentionUser[];
  query?: string;
  command: (user: { id: string; label: string; username: string }) => void;
  guestOptions?: MentionGuestOptions;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const TIER_LABELS = {
  case: "С достъп до сигнала",
  other: "Без достъп — ще получат гост-достъп",
};

const containerClass =
  "bg-white rounded-lg shadow-lg border border-gray-200 text-sm z-[1000] overflow-y-auto max-h-72";

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    // an "other"-tier user waiting for the guest-access confirmation
    const [pending, setPending] = useState<MentionUser | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const insert = (user: MentionUser) =>
      props.command({ id: user._id, label: user.name, username: user.username });

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (!item) return;
      if (item.tier === "other") {
        setPending(item);
        return;
      }
      insert(item);
    };

    const confirmGuest = () => {
      if (pending) insert(pending);
    };

    const addCategoryInstead = async (categoryId: string) => {
      if (!pending) return;
      const user = pending;
      await props.guestOptions?.onAddCategory?.(categoryId);
      // the user now has access through the category, so no guest is created
      insert(user);
    };

    useEffect(() => {
      setSelectedIndex(0);
      setPending(null);
    }, [props.items]);

    useEffect(() => {
      const item = scrollContainerRef.current?.querySelector<HTMLElement>(
        `[data-index="${selectedIndex}"]`,
      );
      item?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (pending) {
          if (event.key === "Escape") {
            setPending(null);
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            confirmGuest();
            return true;
          }
          // keep the editor cursor still while the confirmation is open
          return event.key === "ArrowUp" || event.key === "ArrowDown";
        }
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

    if (pending) {
      const fixes = pending.fixCategories ?? [];
      const canFix = !!props.guestOptions?.onAddCategory && fixes.length > 0;
      return (
        <div
          className={`${containerClass} w-80 p-3 space-y-2`}
          role="dialog"
          aria-label="Потвърждение за гост-достъп"
        >
          <div>
            <div className="font-semibold text-gray-900">
              {pending.name}{" "}
              <span className="font-normal text-gray-500">
                @{pending.username}
              </span>
            </div>
            {pending.position && (
              <div className="text-xs text-gray-500">{pending.position}</div>
            )}
          </div>
          <p className="text-xs text-gray-700">
            Не е сред експертите и мениджърите на категориите на сигнала и в
            момента <b>няма достъп</b> до него.
          </p>
          <p className="text-xs text-gray-700">
            При изпращане ще получи <b>гост-достъп</b>: ще вижда сигнала и ще
            може да коментира. Това се записва в историята на сигнала.
          </p>
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={confirmGuest}
              className="w-full rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 cursor-pointer"
            >
              Добави като гост
            </button>
            {canFix &&
              fixes.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addCategoryInstead(category._id)}
                  className="w-full rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                >
                  {props.guestOptions?.addCategoryLabel ?? "Добави категория"}{" "}
                  „{category.name}“ вместо това
                </button>
              ))}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPending(null)}
              className="w-full rounded-md px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Отказ
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Enter — добави като гост · Esc — назад
          </p>
        </div>
      );
    }

    if (props.items.length === 0) {
      return (
        <div className={`${containerClass} w-72 p-3 space-y-1`}>
          <div className="text-gray-700">
            Няма съвпадение
            {props.query ? (
              <>
                {" "}
                за „<b>{props.query}</b>“
              </>
            ) : null}
            .
          </div>
          {props.guestOptions?.emptyHint && (
            <div className="text-xs text-gray-500">
              {props.guestOptions.emptyHint}
            </div>
          )}
        </div>
      );
    }

    const hasOtherTier = props.items.some((item) => item.tier === "other");

    return (
      <div className={`${containerClass} w-72`} ref={scrollContainerRef}>
        {props.items.map((item, index) => {
          const tier = item.tier ?? "case";
          const previousTier =
            index > 0 ? (props.items[index - 1].tier ?? "case") : null;
          // the "case" header only makes sense when there is a second group
          const showHeader = tier !== previousTier && hasOtherTier;
          return (
            <div key={item._id}>
              {showHeader && (
                <div
                  className={`px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide ${
                    tier === "other"
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-500"
                  }`}
                >
                  {TIER_LABELS[tier]}
                </div>
              )}
              <button
                data-index={index}
                className={`items-center cursor-pointer flex justify-between w-full text-left px-3 py-2 ${
                  tier === "other" ? "border-l-2 border-amber-300" : ""
                } ${
                  index === selectedIndex ? "bg-indigo-100" : "hover:bg-gray-100"
                }`}
                onClick={() => selectItem(index)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="ml-2 text-gray-500">@{item.username}</div>
              </button>
            </div>
          );
        })}
      </div>
    );
  }
);

export default MentionList;
