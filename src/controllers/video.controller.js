import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const videoLocalPath = req.files.videoFile[0].path
    const thumbnailLocalPath = req.files.thumbnail[0].path
    if(!videoLocalPath){
        throw new ApiError("Video file is required", 400)
    }
    if(!thumbnailLocalPath){
        throw new ApiError("Thumbnail is required", 400)
        }
        const thumbnailCloudinary = await uploadOnCloudinary(thumbnailLocalPath)
    const videoCloudinary = await uploadOnCloudinary(videoLocalPath)
    const video = await Video.create({
        title,
        description,
        owner: req.user._id,
        videoFile: videoCloudinary.url,
        thumbnail: thumbnailCloudinary.url,
        duration: videoCloudinary.duration,
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
            res.json(new ApiResponse(200,video,"Video fetched successfully"))

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
            if (video.owner.toString() !== req.user._id.toString()) {
                throw new ApiError("Unauthorized", 401)
                }
                
                const thumbnailLocalPath = req.file?.path
                console.log(thumbnailLocalPath)
                
                if(!thumbnailLocalPath){
                    throw new ApiError(400,"thumbnail is required")
                }
        
            
                const thumbnailCloudinaryPath = await uploadOnCloudinary(thumbnailLocalPath);
                video.thumbnail = thumbnailCloudinaryPath.url
                await video.save()
                res.json(new ApiResponse( 200,video, "Video updated successfully"))
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid video id")
        }
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(404, "Video not found")
            }
            if (video.owner.toString() !== req.user._id.toString()) {
                throw new ApiError("Unauthorized", 401)
                }
                await Video.deleteOne(video)
                res.json(new ApiResponse (200, "Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid video id")
        }
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError("Video not found", 404)
            }
            if (video.owner.toString() !== req.user._id.toString()) {
                throw new ApiError("Unauthorized", 401)
                }
                video.isPublished = !video.isPublished
                await video.save()
                res.json(new ApiResponse(200, video, "Video publish status updated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}