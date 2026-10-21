import { Injectable } from '@nestjs/common';
import { tool } from 'langchain';
import { z } from 'zod';
import {
  serializePgVector,
  normalizeCustomerName,
  normalizePhoneNumber,
} from '../../helper';
import { Customer, PrismaClient } from '../../generated/prisma/client';
import { EmbeddingService } from '../../embedding/embedding.service';
import { DocumentService } from '../../document/document.service';
import { fuseSearchResults } from '../../helper/rrf';
import { buildKnowledgeContextPrompt } from '../promts';

@Injectable()
export class AgentTools {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly embeddingService: EmbeddingService,
    private readonly documentService: DocumentService,
  ) {}

  private getKnowledgeBaseTool() {
    return tool(
      async (query: { query: string }) => {
        const candidateLimit = 10;
        const finalLimit = 5;
        const queryEmbedding = await this.embeddingService.embedQuery(
          query.query ?? '',
        );
        const pgVectorString = serializePgVector(queryEmbedding);

        const [vectorResults, ftsResults] = await Promise.all([
          this.documentService.embeddingSimilaritySearch(
            pgVectorString,
            candidateLimit,
          ),
          this.documentService.ftsSearch(query.query, candidateLimit),
        ]);

        const relevantResults = fuseSearchResults(
          vectorResults,
          ftsResults,
          finalLimit,
        );

        if (relevantResults.length === 0) {
          return {
            found: false,
            error: 'No company knowledge base results found',
          };
        }

        const relevantContext = relevantResults
          .map((result: any) => result.content)
          .join('\n-----\n');

        const context = buildKnowledgeContextPrompt(
          relevantContext,
          query.query ?? '',
        );

        return {
          found: true,
          context: context,
        };
      },
      {
        name: 'get-knowledge-base',
        description: `Search the company knowledge base for policies, procedures, and business rules.

        Create the search query in the same language as the user's question whenever possible.
        
        Preserve all concrete details that may affect which policy applies, including:
        - locations
        - numbers
        - time periods
        - order or product statuses
        - product types
        - customer intent
        - conditions and exceptions
        
        Do not replace a specific user question with a generic topic.
        Do not omit details that may affect retrieval relevance.
        Prefer the user's original wording when it is already suitable for semantic search.
        
        Use a descriptive semantic query that includes the relevant business context.
        
        For example:
        
        User:
        "შეკვეთა რუსთავშია და უკვე 6 სამუშაო დღეა PENDING სტატუსში. ითვლება თუ არა დაგვიანებულად?"
        
        Good query:
        "რუსთავში შეკვეთა 6 სამუშაო დღეა PENDING სტატუსში, მიწოდების ვადა და დაგვიანების პირობები"
        
        Bad query:
        "PENDING სტატუსის შეკვეთის დაგვიანების პირობები"
        
        Another example:
        
        User:
        "მიწოდებული პროდუქტი გადაიფიქრა და დაბრუნება უნდა"
        
        Good query:
        "მიწოდებული პროდუქტის დაბრუნების პირობები მომხმარებელმა გადაიფიქრა შეძენა"
        
        Do not translate a Georgian request into a short English keyword query.`,
        schema: z.object({
          query: z.string().nullable(),
        }),
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
      async (data: { customerName?: string; customerPhone?: string }) => {
        let name = '';
        let phone = '';
        let reorderName = '';
        if (data.customerName) {
          name = normalizeCustomerName(data.customerName);
          reorderName = name.split(' ').reverse().join(' ');
        }
        if (data.customerPhone) {
          phone = normalizePhoneNumber(data.customerPhone);
        }
        let customers: Customer[] = [];

        if (!name && !phone) {
          return {
            found: false,
            error: 'No customer name or phone provided',
          };
        }

        if (name && phone) {
          console.log('name and phone', name, phone);
          customers = await this.prisma.customer.findMany({
            where: {
              phone: phone,
              OR: [{ name: name }, { name: reorderName }],
            },
          });
        } else if (name) {
          console.log('name', name);
          customers = await this.prisma.customer.findMany({
            where: {
              OR: [{ name: name }, { name: reorderName }],
            },
          });
        } else if (phone) {
          console.log('phone', phone);
          customers = await this.prisma.customer.findMany({
            where: {
              phone: phone,
            },
          });
        }

        console.log('customers', customers.length);

        if (customers.length === 0) {
          return {
            found: false,
            error:
              'Customer not found, please provide valid customer name or phone',
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
        description:
          'Get information about an order when the user provides the customer name or phone',
        schema: z.object({
          customerPhone: z.string().nullable(),
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
