import React, { useMemo } from "react";
import TextEditor from "./TextEditor/TextEditor";
import { CATEGORY_HELPERS, ROLES } from "../../../utils/GLOBAL_PARAMETERS";
import { IPaletteColor } from "../../../db/interfaces";
import ColorPicker from "./ColorPicker";
import UserMultiSelector from "../../global/dropdown/UserMultiSelector";

interface ILeanUserForForm {
  _id: string;
  name: string;
  username: string;
  role: { _id: string } | null; // Role can be null
}

const getTextLength = (html: string): number => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent?.trim().length || 0;
};

interface CategoryInputFieldsProps {
  name: string;
  setName: (value: string) => void;
  nameError: string | null;
  problem: string;
  setProblem: (value: string) => void;
  problemError: string | null;
  suggestion: string;
  setSuggestion: (value: string) => void;
  suggestionError: string | null;
  expertIds: string[];
  setExpertIds: (ids: string[]) => void;
  managerIds: string[];
  setManagerIds: (ids: string[]) => void;
  archived: boolean;
  setArchived: (isChecked: boolean) => void;
  color: string;
  setColor: (value: string) => void;
  colorError: string | null;
  usedColors: { color: string; categoryName: string }[];
  errorPlaceholderClass: string;
  allUsersForAssigning: ILeanUserForForm[];
  usersLoading: boolean;
  paletteColors: IPaletteColor[];
  paletteColorsLoading: boolean;
  canManageColors: boolean;
  onOpenColorManager: () => void;
  usersError: any;
}

const CategoryInputFields: React.FC<CategoryInputFieldsProps> = ({
  name,
  setName,
  nameError,
  problem,
  setProblem,
  problemError,
  suggestion,
  setSuggestion,
  suggestionError,
  expertIds,
  setExpertIds,
  managerIds,
  setManagerIds,
  archived,
  setArchived,
  color,
  setColor,
  colorError,
  usedColors,
  errorPlaceholderClass,
  allUsersForAssigning,
  usersLoading,
  paletteColors,
  paletteColorsLoading,
  canManageColors,
  onOpenColorManager,
  usersError,
}) => {
  const t = (key: string) => key;

  const problemCharCount = useMemo(() => getTextLength(problem), [problem]);
  const isProblemTooLong = useMemo(
    () => problemCharCount > CATEGORY_HELPERS.MAX,
    [problemCharCount]
  );
  const isProblemTooShort = useMemo(
    () => problemCharCount > 0 && problemCharCount < CATEGORY_HELPERS.MIN,
    [problemCharCount]
  );

  const suggestionCharCount = useMemo(
    () => getTextLength(suggestion),
    [suggestion]
  );
  const isSuggestionTooLong = useMemo(
    () => suggestionCharCount > CATEGORY_HELPERS.MAX,
    [suggestionCharCount]
  );
  const isSuggestionTooShort = useMemo(
    () => suggestionCharCount > 0 && suggestionCharCount < CATEGORY_HELPERS.MIN,
    [suggestionCharCount]
  );

  // Filter allUsersForAssigning to get only those with Expert or Admin roles
  const assignableUsers = useMemo(() => {
    if (!allUsersForAssigning) return []; // Guard against undefined
    return allUsersForAssigning.filter((user) => {
      const userRoleId = user.role?._id;
      return userRoleId === ROLES.EXPERT || userRoleId === ROLES.ADMIN;
    });
  }, [allUsersForAssigning]);

  const userCache = useMemo(() => {
    const cache: Record<string, ILeanUserForForm> = {};

    allUsersForAssigning.forEach((user) => {
      cache[user._id] = user; // Store the whole user object
    });

    return cache;
  }, [allUsersForAssigning]);

  return (
    <>
      {/* Name Input */}
      <div>
        <label
          htmlFor="categoryName"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("Име на категория")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={`w-full rounded-md border p-2 shadow-sm focus:outline-none focus:border-indigo-500 ${
            nameError ? "border-red-500" : "border-gray-300"
          }`}
        />
        <p
          className={`${errorPlaceholderClass} ${
            nameError ? "text-red-500" : ""
          }`}
        >
          {nameError || <>&nbsp;</>}
        </p>
      </div>
      {/* Archived Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="categoryArchived"
          checked={archived}
          onChange={(e) => setArchived(e.target.checked)}
          className="cursor-pointer h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label
          htmlFor="categoryArchived"
          className="cursor-pointer ml-2 block text-sm text-gray-900"
        >
          {t("Архивирана категория")}
        </label>
      </div>
      {/* Row 2: Experts | Managers */}
      <UserMultiSelector
        label={t("Експерти")}
        placeholder={t("Избери експерти...")}
        selectedUserIds={expertIds}
        setSelectedUserIds={setExpertIds}
        availableUsers={assignableUsers}
        userCache={userCache}
        loading={usersLoading}
        error={usersError}
      />
       {" "}
      <UserMultiSelector
        label={t("Мениджъри")}
        placeholder={t("Избери мениджъри...")}
        selectedUserIds={managerIds}
        setSelectedUserIds={setManagerIds}
        availableUsers={assignableUsers}
        userCache={userCache}
        loading={usersLoading}
        error={usersError}
      />
      {/* Color Picker (spanning both columns) */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t("Цвят на категория")} <span className="text-red-500">*</span>
        </label>
        {paletteColorsLoading ? (
          <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"></div>
        ) : (
          <ColorPicker
            selectedColor={color}
            onSelectColor={setColor}
            usedColors={usedColors}
            paletteColors={paletteColors}
            canManageColors={canManageColors}
            onOpenManager={onOpenColorManager}
          />
        )}
        <p
          className={`${errorPlaceholderClass} ${
            colorError ? "text-red-500" : ""
          }`}
        >
          {colorError || <>&nbsp;</>}
        </p>
      </div>
      {/* Problem and Suggestion Text Editors (spanning both columns) */}
      <div className="md:col-span-1">
        <label
          htmlFor="categoryProblem"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("Помощен текст за проблем")}
          <span className="text-red-500">*</span>
        </label>
        <TextEditor
          type="default"
          content={problem}
          onUpdate={(html) => setProblem(html)}
          placeholder={t(
            "Опиши какво покрива един сигнал за проблем по тази категория..."
          )}
          height="120px"
          maxLength={CATEGORY_HELPERS.MAX}
          minLength={CATEGORY_HELPERS.MIN}
          wrapperClassName="w-full rounded-md shadow-sm overflow-hidden bg-white"
        />
        {/* UPDATED: Display more specific length errors */}
        <p
          className={`${errorPlaceholderClass} ${
            problemError || isProblemTooLong || isProblemTooShort
              ? "text-red-500"
              : ""
          }`}
        >
          {problemError} {` `}
          {isProblemTooLong &&
            `Съдържанието надвишава лимита от ${CATEGORY_HELPERS.MAX} символа.`}
          {isProblemTooShort &&
            `Съдържанието трябва да е поне ${CATEGORY_HELPERS.MIN} символа.`}
          {!problemError && !isProblemTooLong && !isProblemTooShort && (
            <>&nbsp;</>
          )}
        </p>
      </div>
      <div className="md:col-span-1">
        <label
          htmlFor="categorySuggestion"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {t("Помощен текст за предложение")}
          <span className="text-red-500">*</span>
        </label>
        <TextEditor
          content={suggestion}
          onUpdate={(html) => setSuggestion(html)}
          placeholder={t(
            "Опиши какво покрива един сигнал за предложение по тази категория..."
          )}
          height="120px"
          maxLength={CATEGORY_HELPERS.MAX}
          minLength={CATEGORY_HELPERS.MIN}
          wrapperClassName="w-full rounded-md shadow-sm overflow-hidden bg-white"
        />
        {/* UPDATED: Display more specific length errors */}
        <p
          className={`${errorPlaceholderClass} ${
            suggestionError || isSuggestionTooLong || isSuggestionTooShort
              ? "text-red-500"
              : ""
          }`}
        >
          {suggestionError} {` `}
          {isSuggestionTooLong &&
            `Съдържанието надвишава лимита от ${CATEGORY_HELPERS.MAX} символа.`}
          {isSuggestionTooShort &&
            `Съдържанието трябва да е поне ${CATEGORY_HELPERS.MIN} символа.`}
          {!suggestionError &&
            !isSuggestionTooLong &&
            !isSuggestionTooShort && <>&nbsp;</>}
        </p>
      </div>
    </>
  );
};

export default CategoryInputFields;
