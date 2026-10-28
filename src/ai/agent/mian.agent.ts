import { Injectable, OnModuleInit } from '@nestjs/common';
import { createAgent, piiMiddleware, ReactAgent } from 'langchain';
import { mainAgentPrompt } from '../promts';
import { AgentTools } from '../tools/agent.tools';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { DocumentService } from '../../document/document.service';
import { PiiMiddlewareFactory } from '../middleware/ppiMidlewareFactory';

@Injectable()
export class MainAgent implements OnModuleInit {
  private mainAgent: ReactAgent;
  private readonly checkPointer: PostgresSaver;

  constructor(
    private readonly agentTools: AgentTools,
    private readonly documentService: DocumentService,
    private readonly piiMiddlewareFactory: PiiMiddlewareFactory,
  ) {
    this.checkPointer = PostgresSaver.fromConnString(process.env.DATABASE_URL);
  }

  async onModuleInit() {
    await this.checkPointer.setup();
    const documentsTitles = await this.documentService.getDocumentsTitles();
    const prompt = `
    ${mainAgentPrompt}
    
    KNOWLEDGE BASE CATALOG
    
    The following catalog describes which topics are available in the company
    knowledge base.
    
    It is only a routing aid. It is NOT a factual source.
    
    If the user's question relates to one of these topics, call
    get-knowledge-base before answering.
    
    Never infer policy details from catalog titles alone.
    
    ${documentsTitles.map((document) => `- ${document.title}`).join('\n')}
    `;

    this.mainAgent = createAgent({
      name: 'MainAgent',
      model: 'openai:gpt-6-luna',
      tools: this.agentTools.getAllTools(),
      checkpointer: this.checkPointer,
      systemPrompt: prompt,
      middleware: [
        piiMiddleware('credit_card', { strategy: 'block' }),
        this.piiMiddlewareFactory.createMiddleware(),
      ],
    });
  }

  get agent() {
    return this.mainAgent;
  }
}
