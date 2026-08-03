const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Product name is required"]
    },

    description:{
        type:String,
        required:[true,"Description is required"]
    },

    price:{
        type:Number,
        required:[true,"price is required"]
    },

    category:{
        type:String,
        required:[true,"category is required"]
    },

    stock:{
        type:Number,
        required:[true,"stock needs to updated"]
    },

    imageURL:{
        type:String,
    
    },

    brand:{
        type:String,
        required:[true,"Brand is needed"]
    },

    rating:{
        type:Number,
        default:0
    },

    reviews:{
        type:Number,
        default:0
    },
    publicId:{
        type:String
    }
},{
    timestamps:true
});

const Product = mongoose.model("Product",productSchema);

module.exports = Product;

