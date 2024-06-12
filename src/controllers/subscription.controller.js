import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const user = req.user._id
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400,"Invalid channel ID")
        }
        const channel = await User.findById(channelId)
        if (!channel) {
            throw new ApiError(404,"Channel not found")
            }
            const subscription = await Subscription.findOne({channelId, user})
            if (subscription) {
                await subscription.delete()
                return new ApiResponse(res, 200, "Subscription cancelled successfully")
                }
                await Subscription.create({channelId,user})
                return new ApiResponse( 201,res, "Subscription created successfully")

    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400,"Invalid channel ID")
        }
        const channel = await User.findById(channelId)
        if (!channel) {
            throw new ApiError(404,"Channel not found")
            }
            const subscribers = await Subscription.find({channelId}).populate("user")
            return new ApiResponse(res, 200, subscribers)
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}