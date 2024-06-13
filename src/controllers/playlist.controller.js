import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const playlist = await Playlist.create({name, description, owner: req.user._id})
    res.status(201).json(ApiResponse.success("Playlist created successfully", playlist))    

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlists = await Playlist.find({owner: userId})
    res.status(200).json(ApiResponse.success("User playlists fetched successfully", playlists))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist id", 400)
        }
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            throw new ApiError("Playlist not found", 404)
            }
            res.status(200).json(ApiResponse.success("Playlist fetched successfully", playlist))
        
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //TODO: add video to playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError("Invalid playlist or video id", 400)
        }
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            throw new ApiError("Playlist not found", 404)
            }
            const video = await mongoose.model("Video").findById(videoId)
            if (!video) {
                throw new ApiError("Video not found", 404)
                }
                if (playlist.videos.includes(videoId)) {
                    throw new ApiError("Video already exists in playlist", 400)
                    }
                    playlist.videos.push(videoId)
                    await playlist.save()
                    res.status(200).json(ApiResponse.success("Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError("Invalid playlist or video id", 400)
        }
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            throw new ApiError("Playlist not found", 404)
            }
            if (!playlist.videos.includes(videoId)) {
                throw new ApiError("Video does not exist in playlist", 400)
                }
                playlist.videos.pull(videoId)
                await playlist.save()
                res.status(200).json(ApiResponse.success("Video removed from playlist successfully"))
                

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist id", 400)
        }
        const playlist = await Playlist.findByIdAndRemove(playlistId)
        if (!playlist) {
            throw new ApiError("Playlist not found", 404)
            }
            res.status(200).json(ApiResponse.success("Playlist deleted successfully"))
            
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist id", 400)
        }
        const playlist = await Playlist.findByIdAndUpdate(playlistId, {name, description}, {new: true
            })
            if (!playlist) {
                throw new ApiError("Playlist not found", 404)
                }
                res.status(200).json(ApiResponse.success("Playlist updated successfully", playlist))
                
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}