import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    // Find the user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(200,"User not found", 404);
    }
    // Create the tweet
    const tweet = await Tweet.create({ content:content ,owner:user._id});
    // Respond with the created tweet
    res.status(201).json(new ApiResponse(201,{tweet},"Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    if (!isValidObjectId(req.user._id)) {
        throw new ApiError(200,"Invalid user ID", 400);
        }
        const user = await User.findById(req.user._id);
        console.log(user._id)
        if (!user) {
            throw new ApiError(200,"User not found", 404);
        }
        const tweets = await Tweet.find({ owner: user._id });
        res.status(200).json(new ApiResponse(200,{tweets},"User tweets fetched successfully"));
        
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    console.log(tweetId)
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404,"Invalid tweet ID");
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(200,"Tweet not found", 404);
        }
        if (tweet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(200,"Unauthorized", 401);
            }
            const { content } = req.body;
            tweet.content = content;
            await tweet.save();
            res.status(200).json(new ApiResponse(200,{tweet},"Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404,"Invalid tweet ID");
        }
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(200,"Tweet not found", 404);
        }
        if (tweet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(200,"Unauthorized", 401);
            }
            await Tweet.deleteOne(tweet)
            res.status(200).json(new ApiResponse(200,"Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}