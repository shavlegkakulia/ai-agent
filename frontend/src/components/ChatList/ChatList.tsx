import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { createChat, deleteChat, getChats } from '../../api/chat';
import { queryKeys } from '../../api/queryKeys';
import { ApiError } from '../ApiError/ApiError';
import { Loading } from '../Loading/Loading';

export function ChatList() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const chatsQuery = useQuery({
    queryKey: queryKeys.chats,
    queryFn: getChats,
  });
  const createMutation = useMutation({
    mutationFn: createChat,
    onSuccess: async (chat) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      navigate(`/chats/${chat.id}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: async (_chat, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.chat(deletedId) });
      queryClient.removeQueries({
        queryKey: queryKeys.chatMessages(deletedId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.chats });
      if (chatId === deletedId) navigate('/chats');
    },
  });

  const onDelete = (id: string) => {
    if (!window.confirm('Delete this chat?')) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Chats</h2>
        <button
          type="button"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating…' : 'New Chat'}
        </button>
      </div>
      <ApiError error={createMutation.error} />
      <ApiError error={deleteMutation.error} />
      {chatsQuery.isPending && <Loading />}
      <ApiError error={chatsQuery.error} onRetry={() => chatsQuery.refetch()} />
      {chatsQuery.data && chatsQuery.data.length === 0 && (
        <p className="muted">No chats yet.</p>
      )}
      <ul className="chat-links">
        {chatsQuery.data?.map((chat) => (
          <li key={chat.id} className="chat-row">
            <button
              type="button"
              className={chat.id === chatId ? 'chat-link active' : 'chat-link'}
              onClick={() => navigate(`/chats/${chat.id}`)}
            >
              <span className="mono">{chat.id}</span>
            </button>
            <button
              type="button"
              className="secondary chat-delete"
              aria-label="Delete chat"
              title="Delete chat"
              disabled={deleteMutation.isPending}
              onClick={() => onDelete(chat.id)}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM6 9h2v9H6V9z"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
