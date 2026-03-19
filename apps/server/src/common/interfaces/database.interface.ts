import { MessageRole } from "../enums/message-role.enum";

export interface Session {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}
