// src/components/forms/hooks/useCreateCategoryFormState.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { ICategory, IUser } from "../../../db/interfaces"; // Adjust path
import { arraysEqualUnordered } from "../../../utils/arrayUtils";

interface IUserLean {
  // Define a lean user type based on what ICategory provides
  _id: string;
  name: string;
}
interface UseCreateCategoryFormStateProps {
  initialData: ICategory | null;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function useCategoryFormState({
  initialData,
  onDirtyChange,
}: UseCreateCategoryFormStateProps) {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [expertIds, setExpertIds] = useState<string[]>([]);
  const [managerIds, setManagerIds] = useState<string[]>([]);
  const [archived, setArchived] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string | null>(null);

  // Store initial values for dirty checking
  const [initialName, setInitialName] = useState("");
  const [initialProblem, setInitialProblem] = useState("");
  const [initialSuggestion, setInitialSuggestion] = useState("");
  const [initialExpertIds, setInitialExpertIds] = useState<string[]>([]);
  const [initialManagerIds, setInitialManagerIds] = useState<string[]>([]);
  const [initialArchived, setInitialArchived] = useState<boolean>(false);

  // Store initial expert/manager objects with names for display
  const [initialExpertObjects, setInitialExpertObjects] = useState<IUserLean[]>(
    []
  );
  const [initialManagerObjects, setInitialManagerObjects] = useState<
    IUserLean[]
  >([]);

  useEffect(() => {
    if (initialData) {
      const K_experts = (
        (initialData.experts as IUserLean[] | undefined) || []
      ).filter((e) => e && e._id && e.name); // Ensure experts are well-formed
      const K_managers = (
        (initialData.managers as IUserLean[] | undefined) || []
      ).filter((m) => m && m._id && m.name); // Ensure managers are well-formed

      setName(initialData.name || "");
      setProblem(initialData.problem || "");
      setSuggestion(initialData.suggestion || "");
      setExpertIds(K_experts.map((e) => e._id));
      setManagerIds(K_managers.map((m) => m._id));
      setArchived(initialData.archived || false);

      // Set initial values for dirty check
      setInitialName(initialData.name || "");
      setInitialProblem(initialData.problem || "");
      setInitialSuggestion(initialData.suggestion || "");
      setInitialExpertIds(K_experts.map((e) => e._id));
      setInitialManagerIds(K_managers.map((m) => m._id));
      setInitialArchived(initialData.archived || false);

      setInitialExpertObjects(K_experts);
      setInitialManagerObjects(K_managers);
    } else {
      // Reset form for create mode
      setName("");
      setProblem("");
      setSuggestion("");
      setExpertIds([]);
      setManagerIds([]);
      setArchived(false);
      // Reset initial values
      setInitialName("");
      setInitialProblem("");
      setInitialSuggestion("");
      setInitialExpertIds([]);
      setInitialManagerIds([]);
      setInitialArchived(false);
      setInitialExpertObjects([]);
      setInitialManagerObjects([]);
    }
    setNameError(null); // Reset errors
  }, [initialData]);

  const isDirty = useMemo((): boolean => {
    if (initialData) {
      // Edit mode: compare with initial values
      return (
        name !== initialName ||
        problem !== initialProblem ||
        suggestion !== initialSuggestion ||
        !arraysEqualUnordered(expertIds, initialExpertIds) ||
        !arraysEqualUnordered(managerIds, initialManagerIds) ||
        archived !== initialArchived
      );
    } else {
      // Create mode: dirty if any field has a value (name is primary)
      return (
        name.trim() !== "" ||
        problem.trim() !== "" ||
        suggestion.trim() !== "" ||
        expertIds.length > 0 ||
        managerIds.length > 0 ||
        archived // if true, it's a change from default false
      );
    }
  }, [
    name,
    problem,
    suggestion,
    expertIds,
    managerIds,
    archived,
    initialName,
    initialProblem,
    initialSuggestion,
    initialExpertIds,
    initialManagerIds,
    initialArchived,
    initialData,
  ]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (value.trim()) setNameError(null);
  }, []);

  const handleProblemChange = useCallback(
    (value: string) => setProblem(value),
    []
  );
  const handleSuggestionChange = useCallback(
    (value: string) => setSuggestion(value),
    []
  );
  const handleExpertIdsChange = useCallback(
    (ids: string[]) => setExpertIds(ids),
    []
  );
  const handleManagerIdsChange = useCallback(
    (ids: string[]) => setManagerIds(ids),
    []
  );
  const handleArchivedChange = useCallback(
    (isChecked: boolean) => setArchived(isChecked),
    []
  );

  return {
    name,
    setName: handleNameChange,
    problem,
    setProblem: handleProblemChange,
    suggestion,
    setSuggestion: handleSuggestionChange,
    expertIds,
    setExpertIds: handleExpertIdsChange,
    managerIds,
    setManagerIds: handleManagerIdsChange,
    archived,
    setArchived: handleArchivedChange,
    nameError,
    setNameError,
    initialData, // Keep exposing for potential other logic in form
    isDirty, // Expose dirty state
    initialExpertObjects, // For CategoryInputFields
    initialManagerObjects, // For CategoryInputFields
  };
}
