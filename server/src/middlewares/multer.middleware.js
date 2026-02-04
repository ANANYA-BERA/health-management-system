const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, path.join(__dirname, "../../public/temp"));
    },

    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});

const uploder = multer({storage});

module.exports = uploder;