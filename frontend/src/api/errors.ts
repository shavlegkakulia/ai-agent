import axios, { type AxiosError } from 'axios';

export type ApiErrorInfo = {
  status?: number;
  message: string;
  endpoint?: string;
};

function messageFromData(data: unknown): string | null {
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return null;
    try {
      return messageFromData(JSON.parse(trimmed) as unknown);
    } catch {
      return trimmed;
    }
  }

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message;
    if (Array.isArray(message)) {
      return message.map(String).join(', ');
    }
    if (typeof message === 'string' && message) {
      return message;
    }
  }

  return null;
}

export function toApiError(error: unknown): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const method = axiosError.config?.method?.toUpperCase();
    const url = axiosError.config?.url;
    return {
      status: axiosError.response?.status,
      message:
        messageFromData(axiosError.response?.data) ??
        axiosError.message ??
        'Request failed',
      endpoint: [method, url].filter(Boolean).join(' '),
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Unknown error' };
}
