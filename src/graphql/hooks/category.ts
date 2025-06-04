import { useQuery, useMutation } from "@apollo/client";
import { useEffect } from "react";
import {
  GET_ACTIVE_CATEGORIES,
  GET_ALL_LEAN_CATEGORIES,
  COUNT_CATEGORIES,
  COUNT_CATEGORIES_BY_EXACT_NAME,
  GET_CATEGORY_BY_NAME as GET_CATEGORY_BY_NAME,
} from "../query/category";
import { ICategory } from "../../db/interfaces";
import {
  CREATE_CATEGORY,
  CreateCategoryInput,
  UPDATE_CATEGORY,
  UpdateCategoryInput,
  DELETE_CATEGORY,
} from "../mutation/category";
import Category from "../../pages/Category";

export function buildCategoryQueryVariables(input: any) {
  // Destructure input with default values for pagination
  const {
    itemsPerPage, // Default items per page
    currentPage, // Default current page (0-indexed)
    name, // Filter by category name
    archived, // Filter by archived status (boolean)
    expertIds, // Filter by array of expert User IDs
    managerIds, // Filter by array of manager User IDs
  } = input || {}; // Ensure input is not null/undefined

  // Initialize the base variables object with pagination
  const variables: any = {
    // Using 'any' for flexibility, or define a specific type
    input: {
      itemsPerPage,
      currentPage,
    },
  };

  // Conditionally add filter fields to the variables.input object
  // Filter by category name
  if (typeof name === "string" && name.trim())
    variables.input.name = name.trim();

  // Filter by archived status
  // Only include 'archived' if it's explicitly a boolean (true or false)
  if (typeof archived === "boolean") variables.input.archived = archived;

  // Filter by expert IDs
  if (Array.isArray(expertIds) && expertIds.length > 0)
    variables.input.expertIds = expertIds;

  // Filter by manager IDs
  if (Array.isArray(managerIds) && managerIds.length > 0)
    variables.input.managerIds = managerIds;

  return variables;
}

export const useGetAllLeanCategories = (input: any) => {
  const variables = buildCategoryQueryVariables(input);

  const { loading, error, data, refetch } = useQuery<{
    getAllLeanCategories: ICategory[];
  }>(GET_ALL_LEAN_CATEGORIES, { variables });

  return {
    loading,
    error,
    categories: data?.getAllLeanCategories || [], // Ensure default empty array
    refetch,
  };
};

export const useCountCategories = (input: any) => {
  const variables = buildCategoryQueryVariables(input);

  const { loading, error, data, refetch } = useQuery(COUNT_CATEGORIES, {
    variables,
  });

  const count = data?.countCategories || 0;

  return {
    count,
    loading,
    error,
    refetch,
  };
};

// Hook to fetch active categories (can be extended with search later if needed)
export const useGetActiveCategories = () => {
  const { loading, error, data, refetch } = useQuery<{
    getLeanActiveCategories: ICategory[];
  }>(GET_ACTIVE_CATEGORIES);

  return {
    loading,
    error,
    categories: data?.getLeanActiveCategories || [], // Ensure default empty array
    refetch,
  };
};
export const useGetCategoryByName = (name: string | undefined) => {
  // console.log("[HOOK] Attempting to fetch category with input name:", name);
  const { loading, error, data } = useQuery<{ getCategoryByName: ICategory }>(
    GET_CATEGORY_BY_NAME,
    {
      variables: { name: name }, // <--- THE FIX: Key matches the GraphQL query variable name $_id
      skip: !name,
    }
  );

  // For debugging the hook's output
  useEffect(() => {
    if (!loading) {
      if (error) {
        console.error("[HOOK] Error:", JSON.stringify(error, null, 2)); // Stringify for more detail
      }
    }
  }, [loading, data, error]);

  return {
    loading,
    error,
    category: data?.getCategoryByName,
  };
};

// Category Mutations
export const useCreateCategory = () => {
  const [createCategoryMutation, { data, loading, error }] =
    useMutation(CREATE_CATEGORY);
  const createCategory = async (input: CreateCategoryInput) => {
    try {
      const response = await createCategoryMutation({ variables: { input } });
      return response.data?.createCategory;
    } catch (err) {
      console.error("Failed to create category:", err);
      throw err;
    }
  };

  return { createCategory, category: data?.createCategory, loading, error };
};

export const useUpdateCategory = () => {
  const [updateCategoryMutation, { data, loading, error }] =
    useMutation(UPDATE_CATEGORY);
  const updateCategory = async (id: string, input: UpdateCategoryInput) => {
    try {
      const response = await updateCategoryMutation({
        variables: { id, input },
      });
      return response.data?.updateCategory;
    } catch (err) {
      console.error("Failed to update category:", err);
      throw err;
    }
  };

  return {
    updateCategory,
    category: data?.updateCategory,
    loading,
    error,
  };
};

export const useDeleteCategory = () => {
  const [deleteCategoryMutation, { data, loading, error }] =
    useMutation(DELETE_CATEGORY);
  const deleteCategory = async (id: string) => {
    try {
      const response = await deleteCategoryMutation({ variables: { id } });
      return response.data?.deleteCategory;
    } catch (err) {
      console.error("Failed to delete category:", err);
      throw err;
    }
  };

  return {
    deleteCategory,
    category: data?.deleteCategory,
    loading,
    error,
  };
};

export const useCountCategoriesByName = () => {
  const { loading, error, data } = useQuery(COUNT_CATEGORIES_BY_EXACT_NAME);
  const count = data?.countCategoriesByExactName || 0;

  return {
    count,
    loading,
    error,
  };
};
