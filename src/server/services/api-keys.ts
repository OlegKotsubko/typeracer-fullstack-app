import { db } from "@/db";
import { apiKey } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { ServiceError } from "./errors";

const KEY_PREFIX = "tr_live_";
const PREFIX_INDEX_LEN = 8;

function hash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken() {
  return KEY_PREFIX + randomBytes(24).toString("base64url");
}

export type CreatedApiKey = {
  id: string;
  name: string;
  prefix: string;
  token: string;
  createdAt: Date;
};

export async function listApiKeys(userId: string, limit = 20, offset = 0) {
  return db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      lastUsedAt: apiKey.lastUsedAt,
      revokedAt: apiKey.revokedAt,
      createdAt: apiKey.createdAt,
    })
    .from(apiKey)
    .where(eq(apiKey.userId, userId))
    .orderBy(desc(apiKey.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function createApiKey(
  userId: string,
  name: string
): Promise<CreatedApiKey> {
  if (!name?.trim()) {
    throw new ServiceError("VALIDATION_ERROR", "Name is required");
  }
  const token = generateToken();
  const [row] = await db
    .insert(apiKey)
    .values({
      userId,
      name: name.trim(),
      prefix: token.slice(0, PREFIX_INDEX_LEN),
      hash: hash(token),
    })
    .returning({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      createdAt: apiKey.createdAt,
    });

  return { ...row, token };
}

export async function revokeApiKey(userId: string, id: string) {
  const [revoked] = await db
    .update(apiKey)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(apiKey.id, id),
        eq(apiKey.userId, userId),
        isNull(apiKey.revokedAt)
      )
    )
    .returning({ id: apiKey.id });

  if (!revoked) throw new ServiceError("NOT_FOUND", "API key not found");
}

export async function findActiveKeyByToken(token: string) {
  if (!token.startsWith(KEY_PREFIX)) return null;

  const [row] = await db
    .select({
      id: apiKey.id,
      userId: apiKey.userId,
      revokedAt: apiKey.revokedAt,
    })
    .from(apiKey)
    .where(eq(apiKey.hash, hash(token)));

  if (!row || row.revokedAt) return null;

  await db
    .update(apiKey)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKey.id, row.id));

  return { id: row.id, userId: row.userId };
}
