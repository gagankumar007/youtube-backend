import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video ID", 400)
        }
        const like = await Like.findOne({video: videoId, user: req.user._id})
        if (like) {
            await like.remove()
            return new ApiResponse(res, 200, "Like removed successfully")
            }
            await Like.create({video: videoId, user: req.user._id})
            return new ApiResponse(res, 201, "Like added successfully")
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError("Invalid comment ID", 400)
        }
        const like = await Like.findOne({comment: commentId, user: req.user._id})
        if (like) {
            await like.remove()
            return new ApiResponse(res, 200, "Like removed successfully")
            }
            await Like.create({comment: commentId, user: req.user._id})
            return new ApiResponse(res, 201, "Like added successfully")


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError("Invalid tweet ID", 400)
        }
        const like = await Like.findOne({tweet: tweetId, user: req.user._id})
        if (like) {
            await like.remove()
            return new ApiResponse(res, 200, "Like removed successfully")
            }
            await Like.create({tweet: tweetId, user: req.user._id})
            return new ApiResponse(res, 201, "Like added successfully")

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({user: req.user._id, video: {$exists
        : true}}).populate("video")
        return new ApiResponse(res, 200, "Liked videos fetched successfully", likedVideos)
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}