const asyncHandler = require("../utils/asyncHandler.js");
const apiError = require("../utils/apiError.js");
const apiResponse = require("../utils/apiResponse.js");
const BodyTemp = require("../models/bodyTemp.model.js");

const addBodyTemp = asyncHandler(async(req, res) => {
    const { bodyTemp } = req.body;

    if(!bodyTemp){
        throw new apiError(400, "body temparature is required..");
    }

    let status = "Normal";
    if(bodyTemp > 100) status = "Fever";
    if(bodyTemp < 97) status = "Hypothermia";

    const record = await BodyTemp.create({
        bodyTemp,
        status,
        Date: Date.now(),
        user: req.user._id
    });

    return res.status(201).json(
        new apiResponse(200, record, "Body temparature record added successfully..")
    );
});

const getBodyTempRecord = asyncHandler(async(req, res) => {
    const { bodyTempId } = req.params;

    if(!bodyTempId){
        throw new apiError(400, "Body temparature id is required..");
    }

    const record = await BodyTemp.findById(bodyTempId);

    if(!record){
        throw new apiError(404, "No such record found..");
    }

    return res.status(200).json(
        new apiResponse(200, record, "Body temparature record fetched successfully..")
    )
});

const getAllBodyTempRecord = asyncHandler(async(req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;

    const records = await BodyTemp.find({user: req.user._id})
    .limit(limit * 1)
    .skip((page - 1) * limit);

    if(!records || records.length == 0){
        throw new apiError(400, "No such records found..");
    }

    return res.status(200).json(
        new apiResponse(200, records, "All body temparature records fetched successfuly..")
    )
});

const updateBodyTemp = asyncHandler(async(req, res) => {
    const { bodyTemp } = req.body;
    const{ bodyTempId } = req.params;

    if(!bodyTempId){
        throw new apiError(400, "Body temparature id is required..");
    }

    const record = await BodyTemp.findByOne({
        _id: bodyTempId,
        user: req.user._id
    });

    if(!record){
        throw new apiError(404, "No such record found..");
    }

    const updatedFields = {};
    if(bodyTemp) updatedFields.bodyTemp = bodyTemp;
    if(bodyTemp > 100) updatedFields.status = "Fever"
    else if(bodyTemp < 97) updatedFields.status = "Hypothermia"

    const updatedRecord = await BodyTemp.findByIdAndUpdate(
        bodyTempId,
        { $set: updatedFields },
        {new: true}
    );

    return res.status(200).json(
        new apiResponse(200, updatedRecord, "Record updated successfully..")
    )
});

const deleteBodyTempRecord = asyncHandler(async(req, res) => {
    const { bodyTempId } = req.params;

    if(!bodyTempId){
        throw new apiError(400, "Body temparature id is required..");
    }

    await BodyTemp.findOneAndDelete({
        _id: bodyTempId,
        user: req.user._id
    });

    return res.status(200).json(
        new apiResponse(200, null, "Record deleted successfully..")
    )
});

const deleteAllBodyTempRecords = asyncHandler(async(req, res) => {
    const records = await BodyTemp.find({user: req.user._id});

    if(!records || records.length){
        throw new apiError(404, "No such records found..");
    }

    await BodyTemp.deleteMany({user: req.user._id});

    return res.status(200).json(
        new apiResponse(200, null, "All body temparature records deleted successfully..")
    )
});

module.exports = {
    addBodyTemp,
    getBodyTempRecord,
    getAllBodyTempRecord,
    updateBodyTemp,
    deleteBodyTempRecord,
    deleteAllBodyTempRecords
}