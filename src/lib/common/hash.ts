import * as crypto from 'crypto';

export function hashData(s: string): string {
  const hashedData = crypto.createHash('SHA256').update(s).digest('hex');
  return hashedData;
}
