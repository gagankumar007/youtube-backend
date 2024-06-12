import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const videoLocalPath = files.videoFile[0].path
    const thumbnailLocalPath = files.thumbnail[0].path
    if(!videoLocalPath){
        throw new ApiError("Video file is required", 400)
    }
    if(!thumbnailLocalPath){
        throw new ApiError("Thumbnail is required", 400)
        }
    const videoCloudinary = await uploadOnCloudinary(videoLocalPath)
    const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath)
    const video = await Video.create({
        title,
        description,
        videoFile: videoCloudinary.url,
        thumbnail: thumbnailCloudinary.url,
        onwer: req.user._id,
        duration:videoCloudinaryUrl.duration,
        })
        res.status(201).json(new ApiResponse("Video published successfully", video))


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video id", 400)
        }
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError("Video not found", 404)
            }
            res.json(new ApiResponse(video, 200, "Video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video id", 400)
        }
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError("Video not found", 404)
            }
            if (video.userId.toString() !== req.user._id.toString()) {
                throw new ApiError("Unauthorized", 401)
                }
                const { title, description } = req.body
                const videoLocalPath = req.files.thumbnail[0].path;
                if(!videoLocalPath){
                    throw new ApiError(400,"Avatar is required")
                }
                //upload them to cloudinary 
            
                const avatarCloudinaryPath = await uploadOnCloudinary(videoLocalPath);
                video.title = title
                video.description = description
                video.thumbnailUrl = avatarCloudinaryPath.url
                await video.save()
                res.json(new ApiResponse(video, 200, "Video updated successfully"))
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video id", 400)
        }
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError("Video not found", 404)
            }
            if (video.userId.toString() !== req.user._id.toString()) {
                throw new ApiError("Unauthorized", 401)
                }
                await video.remove()
                res.json(new ApiResponse({}, 200, "Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError("Invalid video id", 400)
        }
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError("Video not found", 404)
            }
            if (video.userId.toString() !== req.user._id.toString()) {
                throw new ApiError("Unauthorized", 401)
                }
                video.isPublished = !video.isPublished
                await video.save()
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}