import React, { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useLocation, useNavigate } from "react-router";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

const ITEMS_PER_PAGE = 10;

export const itemsPerPage = (page: number = 1, data: any) => {
  if (!data) {
    return {
      data: [],
      totalPages: 0,
    };
  }

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMaterials = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(Number(data.length) / ITEMS_PER_PAGE);

  return {
    data: paginatedMaterials,
    totalPages,
  };
};

interface PaginationProps {
  totalPages: number;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onPageChange?: (page: number) => void; // <-- add optional onPageChange
}

const Pagination = ({
  totalPages,
  totalCount,
  currentPage,
  itemsPerPage,
  onItemsPerPageChange,
  onPageChange,
}: PaginationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const allPages = generatePagination(currentPage, totalPages);

  // State for "Go to page"
  const [gotoValue, setGotoValue] = useState("");
  const handleGoto = () => {
    const pageNum = Number(gotoValue);
    if (pageNum >= 1 && pageNum <= totalPages && !isNaN(pageNum)) {
      setGotoValue("");
      handlePageChange(pageNum);
    }
  };

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(location.search);
    params.set("page", pageNumber.toString());
    return `${location.pathname}?${params.toString()}`;
  };

  const handlePageChange = (pageNumber: number | string) => {
    if (typeof pageNumber === "number" && !isNaN(pageNumber)) {
      if (onPageChange) {
        onPageChange(pageNumber); // Use callback if provided
      } else {
        navigate(createPageURL(pageNumber));
      }
    }
  };

  // Handler for dropdown change: update parent and URL
  const handlePerPageChange = (value: number) => {
    const params = new URLSearchParams(location.search);
    params.set("perPage", String(value));
    params.set("page", "1");
    navigate(`${location.pathname}?${params.toString()}`);
    onItemsPerPageChange(value);
  };

  // Calculate shown count
  const shownCount = Math.min(currentPage * itemsPerPage, totalCount);
  const startCount =
    totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between my-8 px-4 sm:px-6 lg:px-8 gap-4">
      {/* Left: Info (hidden on small screens) */}
      <div className="text-gray-600 text-sm w-full md:w-auto text-left hidden md:flex items-center gap-2">
        <span>
          Показани&nbsp;
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={itemsPerPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          &nbsp;от {totalCount} резултата
        </span>
      </div>
      {/* Center: Pagination */}
      <div className="flex-1 flex justify-center">
        <div className="inline-flex gap-1">
          <PaginationArrow
            direction="left"
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage <= 1}
          />
          <div className="flex gap-1">
            {allPages.map((page, index) => {
              let position: "first" | "last" | "single" | "middle" | undefined;

              if (index === 0) position = "first";
              if (index === allPages.length - 1) position = "last";
              if (allPages.length === 1) position = "single";
              if (page === "...") position = "middle";

              return (
                <PaginationNumber
                  key={page + "-" + index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  page={page}
                  position={position}
                  isActive={currentPage === page}
                />
              );
            })}
          </div>
          <PaginationArrow
            direction="right"
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage >= totalPages}
          />
        </div>
      </div>
      {/* Right: Go to page (hidden on small screens) */}
      <div className="items-center gap-2 w-full md:w-auto justify-end hidden md:flex">
        <span className="text-gray-600 text-sm">Към страница:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={gotoValue}
          onChange={(e) => setGotoValue(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleGoto();
          }}
          className="w-16 h-10 rounded-xl border border-blue-400 text-center text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="№"
        />
        <button
          className="px-3 py-2 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
          onClick={handleGoto}
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const PaginationNumber = ({
  page,
  onClick,
  isActive,
  position,
}: {
  page: number | string;
  onClick: () => void;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
}) => {
  const className = clsx(
    "flex h-10 w-10 items-center justify-center text-base font-semibold transition-all duration-150",
    {
      "rounded-xl shadow bg-blue-500 text-white border-2 border-blue-500 scale-105":
        isActive,
      "rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 cursor-pointer":
        !isActive && position !== "middle",
      "text-gray-400 bg-transparent border-none cursor-default":
        position === "middle",
    }
  );

  return position === "middle" ? (
    <div className={className}>{page}</div>
  ) : (
    <button className={className} onClick={onClick} disabled={isActive}>
      {page}
    </button>
  );
};

const PaginationArrow = ({
  onClick,
  direction,
  isDisabled,
}: {
  onClick: () => void;
  direction: "left" | "right";
  isDisabled?: boolean;
}) => {
  const className = clsx(
    "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150",
    {
      "pointer-events-none text-gray-300 border-gray-200 bg-gray-100":
        isDisabled,
      "hover:bg-blue-50 hover:border-blue-400 text-blue-500 border-gray-300 bg-white cursor-pointer":
        !isDisabled,
      "mr-1": direction === "left",
      "ml-1": direction === "right",
      shadow: !isDisabled,
    }
  );

  const icon =
    direction === "left" ? (
      <ArrowLeftIcon className="w-5 h-5" />
    ) : (
      <ArrowRightIcon className="w-5 h-5" />
    );

  return (
    <button className={className} onClick={onClick} disabled={isDisabled}>
      {icon}
    </button>
  );
};

export default Pagination;
