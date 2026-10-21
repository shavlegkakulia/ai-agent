import { Injectable } from '@nestjs/common';
import { MainAgent } from '../agent/mian.agent';

@Injectable()
export class AgentService {
  constructor(private readonly mainAgent: MainAgent) {}

  async sendMessage(message: string, chatId: string) {
    const config = {
      configurable: {
        thread_id: chatId,
      },
    };
    const response = await this.mainAgent.agent.invoke(
      {
        messages: [{ role: 'user', content: message }],
      },
      config,
    );
    console.log({ response });
    const lastMessage = response.messages[response.messages.length - 1];
    return lastMessage.content;
  }
}
