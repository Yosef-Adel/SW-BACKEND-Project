const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "DEV",
    },
});


const upload = new multer({storage: storage});
exports.uploadImage = upload.single("image");