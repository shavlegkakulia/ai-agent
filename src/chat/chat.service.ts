import { Injectable } from '@nestjs/common';
import { ChatMessageRole, PrismaClient } from '../generated/prisma/client';
import { AgentService } from '../ai/service/agent.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly agentService: AgentService,
  ) {}
  async createChat(userId: string) {
    return await this.prisma.chat.create({
      data: {
        userId,
      },
      select: {
        id: true,
      },
    });
  }

  async getAllChats(userId: string) {
    return await this.prisma.chat.findMany({
      where: { userId },
      select: {
        id: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getChat(chatId: string, userId: string) {
    return await this.prisma.chat.findUnique({
      where: { id: chatId, userId },
      select: {
        id: true,
      },
    });
  }

  async deleteChat(chatId: string, userId: string) {
    return this.prisma.chat.delete({
      where: {
        id: chatId,
        userId,
      },
      select: {
        id: true,
      },
    });
  }

  async getChatMessages(chatId: string, userId: string) {
    return await this.prisma.chatMessage.findMany({
      where: { chatId, chat: { userId } },
      select: {
        id: true,
        message: true,
        role: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async *createChatMessageStream(
    chatId: string,
    message: string,
    role: ChatMessageRole,
    userId: string,
  ) {
    await this.prisma.chatMessage.create({
      data: {
        chatId,
        message,
        role,
      },
    });

    for await (const event of this.agentService.streamMessage(
      message,
      chatId,
      userId,
    )) {
      if (event.type === 'done') {
        await this.prisma.chatMessage.create({
          data: {
            chatId,
            message: event.content,
            role: ChatMessageRole.AGENT,
          },
        });
      }

      yield event;
    }
  }

  async runExperiment(message: string, chatId: string, userId: string) {
    let finalResult = null;
    let retrievedChunkIds: string[] = [];
    let relevantContext: string = '';

    for await (const event of this.agentService.streamMessage(
      message,
      chatId,
      userId,
    )) {
      if (event.type === 'done') {
        finalResult = event.content;
        retrievedChunkIds = event.chunkIds;
        relevantContext = event.relevantContext;
      }
    }

    return {
      content: finalResult,
      retrievedChunkIds,
      relevantContext,
    };
  }
}
