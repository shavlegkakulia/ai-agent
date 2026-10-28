import { Injectable } from '@nestjs/common';
import { tool } from 'langchain';
import { z } from 'zod';
import {
  serializePgVector,
  normalizeCustomerName,
  normalizePhoneNumber,
  normalizeEmail,
} from '../../helper/factory';
import { Customer, PrismaClient } from '../../generated/prisma/client';
import { EmbeddingService } from '../../embedding/embedding.service';
import { DocumentService } from '../../document/document.service';
import { fuseSearchResults } from '../../helper/rrf';
import { buildKnowledgeContextPrompt } from '../promts';
import { RunnableConfig } from '@langchain/core/runnables';
import { Document } from '@langchain/core/documents';
import { RerankerAgent } from '../model/reranker.agent';
import { PiiService } from '../../pii/pii.service';
import { CustomerService } from '../../customer/customer.service';
import { piiEmailPlaceholder, piiPhonePlaceholder } from '../../pii/constant';

@Injectable()
export class AgentTools {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly embeddingService: EmbeddingService,
    private readonly documentService: DocumentService,
    private readonly reranker: RerankerAgent,
    private readonly piiService: PiiService,
    private readonly customerService: CustomerService,
  ) {}

  private getKnowledgeBaseTool() {
    return tool(
      async (query: { query: string }, config: RunnableConfig) => {
        console.log('KNOWLEDGE TOOL CALLED', {
          query: query.query,
        });
        const chatId = config.configurable?.thread_id;
        const userId = config.configurable?.user_id;
        const candidateLimit = 20;
        const finalLimit = 15;
        const queryEmbedding = await this.embeddingService.embedQuery(
          query.query ?? '',
        );
        const pgVectorString = serializePgVector(queryEmbedding);

        const [vectorResults, ftsResults] = await Promise.all([
          this.documentService.embeddingSimilaritySearch(
            pgVectorString,
            candidateLimit,
          ),
          this.documentService.ftsSearch(
            query.query,
            candidateLimit,
            chatId,
            userId,
          ),
        ]);
        console.log('vectorResults', vectorResults);
        console.log('ftsResults', ftsResults);
        const relevantResults = fuseSearchResults(
          vectorResults,
          ftsResults,
          finalLimit,
        );
        console.log('relevantResults', relevantResults);
        const documents = relevantResults.map(
          (result) =>
            new Document({
              id: result.id,
              pageContent: result.content,
              metadata: {},
            }),
        );

        const reranked = await this.reranker.model.compressDocuments(
          documents,
          query.query ?? '',
        );

        if (reranked.length === 0) {
          return [
            {
              found: false,
              error: 'No company knowledge base results found',
            },
            {
              chunkIds: [],
              relevantContext: '',
              query: query.query ?? '',
            },
          ];
        }

        console.log('reranked', reranked);

        const relevantContext = reranked
          .map((result) => result.pageContent)
          .join('\n-----\n');

        const context = buildKnowledgeContextPrompt(
          relevantContext,
          query.query ?? '',
        );

        return [
          {
            found: true,
            context: context,
          },
          {
            chunkIds: reranked.map((result) => result.id),
            relevantContext,
            query: query.query ?? '',
          },
        ];
      },
      {
        name: 'get-knowledge-base',
        description: `Use this tool whenever the answer depends on company-specific policies,
        procedures, business rules, eligibility conditions, timeframes, warranties,
        delivery rules, returns, refunds, cancellations, privacy rules, or support procedures.
        
        Do not skip this tool because the answer seems obvious, common sense,
        or already known. When this tool is required, call it before producing the final answer.
        
        Search the company knowledge base using a query that preserves the user's
        meaning and all details that may affect which rule applies.
        
        Preserve relevant details such as:
        - locations
        - numbers
        - time periods
        - statuses
        - product types
        - customer intent
        - conditions
        - exceptions
        
        Do not replace a specific request with a generic topic.
        Do not omit details that may affect retrieval relevance.
        Prefer the user's original wording when it is already suitable for search.
        Use the same language as the user's request whenever possible.
        Do not translate a Georgian request into a short English keyword query.`,
        schema: z.object({
          query: z.string().nullable(),
        }),
        responseFormat: 'content_and_artifact',
      },
    );
  }

  private getOrderInfoTool() {
    return tool(
      async (orderId: { orderId: string }) => {
        const order = await this.prisma.order.findUnique({
          where: {
            id: orderId.orderId,
          },
          select: {
            status: true,
            createdAt: true,
          },
        });
        if (!order) {
          return {
            found: false,
            error: 'Order not found',
          };
        }

        return {
          found: true,
          order_status: order.status,
          order_created_at: order.createdAt,
        };
      },
      {
        name: 'get-order-info',
        description:
          'Get information about an order when the user provides the order some identifier',
        schema: z.object({
          orderId: z.string(),
        }),
      },
    );
  }

  private getOrderByCustomerTool() {
    return tool(
      async (data: { customerName?: string; customerRef?: string }) => {
        let name = '';
        let phone = '';
        let email = '';
        let reorderName = '';
        console.log('data', data);
        if (data.customerName) {
          name = normalizeCustomerName(data.customerName);
          reorderName = name.split(' ').reverse().join(' ');
        }
        // If the user message contains a phone placeholder, get the customer by phone
        if (data.customerRef && this.piiService.isRefPhone(data.customerRef)) {
          const phoneRef = this.piiService.extractPhoneRef(data.customerRef);
          const customer =
            await this.customerService.getCustomerByRef(phoneRef);
          phone = normalizePhoneNumber(customer.phone);
        }
        // If the user message contains an email placeholder, get the customer by email
        if (data.customerRef && this.piiService.isRefEmail(data.customerRef)) {
          const emailRef = this.piiService.extractEmailRef(data.customerRef);
          const customer =
            await this.customerService.getCustomerByRef(emailRef);
          email = normalizeEmail(customer.email);
        }
        let customers: Customer[] = [];

        if (!name && !phone && !email) {
          return {
            found: false,
            error: 'No customer name or phone or email provided',
          };
        }

        if (name && (phone || email)) {
          // If the user message contains a name and phone placeholder, get the customer by name and phone
          const customer = await this.customerService.getCustomerByRef(
            data.customerRef,
          );
          customers = await this.prisma.customer.findMany({
            where: {
              ...(phone ? { phone: customer.phone } : {}),
              ...(email ? { email: customer.email } : {}),
              OR: [{ name: name }, { name: reorderName }],
            },
          });
        } else if (name) {
          customers = await this.prisma.customer.findMany({
            where: {
              OR: [{ name: name }, { name: reorderName }],
            },
          });
        } else if (phone) {
          customers = await this.prisma.customer.findMany({
            where: {
              phone: phone,
            },
          });
        } else if (email) {
          customers = await this.prisma.customer.findMany({
            where: {
              email: email,
            },
          });
        }

        if (customers.length === 0) {
          return {
            found: false,
            error:
              'Customer not found, please provide valid customer name or phone or email',
          };
        }

        if (customers.length > 1) {
          return {
            found: false,
            error: 'Multiple customers found, please provide more information',
          };
        }

        const customer = customers[0];

        const orders = await this.prisma.order.findMany({
          where: {
            customerId: customer.id,
          },
        });
        return {
          found: true,
          orders: [
            orders.map((order) => ({
              id: order.id,
              status: order.status,
              createdAt: order.createdAt,
            })),
          ],
        };
      },
      {
        name: 'get-order-info-by-customer',
        description: `
        Get customer order information when the customer is identified by name
        or by an internal customer reference placeholder.
        
        If the user message contains:
        [${piiPhonePlaceholder}:<ref>]
        or
        [${piiEmailPlaceholder}:<ref>]
        
        the user has already provided that identifier.
        Pass the FULL placeholder exactly as it appears in the message.
        Do not extract only <ref>.
        Do not ask the user to provide the phone number or email again.
        `,
        schema: z.object({
          customerRef: z
            .string()
            .nullable()
            .describe(
              `Full placeholder exactly as it appears in the message, e.g. [${piiPhonePlaceholder}:<ref>] or [${piiEmailPlaceholder}:<ref>].`,
            ),
          customerName: z.string().nullable(),
        }),
      },
    );
  }

  getAllTools() {
    return [
      this.getOrderInfoTool(),
      this.getOrderByCustomerTool(),
      this.getKnowledgeBaseTool(),
    ];
  }
}
