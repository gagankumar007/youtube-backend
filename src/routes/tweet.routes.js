
import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verfiyJwt} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verfiyJwt); 

router.route("/").post(createTweet);
router.route("/user/").get(getUserTweets);
router.route("/:tweetId").get(updateTweet).delete(deleteTweet);

export default router