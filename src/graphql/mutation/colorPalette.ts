// src/graphql/mutation/colorPalette.ts
import { gql } from "@apollo/client";

export const ADD_PALETTE_COLOR = gql`
  mutation AddPaletteColor($hexCode: String!, $label: String) {
    addPaletteColor(hexCode: $hexCode, label: $label) {
      _id
      hexCode
      label
    }
  }
`;

export const UPDATE_PALETTE_COLOR = gql`
  mutation UpdatePaletteColor($id: ID!, $hexCode: String, $label: String) {
    updatePaletteColor(id: $id, hexCode: $hexCode, label: $label) {
      _id
      hexCode
      label
    }
  }
`;

export const REMOVE_PALETTE_COLOR = gql`
  mutation RemovePaletteColor($id: ID!) {
    removePaletteColor(id: $id)
  }
`;
