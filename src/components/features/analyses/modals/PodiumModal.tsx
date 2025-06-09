import React from "react";
import { IUser } from "../../../../db/interfaces";
import UserAvatar from "../../../cards/UserAvatar";
import UserLink from "../../../global/UserLink";

// We define this type here for now. We can move it to a shared types file later.
type RankedUser = {
  user: IUser;
  count: number;
};

interface PodiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: RankedUser[];
}

// A simple X-mark icon component for the close button
const XMarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

export const PodiumModal: React.FC<PodiumModalProps> = ({
  isOpen,
  onClose,
  title,
  users,
}) => {
  if (!isOpen) {
    return null;
  }

  const podiumUsers = users.slice(0, 3);
  const otherUsers = users.slice(3);

  // Defines the visual order: 2nd, 1st, 3rd place
  const podiumOrder = [1, 0, 2];
  const podiumColors: { [key: number]: string } = {
    0: "bg-yellow-400 border-yellow-500", // Gold
    1: "bg-gray-300 border-gray-400", // Silver
    2: "bg-orange-400 border-orange-500", // Bronze
  };

  // Try using pixel values instead of percentages
  const fixedHeights: { [key: number]: string } = {
    0: "160px", // Gold - tallest (80% of 200px)
    1: "120px", // Silver - medium (60% of 200px)
    2: "80px", // Bronze - shortest (40% of 200px)
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing on inner click
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="hover:cursor-pointer text-gray-400 hover:text-gray-700 transition"
          >
            <XMarkIcon />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Няма данни за показване.
            </p>
          ) : (
            <>
              {/* Podium Section */}
              <div className="flex items-end justify-center gap-2 sm:gap-4 mb-6">
                {podiumOrder.map((index) => {
                  const userStat = podiumUsers[index];
                  if (!userStat)
                    return (
                      <div key={`placeholder-${index}`} className="w-1/4"></div>
                    );

                  // Debug: log the height being applied
                  console.log(
                    `Position ${index + 1} height:`,
                    fixedHeights[index]
                  );

                  return (
                    <div
                      key={userStat.user._id}
                      className="w-1/3 flex flex-col items-center"
                    >
                      <div className="flex flex-col items-center mb-1">
                        <UserAvatar
                          name={userStat.user.name}
                          imageUrl={userStat.user.avatar}
                          size={48}
                        />
                      </div>
                      <div
                        style={{
                          height: fixedHeights[index],
                          minHeight: fixedHeights[index], // Force minimum height
                        }}
                        className={`w-full ${podiumColors[index]} rounded-t-lg p-2 flex flex-col justify-start items-center border-b-4 shadow-md`}
                      >
                        <div className="text-center">
                          <UserLink user={userStat.user} type="table" />
                          <p className="text-lg font-bold text-gray-800">
                            {userStat.count}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Other Users List */}
              {otherUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 border-t pt-4">
                    Останали участници
                  </h3>
                  <ul className="space-y-2">
                    {otherUsers.map((userStat, index) => (
                      <li
                        key={userStat.user._id}
                        className="flex items-center bg-white p-2 rounded-lg shadow-sm"
                      >
                        <span className="font-bold text-gray-500 w-8 text-center">
                          {index + 4}.
                        </span>
                        <UserAvatar
                          name={userStat.user.name}
                          imageUrl={userStat.user.avatar}
                          size={32}
                        />
                        <div className="ml-3 flex-grow">
                          <UserLink user={userStat.user} type="table" />
                        </div>
                        <span className="font-bold text-gray-800">
                          {userStat.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
