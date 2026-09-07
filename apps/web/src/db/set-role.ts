import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

async function main() {
  const clerkId = process.argv[2];
  if (!clerkId) {
    process.exit(1);
  }

  const [updated] = await db
    .update(users)
    .set({ role: "staff" })
    .where(eq(users.clerkId, clerkId))
    .returning();

  if (!updated) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  process.exit(1);
});
