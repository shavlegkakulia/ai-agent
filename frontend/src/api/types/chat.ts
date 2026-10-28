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

export type AgentStreamEvent =
  | {
      type: 'token';
      content: string;
    }
  | {
      type: 'done';
      content: string;
      chunkIds: string[];
      relevantContext: string;
    };
