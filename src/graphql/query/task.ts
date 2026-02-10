import { gql } from "@apollo/client";

// --- Fragments ---

/**
 * Basic user fields for references in task-related entities.
 */
const userBasicFragment = gql`
  fragment UserBasicFragment on User {
    _id
    name
    username
    avatar
    expert_categories {
      _id
    }
    managed_categories {
      _id
    }
  }
`;

/**
 * A single Why question and answer pair in Five Why analysis.
 */
const whyStepFragment = gql`
  fragment WhyStepFragment on WhyStep {
    question
    answer
  }
`;

/**
 * Task activity with user reference.
 */
const taskActivityFragment = gql`
  fragment TaskActivityFragment on TaskActivity {
    _id
    type
    content
    attachments
    createdAt
    updatedAt
    createdBy {
      ...UserBasicFragment
    }
  }
  ${userBasicFragment}
`;

/**
 * Five Why analysis with steps and user reference.
 */
const fiveWhyFragment = gql`
  fragment FiveWhyFragment on FiveWhy {
    _id
    whys {
      ...WhyStepFragment
    }
    rootCause
    counterMeasures
    createdAt
    updatedAt
    creator {
      ...UserBasicFragment
    }
  }
  ${whyStepFragment}
  ${userBasicFragment}
`;

/**
 * Risk assessment with user reference.
 */
const riskAssessmentFragment = gql`
  fragment RiskAssessmentFragment on RiskAssessment {
    _id
    riskDescription
    probability
    impact
    riskLevel
    plan
    createdAt
    updatedAt
    creator {
      ...UserBasicFragment
    }
  }
  ${userBasicFragment}
`;

/**
 * Base task fields without nested activities/fiveWhys/riskAssessments.
 */
const taskFragment = gql`
  fragment TaskFragment on Task {
    _id
    taskNumber
    title
    description
    status
    priority
    dueDate
    attachments
    createdAt
    updatedAt
    completedAt
    assignee {
      ...UserBasicFragment
    }
    creator {
      ...UserBasicFragment
    }
    relatedCase {
      _id
      case_number
      content
      status
      priority
      type
      categories {
        _id
        name
        color
      }
    }
  }
  ${userBasicFragment}
`;

/**
 * Task with full nested details (activities, fiveWhys, riskAssessments).
 */
const taskDetailFragment = gql`
  fragment TaskDetailFragment on Task {
    ...TaskFragment
    activities {
      ...TaskActivityFragment
    }
    fiveWhys {
      ...FiveWhyFragment
    }
    riskAssessments {
      ...RiskAssessmentFragment
    }
  }
  ${taskFragment}
  ${taskActivityFragment}
  ${fiveWhyFragment}
  ${riskAssessmentFragment}
`;

// --- Queries ---

/**
 * Fetch a single task by its ID with full details.
 */
export const GET_TASK_BY_ID = gql`
  query GetTaskById($_id: ID!) {
    getTaskById(_id: $_id) {
      ...TaskDetailFragment
    }
  }
  ${taskDetailFragment}
`;

/**
 * Fetch a single task by its sequential task number with full details.
 */
export const GET_TASK_BY_NUMBER = gql`
  query GetTaskByNumber($taskNumber: Int!) {
    getTaskByNumber(taskNumber: $taskNumber) {
      ...TaskDetailFragment
    }
  }
  ${taskDetailFragment}
`;

/**
 * Fetch all tasks with optional filtering and pagination.
 */
export const GET_ALL_TASKS = gql`
  query GetAllTasks($input: TaskFiltersInput) {
    getAllTasks(input: $input) {
      tasks {
        ...TaskFragment
      }
      count
    }
  }
  ${taskFragment}
`;

/**
 * Fetch tasks assigned to or created by a specific user.
 */
export const GET_USER_TASKS = gql`
  query GetUserTasks($userId: ID!, $input: TaskFiltersInput) {
    getUserTasks(userId: $userId, input: $input) {
      tasks {
        ...TaskFragment
      }
      count
    }
  }
  ${taskFragment}
`;

/**
 * Fetch aggregated task analytics data (status/priority distribution, trends, avg completion).
 */
export const GET_TASK_ANALYTICS = gql`
  query GetTaskAnalytics {
    getTaskAnalytics {
      totalTasks
      statusDistribution {
        TODO
        IN_PROGRESS
        DONE
      }
      priorityDistribution {
        LOW
        MEDIUM
        HIGH
      }
      tasksByPeriod {
        period
        created
        completed
      }
      averageCompletionDays
    }
  }
`;
