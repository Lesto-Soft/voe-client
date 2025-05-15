export interface ICase {
  _id: string;
  content: string;
  date: string;
  type: string;
  attachments?: string[];
  priority: string;
  status: string;
  case_number: number;
  categories: ICategory[];
  creator: IUser;
  comments?: IComment[];
  answers?: IAnswer[];
  rating?: IRating[];
  readBy?: IUser[];
  history?: ICaseHistory[];
  last_update?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  problem?: string;
  suggestion?: string;
  experts?: string[];
  cases?: ICase[];
  archived?: boolean;
}

export interface IUser {
  _id: string;
  username: string;
  password?: string;
  name: string;
  email?: string;
  position?: string;
  role?: string;
  avatar?: string;
  inbox?: string[];
  cases?: ICase[];
  categories?: ICategory[];
  comments?: IComment[];
  answers?: IAnswer[];
}

export interface IRating {
  _id: string;
  user: IUser;
  case: ICase;
  rating: number;
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
  content?: string;
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
