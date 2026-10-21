import { Injectable } from '@nestjs/common';
import {
  ChatMessage,
  ChatMessageRole,
  PrismaClient,
} from '../generated/prisma/client';
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

  async createChatMessage(
    chatId: string,
    message: string,
    role: ChatMessageRole,
  ) {
    let agentMessage: Partial<ChatMessage> | null = null;
    let chatMessage: Partial<ChatMessage> | null = null;
    try {
      chatMessage = await this.prisma.chatMessage.create({
        data: {
          chatId,
          message,
          role,
        },
        select: {
          id: true,
          message: true,
          role: true,
        },
      });
      const response = await this.agentService.sendMessage(
        message,
        chatMessage.id,
      );
      agentMessage = await this.prisma.chatMessage.create({
        data: {
          chatId,
          message: response.toString(),
          role: ChatMessageRole.AGENT,
        },
        select: {
          id: true,
          message: true,
          role: true,
        },
      });
      return {
        agentMessage,
      };
    } catch (error) {
      if (chatMessage) {
        await this.prisma.chatMessage.delete({
          where: { id: chatMessage.id },
        });
      }
      throw error;
    }
  }
}
