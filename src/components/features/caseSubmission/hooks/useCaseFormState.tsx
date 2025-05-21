// src/features/caseSubmission/hooks/useCaseFormState.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  ChangeEvent,
  FormEvent,
} from "react";
import { useNavigate } from "react-router";
import { useLazyQuery, ApolloError } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { GET_USER_BY_USERNAME } from "../../../../graphql/query/user";
import { readFileAsBase64 } from "../../../../utils/attachment-handling";
import {
  FormCategory,
  FetchedUserInfo,
  CaseAttachmentInput,
  CreateCaseMutationInput,
  UserQueryResult,
  UserQueryVars,
} from "../types";

const MAX_SELECTED_CATEGORIES = 3;
const DEBOUNCE_DELAY = 500;

const findCategoryIdsByName = (
  selectedNames: string[],
  allCategories: FormCategory[]
): string[] => {
  if (!allCategories) return [];
  return allCategories
    .filter((cat) => selectedNames.includes(cat.name))
    .map((cat) => cat._id)
    .filter((id): id is string => !!id);
};

export interface UseCaseFormStateReturn {
  content: string;
  priority: CreateCaseMutationInput["priority"];
  selectedCategories: string[];
  attachments: File[];
  usernameInput: string;
  fetchedName: string;
  fetchedCreatorId: string | null;
  notFoundUsername: string | null;
  isUserLoading: boolean;
  userLookupError: ApolloError | undefined;
  submissionError: string | null;
  isSubmittingForm: boolean;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setPriority: React.Dispatch<
    React.SetStateAction<CreateCaseMutationInput["priority"]>
  >;
  toggleCategory: (categoryName: string) => void;
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  handleUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  clearAllFormErrors: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  getCategoryClass: (categoryName: string) => string;
  getSubmitButtonClass: (isMutationLoading: boolean) => string;
  helpModalContent: React.ReactNode;
  t: TFunction<"caseSubmission", undefined>;
}

interface HookProps {
  caseTypeParam: "PROBLEM" | "SUGGESTION" | null;
  categoriesData: FormCategory[] | undefined;
  executeCreateCase: (input: CreateCaseMutationInput) => Promise<any>;
  createCaseLoadingHook: boolean;
  createCaseErrorHook: ApolloError | undefined;
}

export const useCaseFormState = ({
  caseTypeParam,
  categoriesData,
  executeCreateCase,
  createCaseLoadingHook,
  createCaseErrorHook,
}: HookProps): UseCaseFormStateReturn => {
  const { t } = useTranslation("caseSubmission");
  const navigate = useNavigate();

  const [content, setContent] = useState<string>("");
  const [priority, setPriority] =
    useState<CreateCaseMutationInput["priority"]>("LOW");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [fetchedName, setFetchedName] = useState<string>("");
  const [fetchedCreatorId, setFetchedCreatorId] = useState<string | null>(null);
  const [notFoundUsername, setNotFoundUsername] = useState<string | null>(null);
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [
    getUserByUsernameQueryFn,
    { loading: isUserLoading, error: userLookupError, data: userLookupData },
  ] = useLazyQuery<UserQueryResult, UserQueryVars>(GET_USER_BY_USERNAME);

  const categoryList = useMemo(() => categoriesData ?? [], [categoriesData]);

  const clearAllFormErrors = (): void => setSubmissionError(null);

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setNotFoundUsername(null);
    setSubmissionError(null);
    setUsernameInput(event.target.value);
  };

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) {
      setFetchedName("");
      setFetchedCreatorId(null);
      setNotFoundUsername(null);
      setSearchedUsername(null);
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchedUsername(trimmedUsername);
      getUserByUsernameQueryFn({ variables: { username: trimmedUsername } });
    }, DEBOUNCE_DELAY);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [usernameInput, getUserByUsernameQueryFn]);

  useEffect(() => {
    if (isUserLoading) return;
    if (userLookupError) {
      console.error("User query error:", userLookupError);
      setFetchedName("");
      setFetchedCreatorId(null);
      setNotFoundUsername(null);
      // Optionally set a general user search error message using `t` if needed
      // setSubmissionError(t("caseSubmission.userSearchError", { message: userLookupError.message }));
      return;
    }
    if (typeof userLookupData !== "undefined") {
      if (userLookupData?.getLeanUserByUsername) {
        setFetchedName(userLookupData.getLeanUserByUsername.name);
        setFetchedCreatorId(userLookupData.getLeanUserByUsername._id);
        setNotFoundUsername(null);
      } else {
        setFetchedName("");
        setFetchedCreatorId(null);
        if (searchedUsername && usernameInput.trim() === searchedUsername) {
          setNotFoundUsername(searchedUsername); // This will be used in caseSubmission.userNotFoundError", {username: notFoundUsername})
        } else {
          setNotFoundUsername(null);
        }
      }
    }
  }, [
    userLookupData,
    isUserLoading,
    userLookupError,
    searchedUsername,
    usernameInput,
  ]);

  const toggleCategory = (categoryName: string): void => {
    clearAllFormErrors();
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName))
        return prev.filter((c) => c !== categoryName);
      if (prev.length < MAX_SELECTED_CATEGORIES) return [...prev, categoryName];
      return prev;
    });
  };

  const getCategoryClass = (categoryName: string): string => {
    if (!caseTypeParam) return "";
    const isSelected = selectedCategories.includes(categoryName);
    const isDisabled =
      !isSelected && selectedCategories.length >= MAX_SELECTED_CATEGORIES;
    const common =
      "px-3 py-1 border rounded-md h-9 text-sm transition-colors duration-200 cursor-pointer";
    const styles = {
      PROBLEM: {
        selected: `bg-red-500 text-white border-red-500 hover:bg-red-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-red-100 hover:border-red-300`,
        disabled: `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60`,
      },
      SUGGESTION: {
        selected: `bg-green-500 text-white border-green-500 hover:bg-green-600`,
        unselected: `bg-white text-gray-700 border-gray-300 hover:bg-green-100 hover:border-green-300`,
        disabled: `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60`,
      },
    };
    const state = isSelected
      ? "selected"
      : isDisabled
      ? "disabled"
      : "unselected";
    return `${common} ${styles[caseTypeParam][state]}`;
  };

  const getSubmitButtonClass = (isMutationLoading: boolean): string => {
    if (!caseTypeParam) return "";
    const common =
      "text-white py-2 px-4 rounded-md cursor-pointer shadow-md font-medium transition-colors duration-200";
    const styles = {
      PROBLEM: `bg-red-600 hover:bg-red-700 active:bg-red-500`,
      SUGGESTION: `bg-green-600 hover:bg-green-700 active:bg-green-500`,
    };
    const disabledClass =
      isSubmittingForm || isMutationLoading || !fetchedCreatorId
        ? "opacity-50 cursor-not-allowed"
        : "";
    return `${common} ${styles[caseTypeParam]} ${disabledClass}`;
  };

  const helpModalContent = useMemo<React.ReactNode>(() => {
    if (!caseTypeParam)
      return <p>{t("caseSubmission.helpModal.invalidCaseType")}</p>;
    if (!Array.isArray(categoryList))
      return <p>{t("caseSubmission.helpModal.categoryProcessingError")}</p>;
    if (selectedCategories.length === 0)
      return <p>{t("caseSubmission.helpModal.selectCategoriesPrompt")}</p>;

    const relevantCategories = categoryList.filter((cat) =>
      selectedCategories.includes(cat.name)
    );
    if (relevantCategories.length === 0)
      return <p>{t("caseSubmission.helpModal.noInfoFound")}</p>;

    const descriptionKey =
      caseTypeParam === "PROBLEM" ? "problem" : "suggestion";

    return (
      <div className="space-y-3 text-sm max-h-60 overflow-y-auto pr-2">
        {relevantCategories.map((category) => {
          const description = category[descriptionKey as keyof FormCategory];
          return (
            <div key={category._id}>
              <strong className="font-semibold block mb-1">
                {category.name}:
              </strong>
              {description ? (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p className="text-gray-500 italic">
                  {t("caseSubmission.helpModal.noDescriptionAvailable")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [selectedCategories, categoryList, caseTypeParam, t]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    clearAllFormErrors();

    if (!caseTypeParam) {
      setSubmissionError(t("caseSubmission.errors.submission.invalidCaseType")); // Assuming this key exists or use top-level invalidType
      return;
    }
    if (!fetchedCreatorId) {
      setSubmissionError(t("caseSubmission.errors.submission.missingUsername"));
      return;
    }
    if (!content.trim()) {
      setSubmissionError(
        t("caseSubmission.errors.submission.missingDescription")
      );
      return;
    }
    if (selectedCategories.length === 0) {
      setSubmissionError(t("caseSubmission.errors.submission.missingCategory"));
      return;
    }

    setIsSubmittingForm(true);
    let attachmentInputs: CaseAttachmentInput[] = [];
    try {
      attachmentInputs = await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          file: await readFileAsBase64(file),
        }))
      );
    } catch (fileReadError) {
      console.error("Client: Error reading files to base64:", fileReadError);
      setSubmissionError(
        t("caseSubmission.errors.submission.fileProcessingError")
      );
      setIsSubmittingForm(false);
      return;
    }

    const categoryIds = findCategoryIdsByName(selectedCategories, categoryList);
    if (categoryIds.length !== selectedCategories.length) {
      setSubmissionError(
        t("caseSubmission.errors.submission.categoryProcessingError")
      );
      setIsSubmittingForm(false);
      return;
    }

    const input: CreateCaseMutationInput = {
      content: content.trim(),
      type: caseTypeParam,
      priority,
      categories: categoryIds,
      creator: fetchedCreatorId,
      attachments: attachmentInputs,
    };

    try {
      await executeCreateCase(input);
      alert(t("caseSubmission.submissionSuccessAlert"));
      setContent("");
      setPriority("LOW");
      setSelectedCategories([]);
      setAttachments([]);
      setUsernameInput("");
      setFetchedName("");
      setFetchedCreatorId(null);
      setSearchedUsername(null);
      setNotFoundUsername(null);
      navigate("/");
    } catch (err) {
      console.error("Submission error caught by form:", err);
      const errorMsg =
        createCaseErrorHook?.message ||
        (err instanceof Error
          ? err.message
          : t("caseSubmission.errors.submission.unexpectedError"));
      setSubmissionError(
        t("caseSubmission.errors.submission.generalSubmissionError", {
          message: errorMsg,
        })
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return {
    content,
    priority,
    selectedCategories,
    attachments,
    usernameInput,
    fetchedName,
    fetchedCreatorId,
    notFoundUsername,
    isUserLoading,
    userLookupError,
    submissionError,
    isSubmittingForm,
    setContent,
    setPriority,
    toggleCategory,
    setAttachments,
    handleUsernameChange,
    clearAllFormErrors,
    handleSubmit,
    getCategoryClass,
    getSubmitButtonClass,
    helpModalContent,
    t,
  };
};
