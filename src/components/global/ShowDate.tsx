import { useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
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

const ShowDate = ({
  date,
  centered = false,
}: {
  date: string;
  centered?: boolean;
}) => {
  const [showDate, setShowDate] = useState(false);

  return (
    <div
      className={`w-36 whitespace-nowrap text-sm text-gray-500 flex items-center ${
        centered ? "justify-center" : ""
      } gap-2 px-2 group relative hover:cursor-pointer`}
      onClick={() => setShowDate(!showDate)}
    >
      <CalendarIcon className="!h-4 !w-4 min-w-4 min-h-4" />
      {!showDate && <span>{moment(date).fromNow()}</span>}
      {showDate && <span>{moment(date).format("lll")}</span>}
    </div>
  );
};

export default ShowDate;
