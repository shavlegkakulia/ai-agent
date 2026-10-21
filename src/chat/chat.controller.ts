import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthRequest } from 'types/auth';
import { ChatMessageRole } from '../generated/prisma/client';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return await this.chatService.createChat(userId);
  }

  @Get()
  async getAllChats(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return await this.chatService.getAllChats(userId);
  }

  @Get(':chatId')
  async getChat(@Param('chatId') chatId: string, @Request() req: AuthRequest) {
    const userId = req.user.id;
    const chat = await this.chatService.getChat(chatId, userId);
    console.log(chat, chatId);
    return chat;
  }

  @Get(':chatId/messages')
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Request() req: AuthRequest,
  ) {
    const userId = req.user.id;
    return await this.chatService.getChatMessages(chatId, userId);
  }

  @Post(':chatId/message')
  async createChatMessage(
    @Param('chatId') chatId: string,
    @Body() body: { message: string },
  ) {
    return await this.chatService.createChatMessage(
      chatId,
      body.message,
      ChatMessageRole.USER,
    );
  }
}
