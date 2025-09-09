// src/graphql/hooks/colorPalette.ts
import { useQuery, useMutation, ApolloError } from "@apollo/client";
import { IPaletteColor } from "../../db/interfaces";
import { GET_ALL_PALETTE_COLORS } from "../query/colorPalette";
import {
  ADD_PALETTE_COLOR,
  UPDATE_PALETTE_COLOR,
  REMOVE_PALETTE_COLOR,
} from "../mutation/colorPalette";

interface GetAllPaletteColorsData {
  getAllPaletteColors: IPaletteColor[];
}

export const useGetAllPaletteColors = () => {
  const { data, loading, error, refetch } = useQuery<GetAllPaletteColorsData>(
    GET_ALL_PALETTE_COLORS
  );
  return {
    paletteColors: data?.getAllPaletteColors || [],
    loading,
    error,
    refetch,
  };
};

export const useAddPaletteColor = () => {
  const [addPaletteColorMutation, { loading, error }] = useMutation(
    ADD_PALETTE_COLOR,
    {
      refetchQueries: [{ query: GET_ALL_PALETTE_COLORS }],
    }
  );

  const addColor = async (hexCode: string, label?: string) => {
    return addPaletteColorMutation({ variables: { hexCode, label } });
  };

  return { addColor, loading, error };
};

export const useUpdatePaletteColor = () => {
  const [updatePaletteColorMutation, { loading, error }] = useMutation(
    UPDATE_PALETTE_COLOR,
    {
      refetchQueries: [{ query: GET_ALL_PALETTE_COLORS }],
    }
  );

  const updateColor = async (id: string, hexCode?: string, label?: string) => {
    return updatePaletteColorMutation({ variables: { id, hexCode, label } });
  };

  return { updateColor, loading, error };
};

export const useRemovePaletteColor = () => {
  const [removePaletteColorMutation, { loading, error }] = useMutation(
    REMOVE_PALETTE_COLOR,
    {
      refetchQueries: [{ query: GET_ALL_PALETTE_COLORS }],
      awaitRefetchQueries: true,
    }
  );

  const removeColor = async (id: string) => {
    try {
      await removePaletteColorMutation({ variables: { id } });
    } catch (e) {
      // The backend throws a specific error if the color is in use.
      // We re-throw it to be caught in the component for user feedback.
      throw new Error((e as ApolloError).message);
    }
  };

  return { removeColor, loading, error };
};
