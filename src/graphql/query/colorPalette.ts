// src/graphql/query/colorPalette.ts
import { gql } from "@apollo/client";

export const GET_ALL_PALETTE_COLORS = gql`
  query GetAllPaletteColors {
    getAllPaletteColors {
      _id
      hexCode
      label
    }
  }
`;
