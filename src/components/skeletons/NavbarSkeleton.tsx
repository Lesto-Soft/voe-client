const NavbarSkeleton = () => {
  return (
    <div className="bg-gray-200 shadow-md h-[6rem]">
      <div className="flex items-center justify-between p-4 px-4 md:px-1 lg:px-12 h-full animate-pulse">
        {/* Left Side: Title and Action Buttons */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Title and Subtitle */}
          <div className="flex-shrink min-w-0">
            <div className="bg-gray-300 h-6 w-24 rounded-md"></div>
            <div className="bg-gray-300 h-4 w-48 rounded-md mt-2 hidden lg:block"></div>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mr-2">
            <div className="bg-gray-300 h-10 w-10 rounded-md"></div>
            <div className="bg-gray-300 h-10 w-10 rounded-md"></div>
          </div>
        </div>

        {/* Right Side: Desktop Menu */}
        <div className="hidden md:flex space-x-4 items-center">
          {/* Management Button */}
          <div className="bg-gray-300 h-12 w-40 rounded-lg"></div>

          {/* NavLink Buttons */}
          <div className="bg-gray-300 h-12 w-32 rounded-lg"></div>
          <div className="bg-gray-300 h-12 w-32 rounded-lg"></div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="bg-gray-300 h-12 w-12 rounded-full"></div>
            <div className="hidden lg:block">
              <div className="bg-gray-300 h-4 w-24 rounded-md"></div>
              <div className="bg-gray-300 h-3 w-20 rounded-md mt-1"></div>
            </div>
          </div>

          {/* Notification Bell Skeleton (Desktop) */}
          <div className="bg-gray-300 h-10 w-10 rounded-full"></div>
        </div>

        {/* Right Side: Mobile Icons */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Notification Bell Skeleton (Mobile) */}
          <div className="bg-gray-300 h-10 w-10 rounded-full"></div>
          {/* Hamburger Skeleton */}
          <div className="bg-gray-300 h-8 w-8 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default NavbarSkeleton;
