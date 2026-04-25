export const validateDomains = (input: string): string[] | null => {
  const parts = input.split(',').map(d => d.trim().toLowerCase());

  if (parts.length > 5) {
    return null;
  }

  for (const part of parts) {
    if (!part) continue;

    const hasTld = part.includes('.');
    const tld = hasTld ? part.split('.').pop() : null;

    if (tld && tld !== 'cl') {
      return null;
    }
  }

  return parts.filter(d => d.length > 0);
};