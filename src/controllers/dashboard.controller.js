
import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channel = req.params.channel
    const videoCount = await Video.countDocuments({channel})
    const subscriberCount = await Subscription.countDocuments({channel})
    const likeCount = await Like.countDocuments({channel})
    const videoViews = await Video.aggregate([
        {
            $match: {channel},
            },
            {
                $group: {
                    _id: null,
                    totalViews: {$sum: "$views"},
                    },
                    },
                    ])
                    const totalViews = videoViews[0].totalViews
                    res.json(new ApiResponse({videoCount, subscriberCount, likeCount, totalViews}))

    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channel = req.params.channel
    const videos = await Video.find({channel})
    res.json(new ApiResponse(videos))
})

export {
    getChannelStats, 
    getChannelVideos
    }
