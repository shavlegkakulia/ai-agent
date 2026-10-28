function normalizePhoneNumber(phoneNumber?: string) {
  if (!phoneNumber) {
    return '';
  }
  let value = phoneNumber.replace(/\D/g, '');

  if (value.startsWith('995')) {
    value = value.slice(3);
  }

  if (value.startsWith('0')) {
    value = value.slice(1);
  }

  return value;
}

function normalizeEmail(email?: string) {
  if (!email) {
    return '';
  }
  return email.toLowerCase().trim().replace(/\s+/g, ' ');
}

function normalizeCustomerName(customerName: string) {
  return customerName
    .normalize('NFKC') // Unicode Normalization Form KC (compatibility compatibility)
    .trim() // Remove leading and trailing whitespace
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, ' '); // Replace multiple spaces with a single space
}

function serializePgVector(embeddings: number[]) {
  return `[${embeddings.join(',')}]`;
}

function buildFtsQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(' | ');
}

export {
  normalizePhoneNumber,
  normalizeEmail,
  normalizeCustomerName,
  serializePgVector,
  buildFtsQuery,
};
