import { useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";
import moment from "moment";

const ShowDate = ({ date }: { date: string }) => {
  const [showDate, setShowDate] = useState(false);

  return (
    <div
      className="w-36 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2 px-2 group relative hover:cursor-pointer"
      onClick={() => setShowDate(!showDate)}
    >
      <CalendarIcon className="!h-4 !w-4 min-w-[16px] min-h-[16px]" />
      {!showDate && <span>{moment(date).fromNow()}</span>}
      {showDate && <span>{moment(date).format("LLL")}</span>}
    </div>
  );
};

export default ShowDate;
