const express = require("express");
const router = express.Router();
const {
    addHeartRateRecords,
    getHeartRateRecord,
    getAllHeartRateRecords,
    updateHeartRateRecord,
    deleteHeartRateRecord,
    deleteAllHeartRateRecords
} = require("../controllers/heartRate.controller.js");
const verifyUser = require("../middlewares/user.middleware.js");

router.post("/heartRate", verifyUser, addHeartRateRecords);
router.get("/heartRate", verifyUser, getAllHeartRateRecords);
router.get("/heartRate/:heartRateId", verifyUser, getHeartRateRecord);
router.put("/update/:heartRateId", verifyUser, updateHeartRateRecord);
router.delete("/delete", verifyUser, deleteAllHeartRateRecords);
router.delete("/delete/:heartRateId", verifyUser, deleteHeartRateRecord);

module.exports = router;