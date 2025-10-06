import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_LEAN_USERS } from "../../graphql/query/user";
import { XMarkIcon } from "@heroicons/react/24/outline";
import CustomDropdown from "../global/dropdown/CustomDropdown";
import UserMultiSelector from "../global/dropdown/UserMultiSelector";
import ClearableInput from "../global/inputs/ClearableInput";

interface ILeanUser {
  _id: string;
  name: string;
  username: string;
  role: { _id: string } | null;
  managed_categories: { _id: string }[] | null;
  expert_categories: { _id: string }[] | null;
}

interface CategorySearchBarProps {
  filterName: string;
  setFilterName: (value: string) => void;
  expertIds: string[];
  setExpertIds: (ids: string[]) => void;
  managerIds: string[];
  setManagerIds: (ids: string[]) => void;
  filterArchived: boolean | undefined;
  setFilterArchived: (value: boolean | undefined) => void;
  refetchKey?: number;
}

const CategorySearchBar: React.FC<CategorySearchBarProps> = ({
  filterName,
  setFilterName,
  expertIds: expertIdsProp,
  setExpertIds,
  managerIds: managerIdsProp,
  setManagerIds,
  filterArchived,
  setFilterArchived,
  refetchKey,
}) => {
  const expertIds = expertIdsProp || [];
  const managerIds = managerIdsProp || [];

  const [allAvailableUsers, setAllAvailableUsers] = useState<ILeanUser[]>([]);
  const [userCache, setUserCache] = useState<Record<string, ILeanUser>>({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [fetchAllUsersQuery, { loading: loadingUsers, error: usersError }] =
    useLazyQuery<{ getLeanUsers: ILeanUser[] }>(GET_LEAN_USERS, {
      onCompleted: (data) => {
        const users = data?.getLeanUsers || [];
        setAllAvailableUsers(users);
        const newCache: Record<string, ILeanUser> = {};
        users.forEach((user) => {
          newCache[user._id] = user;
        });
        setUserCache((prevCache) => ({ ...prevCache, ...newCache }));
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    });

  const ensureUsersFetched = useCallback(() => {
    if (
      (!initialLoadComplete || (refetchKey && refetchKey > 0)) &&
      !loadingUsers &&
      fetchAllUsersQuery
    ) {
      fetchAllUsersQuery({ variables: { input: "" } });
    }
  }, [initialLoadComplete, loadingUsers, fetchAllUsersQuery, refetchKey]);

  useEffect(() => {
    ensureUsersFetched();
  }, [ensureUsersFetched]);

  const displayableExperts = useMemo(
    () =>
      allAvailableUsers.filter(
        (user) =>
          Array.isArray(user.expert_categories) &&
          user.expert_categories.length > 0
      ),
    [allAvailableUsers]
  );

  const displayableManagers = useMemo(
    () =>
      allAvailableUsers.filter(
        (user) =>
          Array.isArray(user.managed_categories) &&
          user.managed_categories.length > 0
      ),
    [allAvailableUsers]
  );

  // --- Fetch users if selected IDs are not in cache ---
  useEffect(() => {
    const allSelectedIds = [...new Set([...expertIdsProp, ...managerIdsProp])];
    const idsNotInCache = allSelectedIds.filter((id) => !userCache[id]);
    if (idsNotInCache.length > 0 && !loadingUsers) {
      ensureUsersFetched();
    }
  }, [
    expertIdsProp,
    managerIdsProp,
    userCache,
    loadingUsers,
    ensureUsersFetched,
  ]);

  const statusOptions = useMemo(
    () => [
      { label: "Всички", value: undefined },
      { label: "Активни", value: false },
      { label: "Архивирани", value: true },
    ],
    []
  );

  const t_hardcoded = (key: string) => key;

  return (
    <div className="pt-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 items-start">
        {/* Name Filter */}
        <ClearableInput
          id="filterCategoryName"
          label={t_hardcoded("Име на категория")}
          value={filterName}
          onChange={setFilterName}
          placeholder={t_hardcoded("Търси по име...")}
        />
        <UserMultiSelector
          label={t_hardcoded("Експерти")}
          placeholder={t_hardcoded("Избери експерти...")}
          selectedUserIds={expertIds}
          setSelectedUserIds={setExpertIds}
          availableUsers={displayableExperts}
          userCache={userCache}
          loading={loadingUsers && !initialLoadComplete}
          error={usersError}
          t={t_hardcoded}
        />
        <UserMultiSelector
          label={t_hardcoded("Мениджъри")}
          placeholder={t_hardcoded("Избери мениджъри...")}
          selectedUserIds={managerIds}
          setSelectedUserIds={setManagerIds}
          availableUsers={displayableManagers}
          userCache={userCache}
          loading={loadingUsers && !initialLoadComplete}
          error={usersError}
          t={t_hardcoded}
        />
        {/* Status Filter */}
        <CustomDropdown
          label={t_hardcoded("Статус")}
          options={statusOptions}
          value={filterArchived}
          onChange={setFilterArchived}
          widthClass="w-full"
        />
      </div>
    </div>
  );
};

export default CategorySearchBar;
