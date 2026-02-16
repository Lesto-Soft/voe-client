import { useMutation, useQuery } from "@apollo/client";
import {
  GET_TASK_BY_ID,
  GET_TASK_BY_NUMBER,
  GET_ALL_TASKS,
  GET_USER_TASKS,
  GET_TASK_ANALYTICS,
  GET_ANALYTICS_DATA_TASKS,
  GET_RANKED_TASK_USERS,
} from "../query/task";
import {
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  CHANGE_TASK_STATUS,
  ASSIGN_TASK,
  CREATE_TASK_ACTIVITY,
  UPDATE_TASK_ACTIVITY,
  DELETE_TASK_ACTIVITY,
  CREATE_FIVE_WHY,
  UPDATE_FIVE_WHY,
  DELETE_FIVE_WHY,
  CREATE_RISK_ASSESSMENT,
  UPDATE_RISK_ASSESSMENT,
  DELETE_RISK_ASSESSMENT,
  REVOKE_TASK_ACCESS,
} from "../mutation/task";
import {
  TaskStatus,
  TaskActivityType,
  CasePriority,
} from "../../db/interfaces";

// --- Input Types ---

export type DueDateFilter = "OVERDUE" | "CLOSE_TO_OVERDUE" | "ON_TIME" | "FINISHED_ON_TIME" | "NO_DUE_DATE";
export type CaseRelationFilter = "WITH_CASE" | "WITHOUT_CASE";

export interface TaskFiltersInput {
  status?: TaskStatus;
  statuses?: TaskStatus[];
  priority?: CasePriority;
  priorities?: CasePriority[];
  dueDateFilters?: DueDateFilter[];
  caseRelationFilter?: CaseRelationFilter;
  assigneeId?: string;
  creatorId?: string;
  caseId?: string;
  taskIds?: string[];
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  excludeAssigneeId?: string;
  excludeCreatorId?: string;
  viewableByUserId?: string;
  itemsPerPage?: number;
  currentPage?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: CasePriority;
  dueDate?: string;
  attachments?: File[];
  assignee?: string;
  creator: string;
  relatedCase?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: CasePriority;
  status?: TaskStatus;
  dueDate?: string;
  attachments?: File[];
  deletedAttachments?: string[];
}

export interface CreateTaskActivityInput {
  task: string;
  createdBy: string;
  type: TaskActivityType;
  content?: string;
  attachments?: File[];
}

export interface UpdateTaskActivityInput {
  content?: string;
  attachments?: File[];
  deletedAttachments?: string[];
}

export interface WhyStepInput {
  question: string;
  answer: string;
}

export interface CreateFiveWhyInput {
  task: string;
  creator: string;
  whys: WhyStepInput[];
  rootCause: string;
  counterMeasures: string;
}

export interface UpdateFiveWhyInput {
  whys?: WhyStepInput[];
  rootCause?: string;
  counterMeasures?: string;
}

export interface CreateRiskAssessmentInput {
  task: string;
  creator: string;
  riskDescription: string;
  probability: number;
  impact: number;
  plan: string;
}

export interface UpdateRiskAssessmentInput {
  riskDescription?: string;
  probability?: number;
  impact?: number;
  plan?: string;
}

// --- Helper Functions ---

/**
 * Builds query variables for task queries, conditionally including only defined filters.
 */
export function buildTaskQueryVariables(input?: TaskFiltersInput) {
  const {
    itemsPerPage = 10,
    currentPage = 0,
    status,
    statuses,
    priority,
    priorities,
    assigneeId,
    creatorId,
    caseId,
    taskIds,
    searchQuery,
    startDate,
    endDate,
    excludeAssigneeId,
    excludeCreatorId,
    viewableByUserId,
    dueDateFilters,
    caseRelationFilter,
  } = input || {};

  const variables: { input: Record<string, unknown> } = {
    input: {
      itemsPerPage,
      currentPage,
    },
  };

  if (statuses && statuses.length > 0) variables.input.statuses = statuses;
  else if (status) variables.input.status = status;
  if (priorities && priorities.length > 0) variables.input.priorities = priorities;
  else if (priority) variables.input.priority = priority;
  if (dueDateFilters && dueDateFilters.length > 0) variables.input.dueDateFilters = dueDateFilters;
  if (caseRelationFilter) variables.input.caseRelationFilter = caseRelationFilter;
  if (assigneeId) variables.input.assigneeId = assigneeId;
  if (creatorId) variables.input.creatorId = creatorId;
  if (caseId) variables.input.caseId = caseId;
  if (taskIds && taskIds.length > 0) variables.input.taskIds = taskIds;
  if (searchQuery) variables.input.searchQuery = searchQuery;
  if (startDate) variables.input.startDate = startDate;
  if (endDate) variables.input.endDate = endDate;
  if (excludeAssigneeId) variables.input.excludeAssigneeId = excludeAssigneeId;
  if (excludeCreatorId) variables.input.excludeCreatorId = excludeCreatorId;
  if (viewableByUserId) variables.input.viewableByUserId = viewableByUserId;

  return variables;
}

// --- useTask Hooks ---

/**
 * Fetches a single task by its ID with full details.
 * Skips the query if no taskId is provided.
 */
export const useGetTaskById = (taskId?: string) => {
  const { loading, error, data, refetch } = useQuery(GET_TASK_BY_ID, {
    variables: { _id: taskId },
    skip: !taskId,
  });

  const task = data?.getTaskById || null;

  return {
    task,
    loading,
    error,
    refetch,
  };
};

/**
 * Fetches a single task by its sequential task number with full details.
 * Skips the query if no taskNumber is provided or is invalid.
 */
export const useGetTaskByNumber = (taskNumber?: number) => {
  const { loading, error, data, refetch } = useQuery(GET_TASK_BY_NUMBER, {
    variables: { taskNumber },
    skip: !taskNumber || taskNumber <= 0,
  });

  const task = data?.getTaskByNumber || null;

  return {
    task,
    loading,
    error,
    refetch,
  };
};

/**
 * Fetches all tasks with optional filtering and pagination.
 */
export const useGetAllTasks = (input?: TaskFiltersInput) => {
  const variables = buildTaskQueryVariables(input);

  const { loading, error, data, refetch } = useQuery(GET_ALL_TASKS, {
    variables,
  });

  const tasks = data?.getAllTasks?.tasks || [];
  const count = data?.getAllTasks?.count || 0;

  return {
    tasks,
    count,
    loading,
    error,
    refetch,
  };
};

/**
 * Fetches tasks assigned to or created by a specific user.
 */
export const useGetUserTasks = (userId: string, input?: TaskFiltersInput) => {
  const variables = buildTaskQueryVariables(input);

  const { loading, error, data, refetch } = useQuery(GET_USER_TASKS, {
    variables: {
      userId,
      ...variables,
    },
    skip: !userId,
  });

  const tasks = data?.getUserTasks?.tasks || [];
  const count = data?.getUserTasks?.count || 0;

  return {
    tasks,
    count,
    loading,
    error,
    refetch,
  };
};

// --- Task Analytics Types ---

export interface TaskStatusDistribution {
  TODO: number;
  IN_PROGRESS: number;
  DONE: number;
}

export interface TaskPriorityDistribution {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
}

export interface TaskPeriodData {
  period: string;
  created: number;
  completed: number;
}

export interface TaskAnalytics {
  totalTasks: number;
  statusDistribution: TaskStatusDistribution;
  priorityDistribution: TaskPriorityDistribution;
  tasksByPeriod: TaskPeriodData[];
  averageCompletionDays: number | null;
}

/**
 * Fetches aggregated task analytics data.
 */
export const useGetTaskAnalytics = () => {
  const { loading, error, data, refetch } = useQuery(GET_TASK_ANALYTICS);

  const analytics: TaskAnalytics | null = data?.getTaskAnalytics || null;

  return {
    analytics,
    loading,
    error,
    refetch,
  };
};

// --- Task Analytics Data (Client-side Processing) ---

import { ITask } from "../../db/interfaces";

export enum TaskRankingType {
  TASK_CREATORS = "TASK_CREATORS",
  TASK_COMPLETERS = "TASK_COMPLETERS",
  TASK_COMMENTERS = "TASK_COMMENTERS",
  TASK_FASTEST_COMPLETERS = "TASK_FASTEST_COMPLETERS",
}

/**
 * Fetches all tasks with lightweight population for client-side analytics processing.
 */
export const useGetAnalyticsDataTasks = () => {
  const { loading, error, data } = useQuery<{
    getAnalyticsDataTasks: ITask[];
  }>(GET_ANALYTICS_DATA_TASKS);

  return {
    tasks: data?.getAnalyticsDataTasks || [],
    loading,
    error,
  };
};

/**
 * Fetches ranked users for task-related metrics.
 * Follows useGetRankedUsers pattern.
 */
export const useGetRankedTaskUsers = (
  startDate: Date | null,
  endDate: Date | null,
  type: TaskRankingType,
  isAllTime: boolean
) => {
  const { data, loading, error } = useQuery<{
    getRankedTaskUsers: { user: ITask["creator"]; count: number; stat?: number }[];
  }>(GET_RANKED_TASK_USERS, {
    variables: {
      input: {
        startDate: isAllTime ? null : startDate?.toISOString(),
        endDate: isAllTime ? null : endDate?.toISOString(),
        type,
      },
    },
    skip: !isAllTime && (!startDate || !endDate),
  });

  return {
    rankedUsers: data?.getRankedTaskUsers || [],
    loading,
    error,
  };
};

/**
 * Creates a new task and refetches the task list.
 */
export const useCreateTask = () => {
  const [createTaskMutation, { data, loading, error }] = useMutation(
    CREATE_TASK,
    {
      refetchQueries: [{ query: GET_ALL_TASKS }],
      awaitRefetchQueries: true,
    }
  );

  const createTask = async (input: CreateTaskInput) => {
    try {
      const response = await createTaskMutation({
        variables: { input },
      });
      return response.data.createTask;
    } catch (err) {
      console.error("Failed to create task:", err);
      throw err;
    }
  };

  return {
    createTask,
    data,
    loading,
    error,
  };
};

/**
 * Updates an existing task and refetches its details.
 */
export const useUpdateTask = (taskId?: string) => {
  const [updateTaskMutation, { data, loading, error }] = useMutation(
    UPDATE_TASK,
    {
      refetchQueries: taskId
        ? [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }]
        : [],
      awaitRefetchQueries: true,
    }
  );

  const updateTask = async (_id: string, input: UpdateTaskInput, userId: string) => {
    try {
      const response = await updateTaskMutation({
        variables: { _id, input, userId },
        refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id } }],
        awaitRefetchQueries: true,
      });
      return response.data.updateTask;
    } catch (err) {
      console.error("Failed to update task:", err);
      throw err;
    }
  };

  return {
    updateTask,
    data,
    loading,
    error,
  };
};

/**
 * Deletes a task with optional callback support.
 */
export const useDeleteTask = (
  options: { onCompleted?: () => void } = {}
) => {
  const [deleteTaskMutation, { data, loading, error }] = useMutation(
    DELETE_TASK,
    {
      onCompleted: options.onCompleted,
      refetchQueries: [{ query: GET_ALL_TASKS }],
      awaitRefetchQueries: true,
    }
  );

  const deleteTask = async (_id: string) => {
    try {
      const response = await deleteTaskMutation({
        variables: { _id },
      });
      return response.data.deleteTask;
    } catch (err) {
      console.error("Failed to delete task:", err);
      throw err;
    }
  };

  return {
    deleteTask,
    data,
    loading,
    error,
  };
};

/**
 * Changes the status of a task.
 * Creates an activity entry if the user is the task creator.
 */
export const useChangeTaskStatus = (taskId?: string) => {
  const [changeStatusMutation, { data, loading, error }] = useMutation(
    CHANGE_TASK_STATUS,
    {
      refetchQueries: taskId
        ? [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }]
        : [],
      awaitRefetchQueries: true,
    }
  );

  const changeTaskStatus = async (_id: string, status: TaskStatus, userId: string) => {
    try {
      const response = await changeStatusMutation({
        variables: { _id, status, userId },
        refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id } }],
        awaitRefetchQueries: true,
      });
      return response.data.changeTaskStatus;
    } catch (err) {
      console.error("Failed to change task status:", err);
      throw err;
    }
  };

  return {
    changeTaskStatus,
    data,
    loading,
    error,
  };
};

/**
 * Assigns or changes the assignee of a task.
 * Creates an ASSIGNEE_CHANGE activity entry.
 */
export const useAssignTask = (taskId?: string) => {
  const [assignTaskMutation, { data, loading, error }] = useMutation(
    ASSIGN_TASK,
    {
      refetchQueries: taskId
        ? [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }]
        : [],
      awaitRefetchQueries: true,
    }
  );

  const assignTask = async (taskIdParam: string, assigneeId?: string, userId?: string) => {
    try {
      const response = await assignTaskMutation({
        variables: { taskId: taskIdParam, assigneeId, userId },
        refetchQueries: [
          { query: GET_TASK_BY_ID, variables: { _id: taskIdParam } },
        ],
        awaitRefetchQueries: true,
      });
      return response.data.assignTask;
    } catch (err) {
      console.error("Failed to assign task:", err);
      throw err;
    }
  };

  return {
    assignTask,
    data,
    loading,
    error,
  };
};

/**
 * Revokes a user's access to view a task.
 */
export const useRevokeTaskAccess = (taskId: string) => {
  const [revokeAccessMutation, { loading, error }] = useMutation(
    REVOKE_TASK_ACCESS,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const revokeTaskAccess = async (userId: string) => {
    try {
      const response = await revokeAccessMutation({
        variables: { taskId, userId },
      });
      return response.data.revokeTaskAccess;
    } catch (err) {
      console.error("Failed to revoke task access:", err);
      throw err;
    }
  };

  return { revokeTaskAccess, loading, error };
};

// --- useTaskActivity Hooks ---

/**
 * Creates a new task activity and refetches the parent task.
 */
export const useCreateTaskActivity = (taskId: string) => {
  const [createActivityMutation, { data, loading, error }] = useMutation(
    CREATE_TASK_ACTIVITY,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const createTaskActivity = async (input: CreateTaskActivityInput) => {
    try {
      const response = await createActivityMutation({
        variables: { input },
      });
      return response.data.createTaskActivity;
    } catch (err) {
      console.error("Failed to create task activity:", err);
      throw err;
    }
  };

  return {
    createTaskActivity,
    data,
    loading,
    error,
  };
};

/**
 * Updates an existing task activity.
 */
export const useUpdateTaskActivity = (taskId: string) => {
  const [updateActivityMutation, { data, loading, error }] = useMutation(
    UPDATE_TASK_ACTIVITY,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const updateTaskActivity = async (
    activityId: string,
    input: UpdateTaskActivityInput
  ) => {
    try {
      const response = await updateActivityMutation({
        variables: { _id: activityId, input },
      });
      return response.data.updateTaskActivity;
    } catch (err) {
      console.error("Failed to update task activity:", err);
      throw err;
    }
  };

  return {
    updateTaskActivity,
    data,
    loading,
    error,
  };
};

/**
 * Deletes a task activity.
 */
export const useDeleteTaskActivity = (taskId: string) => {
  const [deleteActivityMutation, { data, loading, error }] = useMutation(
    DELETE_TASK_ACTIVITY,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const deleteTaskActivity = async (activityId: string) => {
    try {
      const response = await deleteActivityMutation({
        variables: { _id: activityId },
      });
      return response.data.deleteTaskActivity;
    } catch (err) {
      console.error("Failed to delete task activity:", err);
      throw err;
    }
  };

  return {
    deleteTaskActivity,
    data,
    loading,
    error,
  };
};

// --- useFiveWhy Hooks ---

/**
 * Creates a new Five Why analysis and refetches the parent task.
 */
export const useCreateFiveWhy = (taskId: string) => {
  const [createFiveWhyMutation, { data, loading, error }] = useMutation(
    CREATE_FIVE_WHY,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const createFiveWhy = async (input: CreateFiveWhyInput) => {
    try {
      const response = await createFiveWhyMutation({
        variables: { input },
      });
      return response.data.createFiveWhy;
    } catch (err) {
      console.error("Failed to create Five Why analysis:", err);
      throw err;
    }
  };

  return {
    createFiveWhy,
    data,
    loading,
    error,
  };
};

/**
 * Updates an existing Five Why analysis.
 */
export const useUpdateFiveWhy = (taskId: string) => {
  const [updateFiveWhyMutation, { data, loading, error }] = useMutation(
    UPDATE_FIVE_WHY,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const updateFiveWhy = async (
    fiveWhyId: string,
    input: UpdateFiveWhyInput
  ) => {
    try {
      const response = await updateFiveWhyMutation({
        variables: { _id: fiveWhyId, input },
      });
      return response.data.updateFiveWhy;
    } catch (err) {
      console.error("Failed to update Five Why analysis:", err);
      throw err;
    }
  };

  return {
    updateFiveWhy,
    data,
    loading,
    error,
  };
};

/**
 * Deletes a Five Why analysis.
 */
export const useDeleteFiveWhy = (taskId: string) => {
  const [deleteFiveWhyMutation, { data, loading, error }] = useMutation(
    DELETE_FIVE_WHY,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const deleteFiveWhy = async (fiveWhyId: string) => {
    try {
      const response = await deleteFiveWhyMutation({
        variables: { _id: fiveWhyId },
      });
      return response.data.deleteFiveWhy;
    } catch (err) {
      console.error("Failed to delete Five Why analysis:", err);
      throw err;
    }
  };

  return {
    deleteFiveWhy,
    data,
    loading,
    error,
  };
};

// --- useRiskAssessment Hooks ---

/**
 * Creates a new risk assessment and refetches the parent task.
 */
export const useCreateRiskAssessment = (taskId: string) => {
  const [createRiskMutation, { data, loading, error }] = useMutation(
    CREATE_RISK_ASSESSMENT,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const createRiskAssessment = async (input: CreateRiskAssessmentInput) => {
    try {
      const response = await createRiskMutation({
        variables: { input },
      });
      return response.data.createRiskAssessment;
    } catch (err) {
      console.error("Failed to create risk assessment:", err);
      throw err;
    }
  };

  return {
    createRiskAssessment,
    data,
    loading,
    error,
  };
};

/**
 * Updates an existing risk assessment.
 */
export const useUpdateRiskAssessment = (taskId: string) => {
  const [updateRiskMutation, { data, loading, error }] = useMutation(
    UPDATE_RISK_ASSESSMENT,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const updateRiskAssessment = async (
    riskId: string,
    input: UpdateRiskAssessmentInput
  ) => {
    try {
      const response = await updateRiskMutation({
        variables: { _id: riskId, input },
      });
      return response.data.updateRiskAssessment;
    } catch (err) {
      console.error("Failed to update risk assessment:", err);
      throw err;
    }
  };

  return {
    updateRiskAssessment,
    data,
    loading,
    error,
  };
};

/**
 * Deletes a risk assessment.
 */
export const useDeleteRiskAssessment = (taskId: string) => {
  const [deleteRiskMutation, { data, loading, error }] = useMutation(
    DELETE_RISK_ASSESSMENT,
    {
      refetchQueries: [{ query: GET_TASK_BY_ID, variables: { _id: taskId } }],
      awaitRefetchQueries: true,
    }
  );

  const deleteRiskAssessment = async (riskId: string) => {
    try {
      const response = await deleteRiskMutation({
        variables: { _id: riskId },
      });
      return response.data.deleteRiskAssessment;
    } catch (err) {
      console.error("Failed to delete risk assessment:", err);
      throw err;
    }
  };

  return {
    deleteRiskAssessment,
    data,
    loading,
    error,
  };
};
