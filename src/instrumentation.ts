import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { emailRegex, phoneRegex } from 'constant/regex';
import {
  LANGFUSE_EMAIL_REDACTED,
  LANGFUSE_PHONE_REDACTED,
  piiPlaceholder,
  piiEmailSuffix,
  piiPhoneSuffix,
} from './pii/constant';
import { hmacString } from './helper/crypto.utils';

const customerRefRegex = new RegExp(
  `\\[${piiPlaceholder}:(${piiEmailSuffix}|${piiPhoneSuffix}):([^\\]]+)\\]`,
  'g',
);

function maskCustomerRef(data: string) {
  return data.replace(
    customerRefRegex,
    (_: any, type: string, customerRef: string) => {
      const telemetryRef = hmacString(
        customerRef,
        process.env.LANGFUSE_TELEMETRY_SECRET,
      );
      return `[${piiPlaceholder}:${type}:${telemetryRef}]`;
    },
  );
}

export const langfuseSpanProcessor = new LangfuseSpanProcessor({
  mask: ({ data }) => {
    return data
      .replace(customerRefRegex, maskCustomerRef)
      .replace(emailRegex, LANGFUSE_EMAIL_REDACTED)
      .replace(phoneRegex, LANGFUSE_PHONE_REDACTED);
  },
  exportMode: 'immediate',
});

const sdk = new NodeSDK({
  spanProcessors: [langfuseSpanProcessor],
});

sdk.start();
