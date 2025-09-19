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
  isCase = false,
}: {
  date: string;
  centered?: boolean;
  isCase?: boolean;
}) => {
  const [showDate, setShowDate] = useState(false);
  let parseDate;
  if (isCase) {
    parseDate = moment.utc(parseInt(date, 10));
  } else parseDate = date;

  const fullFormatDate = moment(parseDate).local().format("lll");
  const relativeFormatDate = moment(parseDate).fromNow();

  return (
    <div
      className={`whitespace-nowrap text-sm text-gray-500 flex items-center flex-shrink-0 ${
        centered ? "justify-center" : ""
      } gap-1.5 group relative hover:cursor-pointer`}
      onClick={() => setShowDate(!showDate)}
      title={showDate ? relativeFormatDate : fullFormatDate}
    >
      <CalendarIcon className="!h-4 !w-4 min-w-4 min-h-4" />
      {!showDate && <span>{relativeFormatDate}</span>}
      {showDate && <span>{fullFormatDate}</span>}
    </div>
  );
};

export default ShowDate;
