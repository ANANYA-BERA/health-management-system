const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    avatarPublicId: {
        type: String
    },
    age: {
        type: Number
    },
    height: {
        type: Number // in cm
    },
    weight: {
        type: Number // in Kg
    },
    goal: {
        type: String
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: null
    },
    refreshToken:{
        type: String,
    }

}, {timestamps: true});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKE_EXPIRY
        }
    )
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

const User = mongoose.model("User", userSchema);
module.exports = User;