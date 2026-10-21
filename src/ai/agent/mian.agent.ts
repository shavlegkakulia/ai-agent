import { Injectable, OnModuleInit } from '@nestjs/common';
import { createAgent, ReactAgent } from 'langchain';
import { mainAgentPrompt } from '../promts';
import { AgentTools } from '../tools/agent.tools';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

@Injectable()
export class MainAgent implements OnModuleInit {
  private mainAgent: ReactAgent;
  private readonly checkPointer: PostgresSaver;

  constructor(private readonly agentTools: AgentTools) {
    this.checkPointer = PostgresSaver.fromConnString(process.env.DATABASE_URL);
  }

  async onModuleInit() {
    await this.checkPointer.setup();
    this.mainAgent = createAgent({
      name: 'MainAgent',
      model: 'gpt-4o',
      tools: this.agentTools.getAllTools(),
      checkpointer: this.checkPointer,
      systemPrompt: mainAgentPrompt,
    });
  }

  get agent() {
    return this.mainAgent;
  }
}
