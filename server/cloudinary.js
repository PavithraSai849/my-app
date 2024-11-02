const cloudinary = require("cloudinary").v2;

//configure with env data
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = async (buffer) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) throw new Error("Error uploading to cloudinary");
        return result;
      }
    ).end(buffer);
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading to cloudinary");
  }
};


const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Cloudinary deletion error:", error);
    throw new Error(`Failed to delete asset from Cloudinary: ${error.message}`);
  }
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
