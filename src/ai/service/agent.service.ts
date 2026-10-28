import { Injectable } from '@nestjs/common';
import { MainAgent } from '../agent/mian.agent';
import { LangfuseService } from '../../langfuse/observability/observability.service';
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

  async *streamMessage(message: string, chatId: string, userId: string) {
    const config = {
      configurable: {
        thread_id: chatId,
        user_id: userId,
      },
    };
    const langfuseHandler = this.langfuseService.createHandler({
      version: '2',
      sessionId: chatId,
      userId,
      tags: ['agent-message'],
    });
    const response = await this.mainAgent.agent.streamEvents(
      {
        messages: [{ role: 'user', content: message }],
      },
      {
        ...config,
        callbacks: [langfuseHandler],
      },
    );
    let finalText = '';
    let chunkIds: string[] = [];
    let relevantContext: string = '';
    for await (const event of response) {
      if (event.event === 'on_chat_model_stream') {
        const text = event.data.chunk?.text;
        if (text) {
          finalText += text;
        }

        yield {
          type: 'token',
          content: text,
        };
      }

      if (
        event.event === 'on_tool_end' &&
        event.name === 'get-knowledge-base'
      ) {
        const artifact = event.data.output?.artifact as
          | {
              chunkIds: string[];
              relevantContext: string;
            }
          | undefined;

        if (artifact) {
          chunkIds = artifact.chunkIds;
          relevantContext = artifact.relevantContext;
        }
      }
    }
    const normalizedMessage = await this.normalizeResponse(finalText);
    yield {
      type: 'done',
      content: normalizedMessage,
      chunkIds,
      relevantContext,
    };
  }

  private async normalizeResponse(message: string) {
    let normalizedMessage = message;
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

    return normalizedMessage;
  }
}
