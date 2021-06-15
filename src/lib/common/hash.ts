import * as crypto from "crypto";

export function hashData(s: string): string {
  const hashedData = crypto.createHash("sha1").update(s).digest("hex");
  return hashedData;
}
