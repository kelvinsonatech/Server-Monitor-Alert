import { Router, type IRouter } from "express";
import healthRouter from "./health";
import monitorsRouter from "./monitors";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(monitorsRouter);
router.use(settingsRouter);

export default router;
