import { createHmac } from "crypto";

/**
 * Server-side only: generate a deterministic anonymous ID from a real UUID.
 * Uses HMAC-SHA256 with a server secret so the mapping is one-way and
 * consistent (same UUID always produces the same anon ID).
 *
 * Output format: "RR-" + 8 hex chars, e.g. "RR-a3f1b9c2"
 */
const ANON_SECRET = process.env.ANON_HASH_SECRET || "rubbish-review-default-anon-secret-change-me";

export function hashUserId(uuid: string): string {
  const hmac = createHmac("sha256", ANON_SECRET);
  hmac.update(uuid);
  return "RR-" + hmac.digest("hex").slice(0, 8);
}

/**
 * Build an anonymized profile object that replaces all PII.
 * - `id` → hashed
 * - `username` → same hash
 * - `display_name` → "Anonymous {hash}"
 * - all other PII fields nulled out
 */
export function anonymizeProfile(profile: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!profile) return null;
  const realId = profile.id as string;
  const anonId = hashUserId(realId);
  return {
    id: anonId,
    username: anonId,
    display_name: anonId,
    avatar_url: null,
    bio: null,
    institution: null,
    research_field: null,
    title: null,
    karma: 0,
    created_at: profile.created_at ?? null,
  };
}

/**
 * Anonymize a single record that has a joined profile under a given key.
 * Also replaces the raw foreign-key ID field (e.g. author_id, reviewer_id, user_id).
 */
export function anonymizeRecord<T extends Record<string, unknown>>(
  record: T,
  profileKey: string,
  idField: string,
  currentUserId?: string | null,
): T {
  const realId = record[idField] as string | undefined;
  const isSelf = currentUserId && realId === currentUserId;

  if (isSelf) return record; // don't anonymize own data

  const anonId = realId ? hashUserId(realId) : null;
  return {
    ...record,
    [idField]: anonId,
    [profileKey]: anonymizeProfile(record[profileKey] as Record<string, unknown> | null),
  };
}

/**
 * Anonymize an array of records (papers, reviews, comments, etc.)
 */
export function anonymizeList<T extends Record<string, unknown>>(
  records: T[],
  profileKey: string,
  idField: string,
  currentUserId?: string | null,
): T[] {
  return records.map((r) => anonymizeRecord(r, profileKey, idField, currentUserId));
}
