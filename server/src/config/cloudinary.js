const cloudinary = require("cloudinary").v2;
const { error } = require("console");
const fs = require("fs");
const apiError = require("../utils/apiError");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadImageToCloudinary = async(localPath) => {
    if(!localPath){
        throw error;
    }

    try {
        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "image"
        });

        console.log("Image uploaded successfully..");
        return response;
    } catch (error) {
        console.log("Failed to image upload..", error.message);
    } finally {
        fs.existsSync(localPath) && fs.unlinkSync(localPath);
    }
}

module.exports = uploadImageToCloudinary;