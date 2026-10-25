import { Navigate, createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { Layout } from '../components/Layout/Layout';
import { ChatPage } from '../pages/ChatPage';
import { ChatsPage } from '../pages/ChatsPage';
import { ChunksPage } from '../pages/ChunksPage';
import { CustomersPage } from '../pages/CustomersPage';
import { DocumentPage } from '../pages/DocumentPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { EvalDatasetPage } from '../pages/EvalDatasetPage';
import { LoginPage } from '../pages/LoginPage';
import { OrderPage } from '../pages/OrderPage';
import { OrdersPage } from '../pages/OrdersPage';
import { OutboxPage } from '../pages/OutboxPage';
import { ProductPage } from '../pages/ProductPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/chats" replace /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/chats', element: <ChatsPage /> },
          { path: '/chats/:chatId', element: <ChatPage /> },
          { path: '/products', element: <ProductsPage /> },
          { path: '/products/:productId', element: <ProductPage /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:orderId', element: <OrderPage /> },
          { path: '/customers', element: <CustomersPage /> },
          { path: '/documents', element: <DocumentsPage /> },
          { path: '/documents/:documentId', element: <DocumentPage /> },
          { path: '/chunks', element: <ChunksPage /> },
          { path: '/outbox', element: <OutboxPage /> },
          { path: '/eval-dataset', element: <EvalDatasetPage /> },
          { path: '*', element: <p>Page not found.</p> },
        ],
      },
    ],
  },
]);
