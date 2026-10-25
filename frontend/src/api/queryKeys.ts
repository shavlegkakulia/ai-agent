export const queryKeys = {
  profile: ['profile'] as const,
  chats: ['chats'] as const,
  chat: (chatId: string) => ['chat', chatId] as const,
  chatMessages: (chatId: string) => ['chat-messages', chatId] as const,
  products: ['products'] as const,
  product: (productId: string) => ['product', productId] as const,
  orders: ['orders'] as const,
  ordersByProduct: (productId: string) =>
    ['orders', 'by-product', productId] as const,
  order: (orderId: string) => ['order', orderId] as const,
  customers: ['customers'] as const,
  documents: ['documents'] as const,
  document: (documentId: string) => ['document', documentId] as const,
  chunks: ['chunks'] as const,
  chunksByDocument: (documentId: string) => ['chunks', documentId] as const,
  outbox: ['outbox'] as const,
  outboxByDocument: (documentId: string) => ['outbox', documentId] as const,
};
