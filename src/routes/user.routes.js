import { Router } from "express";
import { 
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
    } from "../controllers/user.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verfiyJwt,changeCurrentPassword)
router.route("/current-user").get(verfiyJwt,getCurrentUser)
router.route("/update-account").patch(verfiyJwt,updateAccountDetails)
router.route("/avatar").patch(verfiyJwt,upload.single("avatar"),updateAvatar)
router.route("/cover-image").patch(verfiyJwt,upload.single("coverImage"),updateCoverImage)
router.route("/c/:username").get(verfiyJwt,getUserChannelProfile)
router.route("/history").get(verfiyJwt,getWatchHistory)

export default router