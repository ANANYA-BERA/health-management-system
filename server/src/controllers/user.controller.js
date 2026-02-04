const asyncHandler = require("../utils/asyncHandler.js");
const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const User = require("../models/user.model.js");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const uploadImageToCloudinary = require("../config/cloudinary.js");

const tokenAccess = async (checkUserId) => {
  const useridFound = await User.findById(checkUserId);
  const accessToken = useridFound.generateAccessToken(checkUserId);
  const refreshToken = useridFound.generateRefreshToken(checkUserId);
  useridFound.refreshToken = refreshToken;
  await useridFound.save({ validateBeforeSave: true });
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  console.log("REQ BODY =", req.body);
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password ) {
    throw new apiError(400, "All fields are required");
  }
  const existingUser = await User.findOne({  email });
  if (existingUser) {
    throw new apiError(400, "User already exists");
  }

  const updatedUser = await User.create({
    fullName,
    email,
    password,
  });
  const createdUser = await User.findById(updatedUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new apiError(500, "Registration Failed. Try again");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User Registered Successfully"));
});

const loggedInUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  const checkUser = await User.findOne({ email });
  if (!checkUser) {
    throw new apiError(404, "User not found");
  }
  const checkPassword = await checkUser.isPasswordCorrect(password);
  if (!checkPassword) {
    throw new apiError(400, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await tokenAccess(checkUser._id);

  const logedinUser = await User.findById(checkUser._id).select(
    "-password -refreshToken"
  );
  
  const option = {
  httpOnly: true,
  secure: false, // ✅ IMPORTANT for localhost
  sameSite: "lax"
};

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiResponse(
        200,
        { user: logedinUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logOutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined }
    },
    { new: true}
  );

  const option = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).json(
    new apiResponse(200, "", "User logged out successfully..")
  )
});

const refreshAccessToken = asyncHandler(async(req, res) => {
  const isComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!isComingRefreshToken) {
    throw new apiError(400, "Unauthorized access..");
  }

  try {
    const decodeToken = jwt.verify(isComingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodeToken._id);
    if (!user) {
      throw new apiError(401, "Invalid token..");
    }

    if (isComingRefreshToken !== user.refreshToken) {
      throw new apiError(401, "Refresh token is invalid or expired..")
    }

    const { newAccessToken, newRefreshToken } = await tokenAccess(user._id);
    const option = {
      httpOnly: true,
      secure: true
    }

    return res.status(200)
    .cookie("accessToken", newAccessToken, option)
    .cookie("refreshToken", newRefreshToken, option)
    .json(
      new apiResponse(
        200,
        {accessToken: newAccessToken, refreshToken: newRefreshToken},
        "Access token refreshed.."
      )
    )

  } catch (error) {
    throw new apiError(500, error.message);
  }
});

const changePassword = asyncHandler(async(req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user._id;
 
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new apiError(400, "All fields are required..");
  }
  
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new apiError(404, "user not found..");
  }
  
  const correctPassword = await user.isPasswordCorrect(currentPassword);
  if (!correctPassword) {
    throw new apiError(400, "Wrong password..");
  }

  // Check if new password is different from current password
  const isSamePassword = await user.isPasswordCorrect(newPassword);
  if (isSamePassword) {
    throw new apiError(400, "New password must be different from current password..");
  }

  if (newPassword !== confirmPassword) {
    throw new apiError(400, "New and confirm password must be same..");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res.status(200).json(
    new apiResponse(200, "", "Password changed successfully..")
  );
});

const editProfile = asyncHandler(async(req, res) => {
  const { age, height, weight, goal } = req.body;

  const user = await User.findById(req.user._id);
  if(!user){
    throw new apiError(404, "You have to login first..");
  }

  const avatarFilePath = req.file?.path;
  if(!avatarFilePath){
    throw new apiError(400, "Avatar file path is required..");
  }

  if(user.avatarPublicId){
    try {
      await cloudinary.uploader.destroy(user.avatarPublicId, {
        resource_type: "image"
      });
    } catch (error) {
      throw new apiError(400, "Failed to change the avatar..", error.message);
    }
  }

  const avatar = await uploadImageToCloudinary(avatarFilePath);
  if(!avatar){
    throw new apiError(400, "Avatar not found..");
  }

  const updatedFields = {};
  if(age) updatedFields.age = age;
  if(height) updatedFields.height = height;
  if(weight) updatedFields.weight = weight;
  if(goal) updatedFields.goal = goal;
  if(avatar.secure_url) updatedFields.avatar = avatar.secure_url;
  if(avatar.public_id) updatedFields.avatarPublicId = avatar.public_id;

  const updatedProfile = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updatedFields },
    { new: true }
  );

  return res.status(200).json(
    new apiResponse(200, updatedProfile, "Profile updated successfully..")
  )
});

module.exports = {
  registerUser,
  loggedInUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  editProfile
};


