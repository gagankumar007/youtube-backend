import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError("User not found", 404);
        }

        // Ensure the tokens are awaited
        const accessToken = await user.generateToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        // Log the error for debugging
        console.error("Error generating tokens:", error);
        throw new ApiError("Failed to generate tokens", 500);
    }
};
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

    //check for images , check for avatar 

    const avatarLocalPath = req.files?.avatar[0].path; //req.files.avatar[0].path
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    //upload them to cloudinary 

    const avatarCloudinaryPath = await uploadOnCloudinary(avatarLocalPath);
    const coverImageCloudinaryPath = await uploadOnCloudinary(coverImageLocalPath);
    console.log(avatarCloudinaryPath)

    if(!avatarCloudinaryPath){
        throw new ApiError(400,"Failed to upload avatar")
    }

    //create user object create entry in db 

    const user = await User.create({
        fullName,
        avatar:avatarCloudinaryPath.url,
        coverImage:coverImageCloudinaryPath?.url || "",
        email,
        username:username,
        password
    })

    
    //remove password and refresh token field from database

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken" 
    )

    //check for user creation

    if(!createdUser){
        throw new ApiError(500, "something went wrong while creating a user ")
    }
    //send response

    return res.status(200).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
})
const loginUser = asyncHandler(async (req,res)=>{
  //req body 
  const {email,username,password} = req.body;
  //username or email
  if(!username && !email){
    throw new ApiError(400,"username and email are required")
  }
  //find the user 
  const user = await User.findOne({$or:[{email},{username}]})

  if(!user){
    throw new ApiError(404,"user not found")
  }
  //password check
  const isPasswordValiid=await user.isPasswordCorrect(password)

  if(!isPasswordValiid){
    throw new ApiError(401,"Invalid user credentials")
  }

  //generate token
  const {accessToken ,refreshToken}= await generateAccessAndRefreshTokens(user._id)
  const loggedInUser = await User.findById(user._id).select("-password  -refreshToken")
  //send cokkie
const options= {
    httpOnly:true,
    secure:true
}
res.status(200).cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options).json(
    new ApiResponse(200,{ loggedInUser, accessToken, refreshToken},"User logged in successfully")
)

})
const logoutUser = asyncHandler(async (req,res)=>{

    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken: undefined
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
        new ApiResponse(200,null,"User logged out successfully")
    )

})


export {registerUser,loginUser,logoutUser}