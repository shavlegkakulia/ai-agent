import { Injectable } from '@nestjs/common';
import { CustomerService } from '../../customer/customer.service';
import { createMiddleware } from 'langchain';
import { HumanMessage } from '@langchain/core/messages';
import { emailRegex, phoneRegex } from '../../../constant/regex';
import { PiiService } from '../../pii/pii.service';
import { normalizeEmail, normalizePhoneNumber } from '../../helper/factory';

@Injectable()
export class PiiMiddlewareFactory {
  constructor(
    private readonly customerService: CustomerService,
    private readonly piiService: PiiService,
  ) {}

  createMiddleware() {
    return createMiddleware({
      name: 'pii',

      wrapModelCall: async (request, handler) => {
        const messages = await Promise.all(
          request.messages.map(async (message) => {
            if (message.type !== 'human') {
              return message;
            }
            if (!message.content || typeof message.content !== 'string') {
              return message;
            }
            const phoneMatch = message.content.match(phoneRegex);
            const emailMatch = message.content.match(emailRegex);
            const customer = await this.customerService.getCustomerRef(
              normalizePhoneNumber(phoneMatch?.[0]),
              normalizeEmail(emailMatch?.[0]),
            );

            if (!customer) {
              return message;
            }
            let maskedContent = message.content;
            if (phoneMatch) {
              maskedContent = this.piiService.maskPhone(
                maskedContent,
                customer.customerRef,
              );
            }
            if (emailMatch) {
              maskedContent = this.piiService.maskEmail(
                maskedContent,
                customer.customerRef,
              );
            }

            return new HumanMessage({
              id: message.id,
              content: maskedContent,
            });
          }),
        );

        return handler({
          ...request,
          messages,
        });
      },
    });
  }
}
