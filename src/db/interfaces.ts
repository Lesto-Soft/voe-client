export interface ICase {
  _id: string;
  content: string;
  date: string;
  type: CaseType;
  attachments?: string[];
  priority: CasePriority;
  status: ICaseStatus | string;
  case_number: number;
  categories: ICategory[];
  creator: IUser;
  comments?: IComment[];
  answers?: IAnswer[];
  metricScores?: IMetricScore[];
  calculatedRating?: number | null;
  readBy?: IReadBy[]; // MODIFIED
  history?: ICaseHistory[];
  tasks?: ITask[];
  last_update?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  color?: string;
  problem?: string;
  suggestion?: string;
  cases?: ICase[];
  experts?: IUser[] | [];
  managers?: IUser[] | [];
  archived?: boolean;
}

export interface IPaletteColor {
  _id: string;
  hexCode: string;
  label?: string;
}

export interface IUser {
  _id: string;
  username: string;
  password?: string;
  name: string;
  email?: string;
  position?: string;
  role?: IRole;
  avatar?: string;
  inbox?: string[];
  cases?: ICase[];
  expert_categories?: ICategory[];
  managed_categories?: ICategory[];
  comments?: IComment[];
  answers?: IAnswer[];
  approvedAnswers?: IAnswer[];
  financialApprovedAnswers?: IAnswer[];
  metricScores?: IMetricScore[];
  financial_approver?: boolean;
  last_login?: Date;
  assignedTasks?: ITask[];
  createdTasks?: ITask[];
  createdTaskActivities?: ITaskActivity[];
  accessibleTasks?: ITask[];
}

/**
 * Represents a single score given by a user for a specific metric on a case.
 * This corresponds to the MetricScore type in GraphQL.
 */
export interface IMetricScore {
  _id: string;
  user: IUser; // Can be a lean version if needed, e.g., { _id, name }
  case: ICase; // Can be a lean version
  metric: IRatingMetric;
  score: number;
  date: string;
}
/**
 * Defines the structure of a rating metric (e.g., "Съответствие").
 * This corresponds to the RatingMetric type in GraphQL.
 */
export interface IRatingMetric {
  _id: string;
  name: string;
  description: string;
  archived: boolean;
  order: number;
  totalScores?: number;
  averageScore?: number;
}

export interface IRole {
  _id: string;
  name: string;
  description: string;
  users: IUser[];
}

export interface IComment {
  _id: string;
  date: string;
  content: string;
  case?: ICase;
  creator: IUser;
  answer?: IAnswer;
  attachments?: string[];
}

export interface IAnswer {
  _id: string;
  date: string;
  content?: string;
  attachments?: string[];
  case: ICase;
  creator: IUser;
  comments?: IComment[];
  approved?: IUser;
  approved_date?: string;
  financial_approved?: IUser;
  financial_approved_date?: string;
  needs_finance?: boolean;
  history?: IAnswerHistory[];
  case_number?: number;
}

export interface IAnswerHistory {
  _id: string;
  user: IUser;
  old_content?: string;
  new_content?: string;
  date_change: string;
}

export interface ICaseHistory {
  _id: string;
  user: IUser;
  date_change: string;
  old_content?: string;
  new_content?: string;
  old_priority?: string;
  new_priority?: string;
  old_type?: string;
  new_type?: string;
  old_categories: ICategory[];
  new_categories: ICategory[];
}

export interface IReadBy {
  _id: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  date: string;
}
export interface INotification {
  _id: string;
  content: string;
  read: boolean;
  date: string;
  userId: string;
  caseId: string;
  caseNumber?: number;
  username?: string;
  new_categories?: string[];
  entityId?: string;
}

export enum ICaseStatus {
  Open = "OPEN",
  InProgress = "IN_PROGRESS",
  AwaitingFinance = "AWAITING_FINANCE",
  Closed = "CLOSED",
}

export const CASE_STATUS_DISPLAY_ORDER: ICaseStatus[] = [
  ICaseStatus.Open,
  ICaseStatus.InProgress,
  ICaseStatus.AwaitingFinance,
  ICaseStatus.Closed,
];

export interface IMe {
  _id: string;
  username: string;
  name: string;
  email?: string;
  position?: string;
  role: IRole;
  avatar?: string;
  cases?: ICase[];
  expert_categories?: ICategory[];
  managed_categories: ICategory[];
  comments?: IComment[];
  answers?: IAnswer[];
  financial_approver?: boolean;
}

export interface IMe extends Omit<IUser, "role"> {
  role: IRole; // Ensure role is not optional for the logged-in user
  managed_categories: ICategory[]; // Ensure this is not optional
}

export enum CaseType {
  Problem = "PROBLEM",
  Suggestion = "SUGGESTION",
}
export enum CasePriority {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

// Task-related enums
export enum TaskStatus {
  Todo = "TODO",
  InProgress = "IN_PROGRESS",
  Done = "DONE",
}

export enum TaskActivityType {
  Comment = "COMMENT",
  StatusChange = "STATUS_CHANGE",
  PriorityChange = "PRIORITY_CHANGE",
  AssigneeChange = "ASSIGNEE_CHANGE",
  HelpRequest = "HELP_REQUEST",
  ApprovalRequest = "APPROVAL_REQUEST",
  AnalysisSubmitted = "ANALYSIS_SUBMITTED",
}

// Task-related interfaces
export interface IWhyStep {
  question: string;
  answer: string;
}

export interface ITask {
  _id: string;
  taskNumber: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: CasePriority;
  dueDate?: string;
  attachments?: string[];
  assignee?: IUser;
  creator: IUser;
  relatedCase?: ICase;
  activities?: ITaskActivity[];
  fiveWhys?: IFiveWhy[];
  riskAssessments?: IRiskAssessment[];
  canAccessUsers?: IUser[];
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface ITaskActivity {
  _id: string;
  task: ITask;
  createdBy: IUser;
  type: TaskActivityType;
  content?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IFiveWhy {
  _id: string;
  task: ITask;
  whys: IWhyStep[];
  rootCause: string;
  counterMeasures: string;
  creator: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface IRiskAssessment {
  _id: string;
  task: ITask;
  riskDescription: string;
  probability: number;
  impact: number;
  riskLevel: number;
  plan: string;
  creator: IUser;
  createdAt: string;
  updatedAt?: string;
}

export interface ITasksAndCount {
  tasks: ITask[];
  count: number;
}
