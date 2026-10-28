import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getChat, getChatMessages, streamChatMessage } from '../api/chat';
import { queryKeys } from '../api/queryKeys';
import type { AgentStreamEvent } from '../api/types/chat';
import { ApiError } from '../components/ApiError/ApiError';
import { ChatList } from '../components/ChatList/ChatList';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';

type LiveReply = {
  chatId: string;
  userText: string;
  agentText: string;
  streaming: boolean;
  error: unknown;
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function ChatPage() {
  const { chatId = '' } = useParams();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [liveReply, setLiveReply] = useState<LiveReply | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef(chatId);
  const abortRef = useRef<AbortController | null>(null);
  const pendingTokensRef = useRef('');
  const frameRef = useRef<number | null>(null);
  chatIdRef.current = chatId;

  const chatQuery = useQuery({
    queryKey: queryKeys.chat(chatId),
    queryFn: () => getChat(chatId),
    enabled: Boolean(chatId),
  });
  const messagesQuery = useQuery({
    queryKey: queryKeys.chatMessages(chatId),
    queryFn: () => getChatMessages(chatId),
    enabled: Boolean(chatId) && Boolean(chatQuery.data),
  });

  const takePendingTokens = () => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    const chunk = pendingTokensRef.current;
    pendingTokensRef.current = '';
    return chunk;
  };

  const flushPendingTokens = (replyChatId: string) => {
    const chunk = takePendingTokens();
    if (!chunk || chatIdRef.current !== replyChatId) return;
    setLiveReply((current) => {
      if (!current || current.chatId !== replyChatId) return current;
      return { ...current, agentText: current.agentText + chunk };
    });
  };

  useEffect(() => {
    setDraft('');
    setLiveReply(null);
    return () => {
      abortRef.current?.abort();
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      pendingTokensRef.current = '';
    };
  }, [chatId]);

  const messages = messagesQuery.data ?? [];
  const activeReply = liveReply?.chatId === chatId ? liveReply : null;
  const previous = messages.at(-2);
  const last = messages.at(-1);
  const agentAlreadyListed =
    activeReply != null &&
    last?.role === 'AGENT' &&
    last.message === activeReply.agentText &&
    previous?.role === 'USER' &&
    previous.message === activeReply.userText;
  const userAlreadyListed =
    agentAlreadyListed ||
    (last?.role === 'USER' && last.message === activeReply?.userText);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeReply?.agentText, activeReply?.userText]);

  const submit = () => {
    const message = draft;
    if (!message.trim() || activeReply?.streaming || !chatQuery.data) return;

    takePendingTokens();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const replyChatId = chatId;

    setDraft('');
    setLiveReply({
      chatId: replyChatId,
      userText: message,
      agentText: '',
      streaming: true,
      error: null,
    });

    const onEvent = (event: AgentStreamEvent) => {
      if (chatIdRef.current !== replyChatId) return;
      if (event.type === 'token') {
        pendingTokensRef.current += event.content;
        if (frameRef.current != null) return;
        frameRef.current = requestAnimationFrame(() => {
          const chunk = takePendingTokens();
          if (!chunk || chatIdRef.current !== replyChatId) return;
          setLiveReply((current) => {
            if (!current || current.chatId !== replyChatId) return current;
            return { ...current, agentText: current.agentText + chunk };
          });
        });
        return;
      }

      flushPendingTokens(replyChatId);
      setLiveReply((current) => {
        if (!current || current.chatId !== replyChatId) return current;
        return { ...current, agentText: event.content, streaming: false };
      });
    };

    void streamChatMessage(replyChatId, message, onEvent, controller.signal)
      .then(async () => {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.chatMessages(replyChatId),
        });
        if (chatIdRef.current !== replyChatId) return;
        setLiveReply((current) =>
          current?.chatId === replyChatId ? null : current,
        );
      })
      .catch(async (error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) {
          if (abortRef.current === controller) takePendingTokens();
          return;
        }
        flushPendingTokens(replyChatId);
        if (chatIdRef.current === replyChatId) {
          setLiveReply((current) =>
            current?.chatId === replyChatId
              ? { ...current, streaming: false, error }
              : current,
          );
          setDraft(message);
        }
        await queryClient.invalidateQueries({
          queryKey: queryKeys.chatMessages(replyChatId),
        });
      });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="chat-page">
      <ChatList />
      <section className="chat-thread">
        <header className="chat-thread-header">
          <div>
            <h1>Chat</h1>
            <div className="mono muted">{chatId}</div>
          </div>
        </header>

        <div className="messages">
          {chatQuery.isPending && <Loading />}
          <ApiError
            error={chatQuery.error}
            onRetry={() => chatQuery.refetch()}
          />
          {chatQuery.isSuccess && !chatQuery.data && <p>Chat not found.</p>}
          {chatQuery.data && messagesQuery.isPending && (
            <Loading label="Loading messages…" />
          )}
          <ApiError
            error={messagesQuery.error}
            onRetry={() => messagesQuery.refetch()}
          />
          {chatQuery.data &&
            messagesQuery.isSuccess &&
            messages.length === 0 &&
            !activeReply && (
              <p className="muted">No messages yet. Send one below.</p>
            )}
          {messages.map((message) => {
            const side = message.role === 'USER' ? 'user' : 'agent';
            return (
              <div key={message.id} className={`bubble-row ${side}`}>
                <div className={`bubble bubble-${side}`}>
                  <div className="bubble-role">{message.role}</div>
                  {message.message}
                </div>
              </div>
            );
          })}
          {activeReply && !userAlreadyListed && (
            <div className="bubble-row user">
              <div className="bubble bubble-user">
                <div className="bubble-role">USER</div>
                {activeReply.userText}
              </div>
            </div>
          )}
          {activeReply &&
            !agentAlreadyListed &&
            (activeReply.streaming || activeReply.agentText) && (
              <div className="bubble-row agent">
                <div className="bubble bubble-agent">
                  <div className="bubble-role">AGENT</div>
                  {activeReply.streaming && !activeReply.agentText ? (
                    <span className="muted">Thinking…</span>
                  ) : (
                    activeReply.agentText
                  )}
                </div>
              </div>
            )}
          <div ref={bottomRef} />
        </div>

        {chatQuery.data && (
          <form className="composer" onSubmit={onSubmit}>
            <ApiError error={activeReply?.error} />
            <div className="composer-row">
              <textarea
                rows={3}
                value={draft}
                placeholder="Message"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                disabled={Boolean(activeReply?.streaming)}
              />
              <button
                type="submit"
                disabled={Boolean(activeReply?.streaming) || !draft.trim()}
              >
                Send
              </button>
            </div>
            <p className="hint">Enter sends. Shift+Enter adds a new line.</p>
          </form>
        )}
        {messagesQuery.data && <RawJson data={messagesQuery.data} />}
      </section>
    </div>
  );
}
