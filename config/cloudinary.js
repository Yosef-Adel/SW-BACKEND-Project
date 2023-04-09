const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");


cloudinary.config({
    cloud_name: "dv2ei7dxk",
    api_key: "475474936472337",
    api_secret: "S8LNETfn2OuHxoVieid59wnIGVQ",
});

exports.storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "DEV",
    },
});



