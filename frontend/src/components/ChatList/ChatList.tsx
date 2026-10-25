import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { createChat, getChats } from '../../api/chat';
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
      {chatsQuery.isPending && <Loading />}
      <ApiError error={chatsQuery.error} onRetry={() => chatsQuery.refetch()} />
      {chatsQuery.data && chatsQuery.data.length === 0 && (
        <p className="muted">No chats yet.</p>
      )}
      <ul className="chat-links">
        {chatsQuery.data?.map((chat) => (
          <li key={chat.id}>
            <button
              type="button"
              className={chat.id === chatId ? 'chat-link active' : 'chat-link'}
              onClick={() => navigate(`/chats/${chat.id}`)}
            >
              <span className="mono">{chat.id}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
