import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import {verfiyJwt} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verfiyJwt);

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router