const mongoose = require("mongoose");
require("dotenv").config();

const connectdb = async () => {
    const atlasUri = process.env.MONGODB_URI;

    if (!atlasUri) {
        throw new Error("MONGODB_URI is not defined");
    }

    try {
        mongoose.set("bufferCommands", false);
        mongoose.set("strictQuery", true);
        await mongoose.connect(atlasUri, {
            serverSelectionTimeoutMS: 5000,
            retryWrites: false,
            maxPoolSize: 10,
            socketTimeoutMS: 10000,
            connectTimeoutMS: 5000,
            family: 4
        });
        console.log("Database connected successfully via Atlas");
    } catch (error) {
        console.error(`[MongoDB] Atlas connection failed: ${error.message}`);
        throw error;
    }
};

module.exports = connectdb;
