export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum LangChainMessageType {
  HUMAN = "human",
  AI = "ai",
}

export const ROLE_TO_LANGCHAIN: Record<MessageRole, LangChainMessageType> = {
  [MessageRole.USER]: LangChainMessageType.HUMAN,
  [MessageRole.ASSISTANT]: LangChainMessageType.AI,
  [MessageRole.SYSTEM]: LangChainMessageType.HUMAN,
};
