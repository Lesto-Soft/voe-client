import { gql } from "@apollo/client";

const caseFragment = `
fragment CaseFragment on Case {
      _id
    case_number
    creator {
      _id
      name
      position
      
    }
    priority
    type
    categories {
        _id
        name     
    }
    content
    status  
    date
    attachments 
}`;

const caseHistoryFragment = `
fragment CaseHistoryFragment on CaseHistory { 
      _id
      date_change
      user {
        name
        _id
      }
      old_type
      new_type
      old_priority
      new_priority
      old_content
      new_content
      new_categories {
        name
      }
      old_categories {
        name
      }  
}`;

const answerFragment = `
fragment AnswerFragment on Answer {
      _id
      content
      date
      attachments
      creator {
        _id
        name
        position
      }
      approved{
        _id
        name  
      }
      approved_date
      financial_approved{
        _id
        name  
      }
      financial_approved_date
      needs_finance
      history {
        _id
        new_content
        old_content
        date_change
      }
        
}`;

const commentFragment = ` 
 fragment CommentFragment on Comment {
        _id
        creator {
          name
          position
          _id
        }
        content
        date
        attachments 
  }`;

export const GET_CASES = gql`
  query GET_CASES($input: getAllInput) {
    getAllCases(input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_CASE_BY_CASE_NUMBER = gql`
  query GET_CASE_BY_CASE_NUMBER($caseNumber: Int!, $roleId: String) {
    getCaseByNumber(case_number: $caseNumber, roleId: $roleId) {
      ...CaseFragment
      rating {
        _id
        score
        user {
          _id
          name
        }
      }
      comments {
        ...CommentFragment
      }
      history {
        ...CaseHistoryFragment
      }
      answers {
        ...AnswerFragment
        comments {
          ...CommentFragment
        }
      }
    }
  }
  ${caseFragment}
  ${caseHistoryFragment}
  ${answerFragment}
  ${commentFragment}
`;

export const GET_CASES_BY_USER_CATEGORIES = gql`
  query GET_CASES_BY_USER_CATEGORIES($userId: ID!, $input: getAllInput) {
    getCasesByUserCategories(userId: $userId, input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_USER_CASES = gql`
  query GET_USER_CASES($userId: ID!, $input: getAllInput) {
    getUserCases(userId: $userId, input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_USER_ANSWERED_CASES = gql`
  query GET_USER_ANSWERED_CASES($userId: ID!, $input: getAllInput) {
    getUserAnsweredCases(userId: $userId, input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const GET_USER_COMMENTED_CASES = gql`
  query GET_USER_COMMENTED_CASES($userId: ID!, $input: getAllInput) {
    getUserCommentedCases(userId: $userId, input: $input) {
      cases {
        ...CaseFragment
      }
      count
    }
  }
  ${caseFragment}
`;

export const COUNT_CASES = gql`
  query COUNT_CASES {
    countCases
  }
`;

export const COUNT_FILTERED_CASES = gql`
  query CountFilteredCases($input: getAllInput) {
    countFilteredCases(input: $input)
  }
`;

export const UPDATE_CASE = gql`
  mutation UpdateCase($caseId: ID!, $userId: ID!, $input: updateCaseInput!) {
    updateCase(caseId: $caseId, userId: $userId, input: $input) {
      _id
    }
  }
`;
