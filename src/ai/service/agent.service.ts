import { Injectable } from '@nestjs/common';
import { MainAgent } from '../agent/mian.agent';
import { LangfuseService } from '../../langfuse/observability/observability.service';

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

    console.log({ response });
    const lastMessage = response.messages[response.messages.length - 1];
    return lastMessage.content;
  }
}
