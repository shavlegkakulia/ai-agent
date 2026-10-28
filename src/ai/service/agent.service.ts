import { Injectable } from '@nestjs/common';
import { MainAgent } from '../agent/mian.agent';
import { LangfuseService } from '../../langfuse/observability/observability.service';
import { ToolMessage } from 'langchain';
import { CustomerService } from '../../customer/customer.service';
import { PiiService } from '../../pii/pii.service';

@Injectable()
export class AgentService {
  constructor(
    private readonly mainAgent: MainAgent,
    private readonly langfuseService: LangfuseService,
    private readonly customerService: CustomerService,
    private readonly piiService: PiiService,
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
    let normalizedMessage = response.messages.at(-1)?.text ?? '';
    const existsPhonePlaceholder =
      this.piiService.extractPhonePlaceholder(normalizedMessage);
    const existsEmailPlaceholder =
      this.piiService.extractEmailPlaceholder(normalizedMessage);

    if (existsPhonePlaceholder) {
      const phoneRef = this.piiService.extractPhoneRef(normalizedMessage);
      const reversePii = await this.customerService.getCustomerByRef(phoneRef);
      normalizedMessage = this.piiService.unmaskPhone(
        normalizedMessage,
        reversePii.phone,
      );
    }

    if (existsEmailPlaceholder) {
      const emailRef = this.piiService.extractEmailRef(normalizedMessage);
      const reversePii = await this.customerService.getCustomerByRef(emailRef);
      normalizedMessage = this.piiService.unmaskEmail(
        normalizedMessage,
        reversePii.email,
      );
    }

    return {
      content: normalizedMessage,
      retrievedChunkIds,
      relevantContext,
    };
  }
}
