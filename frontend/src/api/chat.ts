import { api } from './client';
import type {
  ChatMessage,
  ChatSummary,
  CreateChatMessageResponse,
} from './types/chat';

export function getChats() {
  return api.get<ChatSummary[]>('/chat').then((response) => response.data);
}

export function createChat() {
  return api.post<ChatSummary>('/chat').then((response) => response.data);
}

export function getChat(chatId: string) {
  return api
    .get<ChatSummary | null>(`/chat/${encodeURIComponent(chatId)}`)
    .then((response) => response.data);
}

export function getChatMessages(chatId: string) {
  return api
    .get<ChatMessage[]>(`/chat/${encodeURIComponent(chatId)}/messages`)
    .then((response) => response.data);
}

export function sendChatMessage(chatId: string, message: string) {
  return api
    .post<CreateChatMessageResponse>(
      `/chat/${encodeURIComponent(chatId)}/message`,
      { message },
    )
    .then((response) => response.data);
}
