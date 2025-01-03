import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import uploadOnCloudinary from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError("User not found", 404);
        }

        const accessToken = await user.generateToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        
        console.error("Error generating tokens:", error);
        throw new ApiError(500,"Failed to generate tokens");
    }
};
const registerUser = asyncHandler(async (req, res)=>
{

    const {fullName,email,username,password,skill}=req.body

    if([fullName,email,username,password].some((field)=>
    field?.trim()==="")){
        throw new ApiError(400,"Please fill all the fields")
    }

    const existingUser = await User.findOne({
        $or:[{email},{username}]
     });
    if (existingUser) {
      throw new ApiError(409,"user with email or username already exists")
    }
    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar)&&req.files.avatar.length>0){
         avatarLocalPath = req.files?.avatar[0].path;
    }
 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
 
    const avatarCloudinaryPath = await uploadOnCloudinary(avatarLocalPath);
    const coverImageCloudinaryPath = await uploadOnCloudinary(coverImageLocalPath);


    if(!avatarCloudinaryPath){
        throw new ApiError(400,"Failed to upload avatar")
    }
    const skillsArray = Array.isArray(skill)
    ? skill
    : typeof skill === "string"
    ? skill.split(",").map((s) => s.trim())
    : [];

  const user = await User.create({
    fullName,
    username,
    avatar: avatarCloudinaryPath.url,
    coverImage: coverImageCloudinaryPath?.url || "",
    email,
    skills: skillsArray,
    password,
  });

   
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken" 
    )
    if(!createdUser){
        throw new ApiError(500, "something went wrong while creating a user ")
    }
    return res.status(200).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
});
const loginUser = asyncHandler(async (req,res)=>{

  const {email,username,password} = req.body;

  if(!username && !email){
    throw new ApiError(400,"username and email are required")
  }
  const user = await User.findOne({$or:[{email},{username}]})

  if(!user){
    throw new ApiError(404,"user not found")
  }

  const isPasswordValiid=await user.isPasswordCorrect(password)

  if(!isPasswordValiid){
    throw new ApiError(401,"Invalid user credentials")
  }
  const {accessToken ,refreshToken}= await generateAccessAndRefreshTokens(user._id)
  const loggedInUser = await User.findById(user._id).select("-password  -refreshToken")
const options= {
    httpOnly:true,
    secure:true
}
res.status(200).cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options).json(
    new ApiResponse(200,{ loggedInUser, accessToken, refreshToken},"User logged in successfully")
)

});
const logoutUser = asyncHandler(async (req,res)=>{

    await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken: 1
        }
    },{
        new:true
    })

    const options= {
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,"User logged out successfully")
    )

});
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

}) 
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {currentPassword, newPassword} = req.body
    const user = await User.findById(req.user._id)
    const isPasswordCorrect=await user.isPasswordCorrect(currentPassword)
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid current password")}
        user.password = newPassword
        user.save({validateBeforeSave:false})
        res.status(200).json(new ApiResponse(200,"Password changed successfully"))
})
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,
        req.user,"current user fetched successfully")
    )
})
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body
    if(!fullName ||!email){
        throw new ApiError(400,"Please provide username and email")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        fullName,
        email
        },{
            $set:{
                fullName,
                email
            }
        },{new:true,runValidators:true}).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"Account details updated successfully"))
})
const updateAvatar = asyncHandler(async(req,res)=>{
   const avatarLocalPath = req.file?.path
   if(!avatarLocalPath){
    throw new ApiError(400,"Please upload an  avatar image")
    }
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(500,"Failed to upload avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
       $set:{
        avatar:avatar.url
        }
        },{new:true,runValidators:true}).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"Avatar updated successfully"))

})
const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
     throw new ApiError(400,"Please upload an  cover Image")
     }
     const coverImage= await uploadOnCloudinary(coverImageLocalPath)
     if(!coverImage.url){
         throw new ApiError(500,"Failed to upload coverimage")
     }
     const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:coverImage.url
         }
         },{new:true,runValidators:true}).select("-password")

         return res
        .status(200)
        .json(new ApiResponse(200,user,"cover image updated successfully"))
 
})
 const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }
    
    try {
        const channel = await User.aggregate([
            {
                $match: {
                    username: username.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    subscribedToCount: { $size: "$subscribedTo" },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribedToCount: 1,
                    subscribersCount: 1,
                    avatar: 1,
                    coverImage: 1,
                    isSubscribed: 1,
                    email: 1
                }
            }
        ]);
            
        if (!channel.length) {
            throw new ApiError(404, "Channel does not exist");
        }
    
        res.status(200).json(new ApiResponse(200, channel,"User channel fetched successfully"));
    } catch (error) {
        throw new ApiError(401, error?.message || "error")
    }
    
})
const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
        }
    },{
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[{
                            $project:{
                                _id:1,
                                username:1,
                                avatar:1,
                                fullName:1
                            }
                            
                        }]
                    }
                }
            ]
        }
    },{
        $addFields:{
            owner:{
                $first:"$owner"
            }
        }
    }
    ])

    return res.status(200).json(
        new ApiResponse(200,user[0].watchHistory,"User watch history fetched Successfully")
    )
})


export{registerUser
    ,loginUser
    ,logoutUser
    ,refreshAccessToken
    ,changeCurrentPassword
    ,getCurrentUser
    ,updateAccountDetails
    ,updateAvatar
    ,updateCoverImage
    ,getUserChannelProfile
    ,getWatchHistory}