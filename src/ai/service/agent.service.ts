import { Injectable } from '@nestjs/common';
import { MainAgent } from '../agent/mian.agent';
import { LangfuseService } from '../../langfuse/observability/observability.service';
import { ToolMessage } from 'langchain';

@Injectable()
export class AgentService {
  constructor(
    private readonly mainAgent: MainAgent,
    private readonly langfuseService: LangfuseService,
  ) {}

  async sendMessage(message: string, chatId: string, userId: string) {
    const config = {
      configurable: {
        thread_id: chatId,
        user_id: userId,
      },
    };
    const langfuseHandler = this.langfuseService.createHandler({
      sessionId: chatId,
      userId,
      tags: ['agent-message'],
    });
    const response = await this.mainAgent.agent.invoke(
      {
        messages: [{ role: 'user', content: message }],
      },
      {
        ...config,
        callbacks: [langfuseHandler],
      },
    );

    const toolMessages = response.messages.filter(
      (message): message is ToolMessage => ToolMessage.isInstance(message),
    );

    const knowledgeBaseMessage = toolMessages.find(
      (message) => message.name === 'get-knowledge-base',
    );

    const artifact = knowledgeBaseMessage?.artifact as
      { chunkIds: string[]; relevantContext: string } | undefined;

    const retrievedChunkIds = artifact?.chunkIds ?? [];
    const relevantContext = artifact?.relevantContext ?? '';

    return {
      content: response.messages.at(-1)?.text ?? '',
      retrievedChunkIds,
      relevantContext,
    };
  }
}
