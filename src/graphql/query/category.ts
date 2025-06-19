import { gql } from "@apollo/client";

const categoryFragment = `
fragment CategoryFragment on Category {
      _id
      name
      problem
      suggestion
      experts {
        _id
        name
        username
        expert_categories {
          _id
        }
      }
      managers {
        _id
        name
        username
        managed_categories {
          _id
        }
      }
      cases {
        _id
        status
      }
      archived
}`;

export const GET_ALL_LEAN_CATEGORIES = gql`
  query GetAllLeanCategories($input: getCategoryFiltersInput) {
    getAllLeanCategories(input: $input) {
      ...CategoryFragment
    }
  }
  ${categoryFragment}
`;

export const COUNT_CATEGORIES = gql`
  query CountCategories($input: getCategoryFiltersInput) {
    countCategories(input: $input)
  }
`;

export const COUNT_CATEGORIES_BY_EXACT_NAME = gql`
  query CountCategoriesByExactName($name: String!) {
    countCategoriesByExactName(name: $name)
  }
`;

export const GET_ACTIVE_CATEGORIES = gql`
  query GetAllActiveCategories {
    getLeanActiveCategories {
      _id
      name
      problem
      suggestion
      experts {
        _id
      }
      managers {
        _id
      }
    }
  }
`;

export const GET_CATEGORY_BY_NAME = gql`
  query GetCategoryByName($name: String!) {
    # This defines the variable for the operation
    getCategoryByName(name: $name) {
      # This calls the field on the Query type, using its argument named 'name',
      # and passes the operation variable $name to it.
      _id
      name
      problem
      suggestion
      experts {
        _id
        name
        username
        expert_categories {
          _id
        }
      }
      managers {
        _id
        name
        username
        managed_categories {
          _id
        }
      }
      cases {
        _id
        case_number
        content
        date
        priority
        status
        type
        creator {
          _id
          name
          avatar
          username
          expert_categories {
            _id
          }
          managed_categories {
            _id
          }
        }
        answers {
          _id
          date
          approved_date
          approved {
            _id
          }
          needs_finance
        }
        categories {
          _id
        }
      }
      archived
    }
  }
`;
