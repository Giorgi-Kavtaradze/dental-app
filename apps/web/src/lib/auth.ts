import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { patients, users } from "@/db/schema";

import { forbidden, notFound, unauthorized } from "./http";

export type Role = "patient" | "staff" | "dentist";
export type AppUser = typeof users.$inferSelect;

async function ensureUser(clerkId: string): Promise<AppUser> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId));
  if (existing[0]) return existing[0];

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const role = roleFromMetadata(clerkUser?.publicMetadata);

  const [created] = await db
    .insert(users)
    .values({ clerkId, email, role })
    .onConflictDoUpdate({ target: users.clerkId, set: { email } })
    .returning();
  return created;
}

export function roleFromMetadata(metadata: unknown): Role {
  const role = (metadata as { role?: unknown } | null | undefined)?.role;
  return role === "staff" || role === "dentist" ? role : "patient";
}

export async function requireAuth(): Promise<AppUser> {
  const { userId } = await auth();
  if (!userId) throw unauthorized();
  return ensureUser(userId);
}

export async function requireStaff(): Promise<AppUser> {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw unauthorized();

  const user = await ensureUser(userId);
  const claimRole = roleFromMetadata(
    (sessionClaims as { publicMetadata?: unknown } | null)?.publicMetadata,
  );

  const isStaff =
    claimRole === "staff" ||
    claimRole === "dentist" ||
    user.role === "staff" ||
    user.role === "dentist";
  if (!isStaff) throw forbidden("Staff access only");

  if (claimRole !== "patient" && claimRole !== user.role) {
    await db
      .update(users)
      .set({ role: claimRole })
      .where(eq(users.id, user.id));
    return { ...user, role: claimRole };
  }
  return user;
}

export async function requireOwnedPatient(user: AppUser, patientId: string) {
  const [patient] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.accountUserId, user.id)),
    );
  if (!patient) throw notFound("Patient not found");
  return patient;
}

export async function selfPatient(user: AppUser) {
  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.accountUserId, user.id), eq(patients.isSelf, true)));
  return patient ?? null;
}
