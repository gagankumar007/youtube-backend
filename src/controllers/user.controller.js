import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res)=>
{
    //get user details from frontend

    const {fullName,email,username,password}=req.body
    console.log(email);
    //validation 
    if([fullName,email,username,password].some((field)=>
    field?.trim()==="")){
        throw new ApiError(400,"Please fill all the fields")
    }
    //check if user already exists
    const existingUser = await User.findOne({
        $or:[{email},{username}]
     });
    if (existingUser) {
      throw new ApiError(409,"user with email or username already exists")
    }

   
    //check foro images , check for avatar 
    const avatarLocalPath = req.files?.avatar[0]?.path; //req.files.avatar[0].path
    const cooverImageLocalPath =req.files?.coverImage[0].path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    //upload them to cloudinary , avatar
    const avatarCloudinaryPath = await uploadOnCloudinary(avatarLocalPath);
    const coverImageCloudinaryPath = await uploadOnCloudinary(cooverImageLocalPath);
    if(!avatarCloudinaryPath){
        throw new ApiError(400,"Failed to upload avatar")
    }

    
    //create user object create entry in db 
    const user = await User.create({
        fullName,
        avatar:avatarCloudinaryPath.url,
        coverImage:coverImageCloudinaryPath?.url || "",
        email,
        username:username.toLowerCase(),
        password
    })

    
    //remove password and refresh token field from database

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken" 
    )

    //check for user creation
    if(createdUser){
        throw new ApiError(500, "something went wrong while creating a user ")
    }
    //send response
    return res.status(200).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
})

export {registerUser}