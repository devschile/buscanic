export const MAX_DOMAINS = 5;
export const MAX_DOMAIN_LENGTH = 56;

const ALLOWED_CHARS = /^[a-z0-9.\-áéíóúñ]+$/;

export const isValidDomainPart = (part: string): boolean =>
  part.length <= MAX_DOMAIN_LENGTH && ALLOWED_CHARS.test(part);

export const validateDomains = (input: string): string[] | null => {
  const parts = input.split(',').map(d => d.trim().toLowerCase());

  if (parts.length > MAX_DOMAINS) {
    return null;
  }

  for (const part of parts) {
    if (!part) continue;

    if (!isValidDomainPart(part)) {
      return null;
    }

    const hasTld = part.includes('.');
    const tld = hasTld ? part.split('.').pop() : null;

    if (tld && tld !== 'cl') {
      return null;
    }
  }

  return parts.filter(d => d.length > 0);
};
