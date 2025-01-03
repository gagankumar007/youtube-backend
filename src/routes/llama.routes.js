import { Router } from 'express';
import{llamaGenerate,jobChatBot,googleGenerativeAI} from "../controllers/llama.controller.js"
import {verfiyJwt} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verfiyJwt); 
router.route("/generate").post(llamaGenerate);
router.route("/job-chat").post(jobChatBot);
router.route("/generate/google").post(googleGenerativeAI)
export default router