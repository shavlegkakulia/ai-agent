export type ChatSummary = {
  id: string;
};

export type ChatMessageRole = 'USER' | 'AGENT';

export type ChatMessage = {
  id: string;
  message: string;
  role: ChatMessageRole;
};

export type CreateChatMessageRequest = {
  message: string;
};

export type CreateChatMessageResponse = {
  agentMessage?: string;
};
