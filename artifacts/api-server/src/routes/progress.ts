import { Router, type IRouter } from "express";
import { db, progressTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { MarkCompleteBody, MarkCompleteParams } from "@workspace/api-zod";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const docsDataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");

function getTotalChapters(): number {
  try {
    const registryPath = path.join(docsDataDir, "docs-registry.json");
    const raw = fs.readFileSync(registryPath, "utf-8");
    const registry = JSON.parse(raw) as Array<{ slug: string }>;
    return registry.length;
  } catch {
    return 0;
  }
}

router.get("/progress", async (_req, res): Promise<void> => {
  const allProgress = await db.select().from(progressTable);
  const completed = allProgress.filter((p) => p.completed);
  const totalChapters = getTotalChapters();

  res.json({
    totalChapters,
    completedChapters: completed.length,
    percentComplete: totalChapters > 0 ? Math.round((completed.length / totalChapters) * 100) : 0,
    completedSlugs: completed.map((p) => p.slug),
    streakDays: Math.min(completed.length, 7),
  });
});

router.post("/progress/:slug", async (req, res): Promise<void> => {
  const params = MarkCompleteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = MarkCompleteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { slug } = params.data;
  const { completed } = body.data;

  const completedAt = completed ? new Date() : null;

  const [entry] = await db
    .insert(progressTable)
    .values({ slug, completed, completedAt })
    .onConflictDoUpdate({
      target: progressTable.slug,
      set: { completed, completedAt, updatedAt: new Date() },
    })
    .returning();

  res.json({
    slug: entry.slug,
    completed: entry.completed,
    completedAt: entry.completedAt ? entry.completedAt.toISOString() : null,
  });
});

export default router;
