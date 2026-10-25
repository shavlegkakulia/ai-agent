import { ChatList } from '../components/ChatList/ChatList';

export function ChatsPage() {
  return (
    <div className="page chats-index">
      <div className="page-header">
        <h1>Chats</h1>
      </div>
      <p className="hint">
        GET /chat lists chats for the signed-in user. New Chat calls POST /chat
        and opens that chat id.
      </p>
      <ChatList />
    </div>
  );
}
