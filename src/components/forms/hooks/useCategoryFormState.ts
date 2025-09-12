// src/components/forms/hooks/useCategoryFormState.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { ICategory, IPaletteColor } from "../../../db/interfaces"; // Adjust path
import { arraysEqualUnordered } from "../../../utils/arrayUtils";

interface IUserLean {
  _id: string;
  name: string;
}

interface UseCreateCategoryFormStateProps {
  initialData: ICategory | null;
  onDirtyChange?: (isDirty: boolean) => void;
  paletteColors: IPaletteColor[];
  usedColors: { color: string; categoryName: string }[];
}

export function useCategoryFormState({
  initialData,
  onDirtyChange,
  paletteColors,
  usedColors,
}: UseCreateCategoryFormStateProps) {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [expertIds, setExpertIds] = useState<string[]>([]);
  const [managerIds, setManagerIds] = useState<string[]>([]);
  const [archived, setArchived] = useState<boolean>(false);
  const [color, setColor] = useState(""); // Initialize as empty

  const [nameError, setNameError] = useState<string | null>(null);

  const [initialName, setInitialName] = useState("");
  const [initialProblem, setInitialProblem] = useState("");
  const [initialSuggestion, setInitialSuggestion] = useState("");
  const [initialExpertIds, setInitialExpertIds] = useState<string[]>([]);
  const [initialManagerIds, setInitialManagerIds] = useState<string[]>([]);
  const [initialArchived, setInitialArchived] = useState<boolean>(false);
  const [initialColor, setInitialColor] = useState(""); // Initialize as empty

  const [initialExpertObjects, setInitialExpertObjects] = useState<IUserLean[]>(
    []
  );
  const [initialManagerObjects, setInitialManagerObjects] = useState<
    IUserLean[]
  >([]);

  useEffect(() => {
    if (initialData) {
      // --- EDIT MODE ---
      const fallbackColor =
        paletteColors && paletteColors.length > 0
          ? paletteColors[0].hexCode
          : "#CCCCCC";
      const K_experts = (
        (initialData.experts as IUserLean[] | undefined) || []
      ).filter((e) => e && e._id && e.name);
      const K_managers = (
        (initialData.managers as IUserLean[] | undefined) || []
      ).filter((m) => m && m._id && m.name);

      setName(initialData.name || "");
      setProblem(initialData.problem || "");
      setSuggestion(initialData.suggestion || "");
      setExpertIds(K_experts.map((e) => e._id));
      setManagerIds(K_managers.map((m) => m._id));
      setArchived(initialData.archived || false);
      setColor(initialData.color || fallbackColor);

      // Set initial values for dirty check
      setInitialName(initialData.name || "");
      setInitialProblem(initialData.problem || "");
      setInitialSuggestion(initialData.suggestion || "");
      setInitialExpertIds(K_experts.map((e) => e._id));
      setInitialManagerIds(K_managers.map((m) => m._id));
      setInitialArchived(initialData.archived || false);
      setInitialColor(initialData.color || fallbackColor);

      setInitialExpertObjects(K_experts);
      setInitialManagerObjects(K_managers);
    } else {
      // --- CREATE MODE ---

      const usedHexCodes = new Set(
        usedColors.map((c) => c.color.toUpperCase())
      );
      const firstAvailableColor = paletteColors.find(
        (p) => !usedHexCodes.has(p.hexCode.toUpperCase())
      );
      const defaultColor = firstAvailableColor
        ? firstAvailableColor.hexCode
        : "";

      setName("");
      setProblem("");
      setSuggestion("");
      setExpertIds([]);
      setManagerIds([]);
      setArchived(false);
      setColor(defaultColor); // Use the calculated default color

      // Reset initial values for dirty check
      setInitialName("");
      setInitialProblem("");
      setInitialSuggestion("");
      setInitialExpertIds([]);
      setInitialManagerIds([]);
      setInitialArchived(false);
      setInitialColor(defaultColor); // Use the same default for comparison

      setInitialExpertObjects([]);
      setInitialManagerObjects([]);
    }
    setNameError(null);
  }, [initialData, paletteColors, usedColors]); // Re-run effect if palette changes

  const isDirty = useMemo((): boolean => {
    // isDirty logic remains the same and will work correctly
    if (initialData) {
      return (
        name !== initialName ||
        problem !== initialProblem ||
        suggestion !== initialSuggestion ||
        !arraysEqualUnordered(expertIds, initialExpertIds) ||
        !arraysEqualUnordered(managerIds, initialManagerIds) ||
        archived !== initialArchived ||
        color !== initialColor
      );
    } else {
      return (
        name.trim() !== "" ||
        problem.trim() !== "" ||
        suggestion.trim() !== "" ||
        expertIds.length > 0 ||
        managerIds.length > 0 ||
        archived ||
        color !== initialColor
      );
    }
  }, [
    name,
    problem,
    suggestion,
    expertIds,
    managerIds,
    archived,
    color,
    initialName,
    initialProblem,
    initialSuggestion,
    initialExpertIds,
    initialManagerIds,
    initialArchived,
    initialColor,
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
  const handleColorChange = useCallback(
    (newColor: string) => setColor(newColor),
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
    color,
    setColor: handleColorChange,
    nameError,
    setNameError,
    initialData,
    isDirty,
    initialExpertObjects,
    initialManagerObjects,
  };
}
