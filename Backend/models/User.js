const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Minimum 3 characters allowed"],
        maxlength: [50, "Maximum 50 characters allowed"]
    },

    age: {
        type: Number,
        default: null
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Prefer not to say", ""],
        default: "Prefer not to say"
    },

    role: {
        type: String,
        default: "user"
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password at least 6 characters"],
        trim: true
    }
}, {
    timestamps: true
});

const User = mongoose.model("User",UserSchema);

module.exports = User;