import { Router, type IRouter } from "express";
import healthRouter from "./health";
import docsRouter from "./docs";
import progressRouter from "./progress";

const router: IRouter = Router();

router.use(healthRouter);
router.use(docsRouter);
router.use(progressRouter);

export default router;
