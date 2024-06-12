import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const skip = (page - 1) * limit
    const comments = await Comment.find({videoId})
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePicture")  
    .sort({createdAt: -1})
    if (!comments) 
    {
        throw new ApiError(404,"No comments found")
    }
    const count = await Comment.countDocuments({videoId})
    const pages = Math.ceil(count / limit)
    res.json(new ApiResponse(200,comments, "Comments fetched successfully", {pages, count
    }))
    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {text} = req.body
    const comment = await Comment.create({
        text,
        videoId,
        author: req.user._id
        })
        if (!comment)
            {
                throw new ApiError(400, "Failed to add comment")
                }
                res.json(new ApiResponse(201, comment, "Comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {text} = req.body
    const comment = await Comment.findByIdAndUpdate(commentId, {text}, {new: true})
    if (!comment)
        {
            throw new ApiError(404, "Comment not found")
            }
            res.json(new ApiResponse(200, comment, "Comment updated successfully"))


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const comment = await Comment.findByIdAndDelete(commentId)
    if (!comment)
        {
            throw new ApiError(404, "Comment not found")
            }
            res.json(new ApiResponse(200, null, "Comment deleted successfully"))
            
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }