import 'dotenv/config';
import '../../src/instrumentation';

import { LangfuseClient } from '@langfuse/client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ChatService } from '../../src/chat/chat.service';
import { randomUUID } from 'crypto';
import type { Evaluator } from '@langfuse/client';

import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const judge = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0,
}).withStructuredOutput(
  z.object({
    correct: z.boolean(),
    reason: z.string(),
  }),
);

const groundednessEvaluator: Evaluator = async ({ input, output }) => {
  const actual = output as {
    content: string;
    relevantContext: string;
  };

  const typedInput = input as {
    question: string;
  };

  if (!actual.relevantContext?.trim()) {
    return {
      name: 'groundedness',
      value: 0,
      comment:
        'No retrieved context was provided, so the answer cannot be considered grounded.',
    };
  }

  const result = await judge.invoke(`
  Question:
  ${typedInput.question}

  Relevant context:
  ${actual.relevantContext}

  Answer:
  ${actual.content}

  Evaluate ONLY whether the answer is supported by the Relevant context.

  Rules:
  - Use only the Relevant context as evidence.
  - Do not use general knowledge, common sense, or standard customer support practices.
  - Every factual claim, company policy, instruction, recommendation, threshold, condition, or procedure in the answer must be supported by the Relevant context.
  - Paraphrasing is allowed.
  - Extra details are allowed only if they are directly supported by the Relevant context.
  - If the answer adds any unsupported policy, procedure, recommendation, or factual claim, return incorrect.
  - If Relevant context does not contain enough evidence to support the answer, return incorrect.
  `);

  return {
    name: 'groundedness',
    value: result.correct ? 1 : 0,
    comment: result.reason,
  };
};

const correctnessEvaluator: Evaluator = async ({ output, expectedOutput }) => {
  if (expectedOutput === undefined) {
    return {
      name: 'correctness',
      value: 0,
      comment: 'Expected output is missing',
    };
  }

  const actual = output as {
    content: string;
    retrievedChunkIds: string[];
  };

  const result = await judge.invoke(`
    Expected answer:
    ${String(expectedOutput)}

    Actual answer:
    ${String(actual.content)}

    Determine whether the actual answer preserves all materially important facts,
    rules and constraints from the expected answer.

    Paraphrasing is allowed.
    Do not require exact wording.
    Return incorrect if an important fact is missing or contradicted.
    `);

  return {
    name: 'correctness',
    value: result.correct ? 1 : 0,
    comment: result.reason,
  };
};

const retrievalRecallEvaluator: Evaluator = async ({ output, metadata }) => {
  const actual = output as {
    content: string;
    retrievedChunkIds: string[];
  };

  const expectedChunkIds = (metadata?.expectedChunkIds as string[]) ?? [];

  if (expectedChunkIds.length === 0) {
    return {
      name: 'retrieval_recall_applicable',
      value: 0,
      dataType: 'BOOLEAN',
      comment: 'This test case does not require retrieval',
    };
  }

  const retrievedSet = new Set(actual.retrievedChunkIds);

  const matchedChunkIds = expectedChunkIds.filter((id) => retrievedSet.has(id));

  const recall = matchedChunkIds.length / expectedChunkIds.length;

  return {
    name: 'retrieval_recall',
    value: recall,
    comment: `Matched ${matchedChunkIds.length} of ${expectedChunkIds.length} expected chunks`,
  };
};

const client = new LangfuseClient();

async function supportAgentExperiment() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const chatService = app.get(ChatService);
  const ds = await client.dataset.get('support-agent');
  const userId = process.env.LANGFUSE_EVAL_USER_ID;

  try {
    const result = await ds.runExperiment({
      name: 'support-agent',
      maxConcurrency: 1,
      task: async (item) => {
        const input = item.input as {
          question: string;
        };

        const metadata = item.metadata as {
          caseId: string;
        };
        const sessionId = `eval-${randomUUID()}-${metadata.caseId}`;
        const output = await chatService.runExperiment(
          input.question,
          sessionId, //session id
          userId, //user id
        );

        return output;
      },
      evaluators: [
        correctnessEvaluator,
        retrievalRecallEvaluator,
        groundednessEvaluator,
      ],
    });

    console.log(await result.format({ includeItemResults: true }));
  } catch (error) {
    console.error(error);
  } finally {
    await app.close();
  }
}

supportAgentExperiment();
