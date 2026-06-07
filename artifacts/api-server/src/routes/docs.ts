import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";
import { db, progressTable } from "@workspace/db";
import { inArray } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

const docsDataDir = path.resolve(workspaceRoot, "artifacts/api-server/data");

type ChapterMeta = {
  slug: string;
  title: string;
  description: string;
  order: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  file: string;
  diagrams: Array<{
    id: string;
    type: string;
    title: string;
    data: string;
  }>;
};

function loadRegistry(): ChapterMeta[] {
  const registryPath = path.join(docsDataDir, "docs-registry.json");
  const raw = fs.readFileSync(registryPath, "utf-8");
  return JSON.parse(raw) as ChapterMeta[];
}

router.get("/docs", async (req, res): Promise<void> => {
  try {
    const registry = loadRegistry();
    const slugs = registry.map((c) => c.slug);

    let completedSlugs: string[] = [];
    if (slugs.length > 0) {
      const progress = await db
        .select()
        .from(progressTable)
        .where(inArray(progressTable.slug, slugs));
      completedSlugs = progress
        .filter((p) => p.completed)
        .map((p) => p.slug);
    }

    const chapters = registry.map(({ file: _file, diagrams: _d, ...meta }) => ({
      ...meta,
      completed: completedSlugs.includes(meta.slug),
    }));

    res.json(chapters);
  } catch (error) {
    req.log.error({ error }, "Failed to load docs");
    res.status(500).json({ error: "Failed to load documentation" });
  }
});

router.get("/docs/:slug", async (req, res): Promise<void> => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const registry = loadRegistry();
    const chapterIndex = registry.findIndex((c) => c.slug === slug);

    if (chapterIndex === -1) {
      res.status(404).json({ error: "Chapter not found" });
      return;
    }

    const chapter = registry[chapterIndex];
    const filePath = path.join(docsDataDir, "docs", chapter.file);

    if (!fs.existsSync(filePath)) {
      req.log.warn({ slug, filePath }, "Markdown file not found");
      res.status(404).json({ error: "Chapter content not found" });
      return;
    }

    const content = fs.readFileSync(filePath, "utf-8");

    const progress = await db
      .select()
      .from(progressTable)
      .where(inArray(progressTable.slug, [slug]));
    const isCompleted = progress.find((p) => p.slug === slug)?.completed ?? false;

    const prevChapter = chapterIndex > 0 ? registry[chapterIndex - 1] : null;
    const nextChapter = chapterIndex < registry.length - 1 ? registry[chapterIndex + 1] : null;

    res.json({
      slug: chapter.slug,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      category: chapter.category,
      difficulty: chapter.difficulty,
      estimatedMinutes: chapter.estimatedMinutes,
      content,
      diagrams: chapter.diagrams,
      completed: isCompleted,
      prevSlug: prevChapter?.slug ?? null,
      nextSlug: nextChapter?.slug ?? null,
    });
  } catch (error) {
    req.log.error({ error }, "Failed to load chapter");
    res.status(500).json({ error: "Failed to load chapter" });
  }
});

export default router;
