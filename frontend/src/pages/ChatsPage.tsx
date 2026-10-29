import { ChatList } from '../components/ChatList/ChatList';
import { PageHeader } from '../components/ui/PageHeader';

export function ChatsPage() {
  return (
    <div className="page chats-index">
      <PageHeader
        title="Chats"
        hint="GET /chat lists chats for the signed-in user. New Chat calls POST /chat and opens that chat id."
      />
      <ChatList />
    </div>
  );
}
