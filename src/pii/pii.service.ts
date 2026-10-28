import { Injectable } from '@nestjs/common';
import { emailRegex, phoneRegex } from '../../constant/regex';
import { piiEmailPlaceholder, piiPhonePlaceholder } from './constant';

@Injectable()
export class PiiService {
  maskPhone(stringToMask: string, customerRef: string) {
    if (!stringToMask || !customerRef) {
      return stringToMask;
    }
    return stringToMask.replace(
      phoneRegex,
      () => `[${piiPhonePlaceholder}:${customerRef}]`,
    );
  }

  unmaskPhone(stringToUnmask: string, phone: string) {
    if (!stringToUnmask || !phone) {
      return stringToUnmask;
    }
    return stringToUnmask.replace(
      new RegExp(`\\[${piiPhonePlaceholder}:([^\\]]+)\\]`),
      () => phone,
    );
  }

  extractPhonePlaceholder(maskedString: string) {
    if (!maskedString) {
      return null;
    }
    return (
      maskedString.match(
        new RegExp(`\\[${piiPhonePlaceholder}:([^\\]]+)\\]`),
      )?.[0] ?? null
    );
  }

  extractPhoneRef(text: string) {
    if (!text) {
      return null;
    }
    return (
      text.match(new RegExp(`\\[${piiPhonePlaceholder}:([^\\]]+)\\]`))?.[1] ??
      null
    );
  }

  maskEmail(stringToMask: string, customerRef: string) {
    if (!stringToMask || !customerRef) {
      return stringToMask;
    }
    return stringToMask.replace(
      emailRegex,
      () => `[${piiEmailPlaceholder}:${customerRef}]`,
    );
  }

  unmaskEmail(stringToUnmask: string, email: string) {
    if (!stringToUnmask || !email) {
      return stringToUnmask;
    }
    return stringToUnmask.replace(
      new RegExp(`\\[${piiEmailPlaceholder}:([^\\]]+)\\]`),
      () => email,
    );
  }

  extractEmailPlaceholder(maskedString: string) {
    if (!maskedString) {
      return null;
    }
    return (
      maskedString.match(
        new RegExp(`\\[${piiEmailPlaceholder}:([^\\]]+)\\]`),
      )?.[0] ?? null
    );
  }

  extractEmailRef(text: string) {
    if (!text) {
      return null;
    }
    return (
      text.match(new RegExp(`\\[${piiEmailPlaceholder}:([^\\]]+)\\]`))?.[1] ??
      null
    );
  }

  isRefPhone(ref: string) {
    if (!ref) {
      return false;
    }
    return ref.includes(piiPhonePlaceholder);
  }

  isRefEmail(ref: string) {
    if (!ref) {
      return false;
    }
    return ref.includes(piiEmailPlaceholder);
  }

  isRef(ref: string) {
    if (!ref) {
      return false;
    }
    return this.isRefPhone(ref) || this.isRefEmail(ref);
  }
}
