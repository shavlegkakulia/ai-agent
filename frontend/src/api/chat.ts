import { api, authorizedFetch, getApiBaseUrl } from './client';
import { ApiRequestError, messageFromData } from './errors';
import type { AgentStreamEvent, ChatMessage, ChatSummary } from './types/chat';

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

export async function streamChatMessage(
  chatId: string,
  message: string,
  onEvent: (event: AgentStreamEvent) => void,
  signal?: AbortSignal,
) {
  const endpoint = `POST /chat/${chatId}/message`;
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/chat/${encodeURIComponent(chatId)}/message`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ message }),
      signal,
    },
  );

  if (!response.ok) {
    let raw = '';
    try {
      raw = await response.text();
    } catch {
      raw = response.statusText;
    }
    throw new ApiRequestError(
      messageFromData(raw) ?? response.statusText ?? 'Request failed',
      response.status,
      endpoint,
    );
  }

  if (!response.body) {
    throw new ApiRequestError(
      'The agent stream has no response body',
      response.status,
      endpoint,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const emit = (frame: string) => {
    const json = frame
      .split('\n')
      .find((line) => line.startsWith('data:'))
      ?.slice(5)
      .trim();
    if (!json) return null;
    const event = JSON.parse(json) as AgentStreamEvent;
    onEvent(event);
    return event;
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        if (emit(frame)?.type === 'done') return;
      }
    }

    if (buffer.trim() && emit(buffer)?.type === 'done') return;
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  throw new ApiRequestError(
    'The agent stream ended before a final response',
    response.status,
    endpoint,
  );
}
