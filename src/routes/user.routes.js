import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verfiyJwt } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post( 
   upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }]),
    registerUser
)
router.route("/login").post(loginUser)

router.route("/logout").post(verfiyJwt,logoutUser)

export default router