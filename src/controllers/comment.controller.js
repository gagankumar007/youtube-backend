import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Please provide a valid video Id");
  }

  const getComments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
      },
    },
    {
      $lookup: {
        from: "like",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
         
          $first: "$owners",
        },
        isLiked: {
          $cond: {
            if: {
              $in: [req.user?._id, "$likes.likedBy"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
        isLiked: 1,
      },
    },
  ]);

  if (!getComments) {
    throw new ApiError(500, "Error while loading getComments section");
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(getComments, options);

  if (!comments) {
    throw new ApiError(500, "Error while loading comments section");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully!"));

})

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params
  const { text } = req.body
  const comment = await Comment.create({
    content: text,
    video: videoId,
    author: req.user._id
  })
  if (!comment) {
    throw new ApiError(400, "Failed to add comment")
  }
  res.json(new ApiResponse(201, comment, "Comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params
  const { text } = req.body
  const comment = await Comment.findByIdAndUpdate(commentId, { text }, { new: true })
  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }
  res.json(new ApiResponse(200, comment, "Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const comment = await Comment.findByIdAndDelete(commentId)
  if (!comment) {
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