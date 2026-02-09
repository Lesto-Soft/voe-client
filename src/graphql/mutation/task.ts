import { gql } from "@apollo/client";

// --- Task Mutations ---

export const CREATE_TASK = gql`
  mutation CreateTask($input: createTaskInput!) {
    createTask(input: $input) {
      _id
      taskNumber
      title
      description
      status
      priority
      dueDate
      attachments
      createdAt
      assignee {
        _id
        name
        username
      }
      creator {
        _id
        name
        username
      }
      relatedCase {
        _id
        case_number
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($_id: ID!, $input: updateTaskInput!) {
    updateTask(_id: $_id, input: $input) {
      _id
      taskNumber
      title
      description
      status
      priority
      dueDate
      updatedAt
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($_id: ID!) {
    deleteTask(_id: $_id) {
      _id
    }
  }
`;

export const CHANGE_TASK_STATUS = gql`
  mutation ChangeTaskStatus($_id: ID!, $status: TaskStatus!, $userId: ID!) {
    changeTaskStatus(_id: $_id, status: $status, userId: $userId) {
      _id
      status
      updatedAt
      completedAt
      activities {
        _id
        type
        content
        createdAt
        createdBy {
          _id
          name
          username
          avatar
        }
      }
    }
  }
`;

export const ASSIGN_TASK = gql`
  mutation AssignTask($taskId: ID!, $assigneeId: ID, $userId: ID!) {
    assignTask(taskId: $taskId, assigneeId: $assigneeId, userId: $userId) {
      _id
      assignee {
        _id
        name
        username
        avatar
      }
      updatedAt
      activities {
        _id
        type
        content
        createdAt
        createdBy {
          _id
          name
          username
          avatar
        }
      }
    }
  }
`;

// --- TaskActivity Mutations ---

export const CREATE_TASK_ACTIVITY = gql`
  mutation CreateTaskActivity($input: createTaskActivityInput!) {
    createTaskActivity(input: $input) {
      _id
      type
      content
      attachments
      createdAt
      updatedAt
      createdBy {
        _id
        name
        username
        avatar
      }
    }
  }
`;

export const UPDATE_TASK_ACTIVITY = gql`
  mutation UpdateTaskActivity($_id: ID!, $input: updateTaskActivityInput!) {
    updateTaskActivity(_id: $_id, input: $input) {
      _id
      content
      attachments
      updatedAt
    }
  }
`;

export const DELETE_TASK_ACTIVITY = gql`
  mutation DeleteTaskActivity($_id: ID!) {
    deleteTaskActivity(_id: $_id)
  }
`;

// --- FiveWhy Mutations ---

export const CREATE_FIVE_WHY = gql`
  mutation CreateFiveWhy($input: CreateFiveWhyInput!) {
    createFiveWhy(input: $input) {
      _id
      whys {
        question
        answer
      }
      rootCause
      counterMeasures
      createdAt
      updatedAt
      creator {
        _id
        name
        username
        avatar
      }
    }
  }
`;

export const UPDATE_FIVE_WHY = gql`
  mutation UpdateFiveWhy($_id: ID!, $input: UpdateFiveWhyInput!) {
    updateFiveWhy(_id: $_id, input: $input) {
      _id
      whys {
        question
        answer
      }
      rootCause
      counterMeasures
      updatedAt
    }
  }
`;

export const DELETE_FIVE_WHY = gql`
  mutation DeleteFiveWhy($_id: ID!) {
    deleteFiveWhy(_id: $_id)
  }
`;

// --- RiskAssessment Mutations ---

export const CREATE_RISK_ASSESSMENT = gql`
  mutation CreateRiskAssessment($input: CreateRiskAssessmentInput!) {
    createRiskAssessment(input: $input) {
      _id
      riskDescription
      probability
      impact
      riskLevel
      plan
      createdAt
      updatedAt
      creator {
        _id
        name
        username
        avatar
      }
    }
  }
`;

export const UPDATE_RISK_ASSESSMENT = gql`
  mutation UpdateRiskAssessment($_id: ID!, $input: UpdateRiskAssessmentInput!) {
    updateRiskAssessment(_id: $_id, input: $input) {
      _id
      riskDescription
      probability
      impact
      riskLevel
      plan
      updatedAt
    }
  }
`;

export const DELETE_RISK_ASSESSMENT = gql`
  mutation DeleteRiskAssessment($_id: ID!) {
    deleteRiskAssessment(_id: $_id)
  }
`;
