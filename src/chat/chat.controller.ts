import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthRequest } from 'types/auth';
import { ChatMessageRole } from '../generated/prisma/client';
import { Response } from 'express';

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
    return await this.chatService.getChat(chatId, userId);
  }

  @Delete(':chatId')
  async deleteChat(
    @Param('chatId') chatId: string,
    @Request() req: AuthRequest,
  ) {
    const userId = req.user.id;
    return await this.chatService.deleteChat(chatId, userId);
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
    @Request() req: AuthRequest,
    @Res() res: Response,
  ) {
    for await (const event of this.chatService.createChatMessageStream(
      chatId,
      body.message,
      ChatMessageRole.USER,
      req.user.id,
    )) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  }
}
