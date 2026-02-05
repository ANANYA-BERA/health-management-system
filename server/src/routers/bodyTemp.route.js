const express = require("express");
const router = express.Router();
const {
    addBodyTemp,
    getBodyTempRecord,
    getAllBodyTempRecord,
    updateBodyTemp,
    deleteBodyTempRecord,
    deleteAllBodyTempRecords
} = require("../controllers/bodyTemp.controller.js");
const verifyUser = require("../middlewares/user.middleware.js");

router.post("/bodyTemp", verifyUser, addBodyTemp);
router.get("/bodyTemp", verifyUser, getAllBodyTempRecord);
router.get("/bodyTemp/:bodyTempId", verifyUser, getBodyTempRecord);
router.put("/update/:bodyTempId", verifyUser, updateBodyTemp);
router.delete("/delete", verifyUser, deleteAllBodyTempRecords);
router.delete("/delete/:bodyTempId", verifyUser, deleteBodyTempRecord);

module.exports = router;