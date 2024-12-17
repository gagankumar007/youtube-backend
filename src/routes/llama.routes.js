import { Router } from 'express';
import{llamaGenerate,jobChatBot} from "../controllers/llama.controller.js"
import {verfiyJwt} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verfiyJwt); 
router.route("/generate").post(llamaGenerate);
router.route("/job-chat").post(jobChatBot)
export default router