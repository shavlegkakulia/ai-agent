import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getChat, getChatMessages, sendChatMessage } from '../api/chat';
import { queryKeys } from '../api/queryKeys';
import { ApiError } from '../components/ApiError/ApiError';
import { ChatList } from '../components/ChatList/ChatList';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';

export function ChatPage() {
  const { chatId = '' } = useParams();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [pendingText, setPendingText] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef(chatId);
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
  const sendMutation = useMutation({
    mutationFn: (input: { chatId: string; message: string }) =>
      sendChatMessage(input.chatId, input.message),
    onMutate: (input) => {
      setPendingText(input.message);
      setDraft('');
    },
    onSuccess: async (_data, input) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chatMessages(input.chatId),
      });
      if (chatIdRef.current === input.chatId) {
        setPendingText(null);
      }
    },
    onError: (_error, input) => {
      if (chatIdRef.current !== input.chatId) return;
      setPendingText(null);
      setDraft(input.message);
    },
  });

  useEffect(() => {
    setDraft('');
    setPendingText(null);
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesQuery.data, pendingText, sendMutation.isPending]);

  const submit = () => {
    if (!draft.trim() || sendMutation.isPending || !chatQuery.data) return;
    sendMutation.mutate({ chatId, message: draft });
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

  const messages = messagesQuery.data ?? [];

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
          <ApiError error={chatQuery.error} onRetry={() => chatQuery.refetch()} />
          {chatQuery.isSuccess && !chatQuery.data && <p>Chat not found.</p>}
          {chatQuery.data && messagesQuery.isPending && <Loading label="Loading messages…" />}
          <ApiError
            error={messagesQuery.error}
            onRetry={() => messagesQuery.refetch()}
          />
          {chatQuery.data && messagesQuery.isSuccess && messages.length === 0 && !pendingText && (
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
          {pendingText && (
            <div className="bubble-row user">
              <div className="bubble bubble-user">
                <div className="bubble-role">USER</div>
                {pendingText}
              </div>
            </div>
          )}
          {sendMutation.isPending && (
            <div className="bubble-row agent">
              <div className="bubble bubble-agent">Agent is responding…</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {chatQuery.data && (
          <form className="composer" onSubmit={onSubmit}>
            <ApiError error={sendMutation.error} />
            <div className="composer-row">
              <textarea
                rows={3}
                value={draft}
                placeholder="Message"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                disabled={sendMutation.isPending}
              />
              <button type="submit" disabled={sendMutation.isPending || !draft.trim()}>
                {sendMutation.isPending ? 'Sending…' : 'Send'}
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
