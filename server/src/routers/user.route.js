const express = require("express");
const router = express.Router();
const verifyUser = require("../middlewares/user.middleware.js");
const uploader = require("../middlewares/multer.middleware.js");
const {
  registerUser,
  loggedInUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  getProfile,
  editProfile
} = require("../controllers/user.controller.js");

router.post("/register", registerUser);
router.post("/login", loggedInUser);
router.post("/logout", verifyUser, logOutUser);
router.post("/refresh-access-token", refreshAccessToken);
router.get("/get-profile", verifyUser, getProfile);
router.put("/change-password", verifyUser, changePassword);
router.put("/edit-profile", verifyUser, uploader.single("avatar"), editProfile);

module.exports = router;